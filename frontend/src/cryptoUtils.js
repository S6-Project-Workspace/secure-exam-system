// ===================================
// CANONICAL JSON SERIALIZATION
// ===================================

/**
 * Canonicalize a JavaScript object to JSON string with sorted keys.
 * This ensures consistent serialization for signing/hashing.
 * @param {Object} obj - Object to canonicalize
 * @returns {string} Canonical JSON string
 */
export function canonicalizeJson(obj) {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalizeJson(item)).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(key => `"${key}":${canonicalizeJson(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

// ===================================
// BASE64 ENCODING/DECODING
// ===================================

export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

export function base64ToArrayBuffer(b64) {
  const binary = window.atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function exportPublicKeyPem(key) {
  const spki = await window.crypto.subtle.exportKey('spki', key);
  const b64 = bufferToBase64(spki);
  return '-----BEGIN PUBLIC KEY-----\n' + b64.match(/.{1,64}/g).join('\n') + '\n-----END PUBLIC KEY-----';
}

export async function importPrivateKeyFromBase64(b64pkcs8) {
  const pkcs8 = base64ToArrayBuffer(b64pkcs8);
  return await window.crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

export async function importRsaOaepPrivateKeyFromBase64(b64pkcs8) {
  // Import an RSA-OAEP private key (PKCS8, base64) for unwrapping/decrypting
  const pkcs8 = base64ToArrayBuffer(b64pkcs8);
  return await window.crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
}

export function pemToBase64(pem) {
  return pem.replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\r|\n/g, '');
}

export async function importRsaOaepPublicKeyFromPem(pem) {
  const b64 = pemToBase64(pem);
  const raw = base64ToArrayBuffer(b64);
  return await window.crypto.subtle.importKey(
    'spki',
    raw,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
}

export async function rsaOaepEncrypt(publicKey, rawArrayBuffer) {
  const cipher = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawArrayBuffer
  );
  return bufferToBase64(cipher);
}

export async function generateAesKey() {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
}

export async function exportAesKeyRaw(key) {
  const raw = await window.crypto.subtle.exportKey('raw', key);
  return bufferToBase64(raw);
}

export async function importAesKeyRaw(b64raw) {
  const raw = base64ToArrayBuffer(b64raw);
  return await window.crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
}

/**
 * Encrypt plaintext using AES-GCM.
 * @param {CryptoKey} key - AES-GCM key
 * @param {string} plaintext - Text to encrypt
 * @returns {Object} Object with cipher (Uint8Array) and iv (Uint8Array)
 */
export async function aesGcmEncrypt(key, plaintext) {
  // AES-GCM: use 12-byte (96-bit) IV for best performance
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipher = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );
  return { cipher: new Uint8Array(cipher), iv };
}

/**
 * Sign data using RSA-PSS private key.
 * @param {CryptoKey} privateKey - RSA-PSS private key
 * @param {Uint8Array} dataUint8 - Data to sign
 * @returns {string} Base64-encoded signature
 */
export async function signWithPrivateKey(privateKey, dataUint8) {
  // RSA-PSS: saltLength must match hash output (SHA-256 = 32 bytes)
  const signature = await window.crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    privateKey,
    dataUint8
  );
  return bufferToBase64(signature);
}

export async function rsaOaepUnwrap(privateKey, wrappedB64) {
  // Decrypt RSA-OAEP wrapped symmetric key (base64) using student's private key
  const wrapped = base64ToArrayBuffer(wrappedB64);
  const raw = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    wrapped
  );
  return raw; // ArrayBuffer of raw AES key bytes
}

export async function aesGcmDecrypt(aesCryptoKey, ivUint8, cipherUint8) {
  // Decrypt AES-GCM ciphertext (ciphertext includes tag appended) and return plaintext string
  const plain = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivUint8 },
    aesCryptoKey,
    cipherUint8
  );
  return new TextDecoder().decode(new Uint8Array(plain));
}

// RSA-PSS public key import from PEM (for signature verification)
export async function importRsaPssPublicKeyFromPem(pem) {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\r|\n/g, '');
  const raw = base64ToArrayBuffer(b64);
  return await window.crypto.subtle.importKey(
    'spki',
    raw,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

// Verify RSA-PSS signature
export async function verifyRsaPssSignature(publicKey, signatureB64, dataUint8) {
  const sigBuf = base64ToArrayBuffer(signatureB64);
  return await window.crypto.subtle.verify(
    { name: 'RSA-PSS', saltLength: 32 },
    publicKey,
    sigBuf,
    dataUint8
  );
}
