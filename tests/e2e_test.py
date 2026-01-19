"""
End-to-end test for secure exam publish and student decrypt flow.

Requirements:
  pip install cryptography requests

Run while backend is running (http://localhost:8000):
  python tests/e2e_test.py

This script will:
 - register instructor and student accounts
 - generate RSA keys for instructor (RSA-PSS) and student (RSA-OAEP)
 - upload their public keys to /keys/upload
 - instructor creates an exam via /exams/create
 - instructor encrypts MCQ JSON with AES-256-GCM, signs ciphertext with RSA-PSS
 - instructor POSTs to /publish/exam
 - student fetches package and wrapped key, unwraps AES key and decrypts the exam
 - verifies signature

Note: This is a test helper for local development only.
"""

import base64
import json
import os
import time
import requests

from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


BASE = os.getenv("BACKEND_URL", "http://localhost:8000")


def b64(u: bytes) -> str:
    return base64.b64encode(u).decode()


def register_and_login(email, password, role="student"):
    r = requests.post(f"{BASE}/auth/register", json={"email": email, "password": password, "role": role})
    if r.status_code not in (200, 201):
        print("Register response:", r.status_code, r.text)
        raise SystemExit("Register failed")

    r2 = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    if r2.status_code != 200:
        print("Login failed:", r2.status_code, r2.text)
        raise SystemExit("Login failed")

    token = r2.json().get("token")
    return token


def gen_rsa_pss_keypair():
    priv = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    pub = priv.public_key()
    pub_pem = pub.public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo)
    priv_pem = priv.private_bytes(encoding=serialization.Encoding.PEM, format=serialization.PrivateFormat.PKCS8,
                                 encryption_algorithm=serialization.NoEncryption())
    return priv, pub_pem, priv_pem


def gen_rsa_oaep_keypair():
    priv = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    pub = priv.public_key()
    pub_pem = pub.public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo)
    priv_pem = priv.private_bytes(encoding=serialization.Encoding.PEM, format=serialization.PrivateFormat.PKCS8,
                                 encryption_algorithm=serialization.NoEncryption())
    return priv, pub_pem, priv_pem


def main():
    ts = int(time.time())
    instr_email = f"instr{ts}@example.test"
    stud_email = f"stud{ts}@example.test"
    password = "TestPass123!"

    print("Registering instructor and student...")
    instr_token = register_and_login(instr_email, password, role="instructor")
    stud_token = register_and_login(stud_email, password, role="student")

    # Generate keys
    print("Generating RSA keys...")
    instr_priv, instr_pub_pem, instr_priv_pem = gen_rsa_pss_keypair()
    stud_priv, stud_pub_pem, stud_priv_pem = gen_rsa_oaep_keypair()

    # Upload public keys
    print("Uploading public keys to backend...")
    h_instr = {"Authorization": f"Bearer {instr_token}"}
    h_stud = {"Authorization": f"Bearer {stud_token}"}

    r = requests.post(f"{BASE}/keys/upload", json={"public_key": instr_pub_pem.decode()}, headers=h_instr)
    if r.status_code != 200:
        print(r.status_code, r.text); raise SystemExit("Instructor key upload failed")

    r = requests.post(f"{BASE}/keys/upload", json={"public_key": stud_pub_pem.decode()}, headers=h_stud)
    if r.status_code != 200:
        print(r.status_code, r.text); raise SystemExit("Student key upload failed")

    # Instructor creates exam
    print("Instructor creating exam...")
    r = requests.post(f"{BASE}/exams/create", json={"title": "E2E Sample", "description": "auto"}, headers=h_instr)
    if r.status_code != 200:
        print(r.status_code, r.text); raise SystemExit("Create exam failed")
    exam = r.json().get("exam")
    # Determine exam_id field
    exam_id = exam.get("exam_id") or exam.get("id") or exam.get("examId")
    if not exam_id:
        print("Create exam returned:", exam); raise SystemExit("Couldn't determine exam_id")
    print("Created exam_id:", exam_id)

    # Prepare MCQ JSON
    mcq = {"title": "Sample Exam", "questions": [{"id": 1, "q": "2+2?", "options": ["3","4","5"], "a": 1}]}
    plaintext = json.dumps(mcq).encode()

    # Generate AES key and encrypt
    aes_key = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(aes_key)
    iv = os.urandom(12)
    ciphertext = aesgcm.encrypt(iv, plaintext, None)  # ciphertext includes tag appended

    # Sign ciphertext with instructor RSA-PSS
    signature = instr_priv.sign(
        ciphertext,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )

    payload = {
        "exam_id": exam_id,
        "encrypted_mcqs": b64(ciphertext),
        "iv": b64(iv),
        "signature": b64(signature),
        "aes_key": b64(aes_key),
    }

    print("Publishing exam package...")
    r = requests.post(f"{BASE}/publish/exam", json=payload, headers=h_instr)
    if r.status_code != 200:
        print(r.status_code, r.text); raise SystemExit("Publish failed")
    print("Publish response:", r.json())

    # Student fetches package
    print("Student fetching package...")
    r = requests.get(f"{BASE}/exams/{exam_id}/package", headers=h_stud)
    if r.status_code != 200:
        print(r.status_code, r.text); raise SystemExit("Fetch package failed")
    pkg = r.json()

    # Student fetches wrapped key
    print("Student fetching wrapped key...")
    r = requests.get(f"{BASE}/exams/{exam_id}/key", headers=h_stud)
    if r.status_code != 200:
        print(r.status_code, r.text); raise SystemExit("Fetch wrapped key failed")
    wrapped_b64 = r.json().get("wrapped_key")

    wrapped = base64.b64decode(wrapped_b64)
    # Unwrap with student's private key (RSA-OAEP)
    raw_aes = stud_priv.decrypt(
        wrapped,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
    )

    if len(raw_aes) != 32:
        raise SystemExit("Unwrapped AES key length unexpected")

    # Decrypt ciphertext
    cipher = base64.b64decode(pkg.get("encrypted_mcqs"))
    iv = base64.b64decode(pkg.get("iv"))
    aesgcm2 = AESGCM(raw_aes)
    plain2 = aesgcm2.decrypt(iv, cipher, None)
    parsed = json.loads(plain2.decode())

    print("Decrypted MCQs:")
    print(json.dumps(parsed, indent=2))

    # Verify signature using instructor public key
    instr_pub = serialization.load_pem_public_key(instr_pub_pem)
    try:
        instr_pub.verify(
            base64.b64decode(pkg.get("signature")),
            cipher,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
        print("Signature verified OK")
    except Exception as e:
        print("Signature verification failed:", e)


if __name__ == "__main__":
    main()
