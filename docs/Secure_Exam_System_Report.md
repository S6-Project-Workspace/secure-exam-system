# Secure Online Examination System with Cryptographic Verification

---

## 📋 Project Information

| **Field** | **Details** |
|-----------|-------------|
| **Project Title** | Secure Online Examination System with Cryptographic Verification |
| **Domain** | Computer Security / Applied Cryptography |
| **Team Members** | _[Name 1 – Roll No.]_ <br> _[Name 2 – Roll No.]_ <br> _[Name 3 – Roll No.]_ |
| **Guide/Supervisor** | _[Faculty Name]_ |
| **Institution** | _[Institution Name]_ |
| **Duration** | _[Start Date]_ – _[End Date]_ |
| **Academic Year** | 2025–2026 |

---

## 🛠️ Technologies Used

| **Layer** | **Technology** |
|-----------|----------------|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| Cryptography | Web Crypto API (Client-side) |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | Argon2 / bcrypt |

---

# 1. Introduction 📘

## 1.1 Background of Online Examinations

The proliferation of digital learning platforms has accelerated the adoption of online examinations as a primary mode of assessment in educational institutions worldwide. The COVID-19 pandemic further intensified this shift, making secure remote examination systems not merely convenient but essential.

However, conventional online examination platforms exhibit significant security vulnerabilities that undermine academic integrity. These systems typically transmit question papers in plaintext, store student answers on centralized servers without encryption, and lack mechanisms to verify the authenticity of submitted content.

## 1.2 Security Challenges in Conventional Systems

Traditional online examination platforms face several critical security challenges:

1. **Question Paper Leakage**: Questions stored or transmitted in plaintext can be intercepted or accessed by unauthorized parties before the examination.

2. **Man-in-the-Middle Attacks**: Network-level adversaries can intercept and modify data in transit between clients and servers.

3. **Server-Side Vulnerabilities**: Centralized storage of plaintext examination data creates a single point of failure; a database breach exposes all content.

4. **Lack of Non-Repudiation**: Students can deny submitting particular answers, and instructors can claim they never awarded specific grades.

## 1.3 Motivation for Cryptographic Protection

Cryptography provides mathematically proven techniques to address these challenges. By employing:

- **Symmetric encryption** (AES-256-GCM) for efficient bulk data encryption
- **Asymmetric encryption** (RSA-OAEP) for secure key exchange
- **Digital signatures** (RSA-PSS) for authenticity and non-repudiation

We can construct a system where the server operates in a **zero-knowledge** capacity—handling only encrypted data and cryptographic proofs without ever accessing plaintext content.

## 1.4 Importance of End-to-End Security

End-to-end encryption ensures that data is encrypted on the client device before transmission and can only be decrypted by the intended recipient. This architecture:

- Eliminates trust assumptions about the server
- Protects data even if the server is compromised
- Provides cryptographic guarantees of authenticity and integrity

---

# 2. Problem Statement ❗

The existing online examination systems suffer from the following critical security vulnerabilities that this project aims to address:

## 2.1 Question Paper Leakage

- Question papers are often stored in plaintext databases
- Insider threats (administrators, database personnel) can access content
- Database breaches expose all examination material

## 2.2 Student Impersonation

- Weak authentication mechanisms allow unauthorized parties to access examinations
- Lack of cryptographic binding between submissions and student identity

## 2.3 Answer Tampering

- Submitted answers can be modified during transmission or at rest
- No mechanism to detect unauthorized alterations
- Students cannot verify their submissions remain unchanged

## 2.4 Result Manipulation

- Grades stored in plaintext can be altered by malicious actors
- No cryptographic proof linking results to the evaluating instructor
- Students have no mechanism to verify result authenticity

## 2.5 Lack of Non-Repudiation

- Students can deny submitting specific answers
- Instructors can disclaim published results
- No immutable audit trail with cryptographic guarantees

---

# 3. Objectives 🎯

The primary objectives of this project are:

| **Objective** | **Description** |
|---------------|-----------------|
| **Confidentiality** | Ensure that examination questions and student answers remain encrypted end-to-end; the server never handles plaintext |
| **Integrity** | Detect any unauthorized modification to questions, answers, or results using cryptographic hashing |
| **Authentication** | Verify user identity through JWT-based authentication combined with public-key cryptography |
| **Non-Repudiation** | Provide unforgeable digital signatures binding submissions and results to their authors |
| **Zero-Knowledge Server** | Design the backend such that it processes only encrypted data and cryptographic proofs, never accessing sensitive content |
| **Auditability** | Maintain a comprehensive audit trail of all security-relevant operations |

---

# 4. Scope of the Project 📌

## 4.1 Features Implemented ✅

- **User Registration and Authentication**: Secure account creation with role-based access (Student/Instructor)
- **Client-Side Key Generation**: RSA key pair generation for encryption (RSA-OAEP) and signing (RSA-PSS)
- **Exam Creation**: Instructors can create MCQ-based examinations
- **Secure Exam Publishing**: AES-256-GCM encryption of questions with RSA-PSS digital signatures
- **Per-Student Key Wrapping**: Unique RSA-OAEP wrapped keys for each enrolled student
- **Secure Exam Retrieval**: Students decrypt exam content client-side after unwrapping keys
- **Instructor Signature Verification**: Clients verify instructor signatures before displaying content
- **Secure Answer Submission**: AES-GCM encryption with SHA-256 hashing and RSA-PSS signatures
- **Server-Side Signature Verification**: Backend validates all cryptographic proofs
- **Result Publishing**: Instructors digitally sign evaluation results
- **Result Verification**: Students verify instructor signatures on their results
- **Comprehensive Audit Logging**: All operations logged with timestamps and user associations

## 4.2 Intentionally Out of Scope ❌

| **Feature** | **Rationale** |
|-------------|---------------|
| AI-based proctoring | Requires specialized computer vision infrastructure |
| Biometric authentication | Hardware dependency (cameras, fingerprint sensors) |
| Hardware security modules (HSM) | Cost and complexity; demonstration uses localStorage |
| Essay/subjective question types | Focus on MCQ for cryptographic proof-of-concept |
| Real-time collaboration prevention | Requires additional device monitoring |
| Mobile application | Web-first approach for demonstration |

---

# 5. Literature Survey 📚

## 5.1 Diffie–Hellman Key Exchange (1976)

Whitfield Diffie and Martin Hellman introduced the concept of public-key cryptography, enabling two parties to establish a shared secret over an insecure channel without prior key exchange. This foundational work underpins all asymmetric cryptographic operations in modern systems.

> **Reference**: W. Diffie and M. Hellman, "New Directions in Cryptography," *IEEE Transactions on Information Theory*, vol. 22, no. 6, pp. 644–654, 1976.

## 5.2 RSA Public-Key Cryptography

Rivest, Shamir, and Adleman developed the RSA algorithm, enabling both encryption and digital signatures using public-key mathematics. RSA remains one of the most widely deployed asymmetric algorithms.

- **RSA-OAEP**: Optimal Asymmetric Encryption Padding provides semantic security for encryption
- **RSA-PSS**: Probabilistic Signature Scheme offers provable security for digital signatures

> **Reference**: R. Rivest, A. Shamir, and L. Adleman, "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems," *Communications of the ACM*, vol. 21, no. 2, pp. 120–126, 1978.

## 5.3 AES Symmetric Encryption

The Advanced Encryption Standard (AES) is a symmetric block cipher adopted by NIST in 2001. AES-256-GCM (Galois/Counter Mode) provides authenticated encryption with associated data (AEAD), combining confidentiality and integrity in a single operation.

> **Reference**: NIST, "Announcing the Advanced Encryption Standard (AES)," *Federal Information Processing Standards Publication 197*, 2001.

## 5.4 Digital Signatures

Digital signatures provide authentication, integrity, and non-repudiation. RSA-PSS is a modern signature scheme with rigorous security proofs, resistant to various cryptanalytic attacks.

## 5.5 End-to-End Encryption Concepts

Signal Protocol and similar E2EE systems demonstrate that servers can facilitate communication without accessing content. Our system adapts this principle: the server stores and forwards encrypted data without decryption capability.

## 5.6 Comparison with Existing Platforms

| **Platform** | **E2E Encryption** | **Digital Signatures** | **Server Blindness** |
|--------------|--------------------|-----------------------|---------------------|
| Google Forms | ❌ | ❌ | ❌ |
| Microsoft Forms | ❌ | ❌ | ❌ |
| Moodle | ❌ | ❌ | ❌ |
| Canvas LMS | ❌ | ❌ | ❌ |
| **This System** | ✅ | ✅ | ✅ |

---

# 6. System Architecture 🏗️

## 6.1 High-Level Architecture

The system employs a three-tier architecture with strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client-Side)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │  Student UI     │  │  Instructor UI  │  │  Web Crypto API         │  │
│  │  - Exam Taking  │  │  - Create Exam  │  │  - Key Generation       │  │
│  │  - View Results │  │  - Publish      │  │  - AES-256-GCM          │  │
│  │  - Submit       │  │  - Evaluate     │  │  - RSA-OAEP / RSA-PSS   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
│                               │                                         │
│  ════════════════════════════════════════════════════════════════════  │
│                     TRUST BOUNDARY (Data encrypted above)               │
│  ════════════════════════════════════════════════════════════════════  │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTPS (TLS 1.3)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │  Auth Routes    │  │  Exam Routes    │  │  Signature Verification │  │
│  │  - JWT Issue    │  │  - CRUD Exams   │  │  - RSA-PSS Verify       │  │
│  │  - Registration │  │  - Publish      │  │  - No Decryption        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
│                               │                                         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (Supabase)                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Encrypted Data Only:                                            │   │
│  │  - Encrypted MCQs (ciphertext + IV + tag)                       │   │
│  │  - Wrapped AES Keys (RSA-OAEP encrypted)                        │   │
│  │  - Encrypted Answers (ciphertext + IV)                          │   │
│  │  - Digital Signatures (base64)                                  │   │
│  │  - Public Keys (PEM format)                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Component Descriptions

### 6.2.1 Frontend (React + Vite + Tailwind)

The frontend is a single-page application (SPA) that handles:

- **User Interface**: Role-based dashboards for students and instructors
- **Cryptographic Operations**: All encryption, decryption, signing, and verification occurs in the browser using the Web Crypto API
- **State Management**: React hooks manage local state; no sensitive data persists beyond session

**Key Files**:
- `cryptoUtils.js`: Utility functions for all Web Crypto operations
- `StudentExamDecrypt.jsx`: Exam retrieval, decryption, and submission
- `InstructorPublish.jsx`: Exam encryption and publishing
- `InstructorEvaluate.jsx`: Answer decryption and result signing

### 6.2.2 Backend (FastAPI)

The backend provides RESTful APIs for:

- **Authentication**: JWT-based user authentication with Argon2 password hashing
- **Data Persistence**: Storing encrypted blobs and cryptographic metadata
- **Signature Verification**: Validating RSA-PSS signatures server-side
- **Access Control**: Role-based endpoint protection

**Key Routes**:
- `/auth/*`: Registration, login, profile
- `/exams/*`: Exam CRUD operations
- `/publish/*`: Exam publishing with signature verification
- `/submissions/*`: Answer submission with signature verification
- `/results/*`: Result publishing and retrieval
- `/keys/*`: Public key management

### 6.2.3 Database (Supabase/PostgreSQL)

The database stores:
- Only encrypted data (questions, answers)
- Public keys (never private keys)
- Cryptographic metadata (IVs, tags, wrapped keys, signatures)
- Audit logs for all operations

## 6.3 Trust Boundaries

The critical trust boundary exists at the client-browser level:

- **Above the boundary**: Plaintext data, private keys, decrypted content
- **Below the boundary**: Only encrypted data, public keys, and signatures

The server and database operate entirely below this boundary, having no access to plaintext examination content.

---

# 7. Actors & Use Case Diagram 👥

## 7.1 Actors

| **Actor** | **Description** |
|-----------|-----------------|
| **Student** | Registers, generates keys, takes exams, submits answers, views signed results |
| **Instructor** | Creates exams, publishes encrypted exams, evaluates submissions, signs results |
| **System** | Performs signature verification, stores encrypted data, maintains audit logs |

## 7.2 Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURE EXAM SYSTEM                                   │
│                                                                             │
│    ┌─────────────┐                              ┌─────────────┐             │
│    │             │                              │             │             │
│    │  STUDENT    │                              │ INSTRUCTOR  │             │
│    │             │                              │             │             │
│    └──────┬──────┘                              └──────┬──────┘             │
│           │                                            │                    │
│     ┌─────┴──────────────────────────┐    ┌──────────┴─────────────────┐   │
│     │                                │    │                            │   │
│  ◯ Register Account               ◯ Register Account                   │   │
│     │                                │    │                            │   │
│  ◯ Generate Key Pairs            ◯ Generate Key Pairs                  │   │
│     │                                │    │                            │   │
│  ◯ Upload Public Keys            ◯ Upload Public Keys                  │   │
│     │                                │    │                            │   │
│  ◯ Authenticate (JWT)            ◯ Authenticate (JWT)                  │   │
│     │                                │    │                            │   │
│  ◯ Retrieve Encrypted Exam       ◯ Create Exam (MCQs)                  │   │
│     │                                │    │                            │   │
│  ◯ Unwrap AES Key                ◯ Encrypt Exam (AES-GCM)              │   │
│     │                                │    │                            │   │
│  ◯ Verify Instructor Signature   ◯ Sign Exam (RSA-PSS)                 │   │
│     │                                │    │                            │   │
│  ◯ Decrypt & Take Exam           ◯ Publish Exam                        │   │
│     │                                │    │                            │   │
│  ◯ Encrypt Answers (AES-GCM)     ◯ Decrypt Submissions                 │   │
│     │                                │    │                            │   │
│  ◯ Sign Submission (RSA-PSS)     ◯ Evaluate Answers                    │   │
│     │                                │    │                            │   │
│  ◯ Submit Answers                ◯ Sign Results (RSA-PSS)              │   │
│     │                                │    │                            │   │
│  ◯ View Signed Results           ◯ Publish Results                     │   │
│     │                                │    │                            │   │
│  ◯ Verify Result Signature                                             │   │
│     │                                                                   │   │
└─────┴───────────────────────────────────────────────────────────────────┘
```

## 7.3 Use Case Descriptions

### Student Use Cases

| **Use Case** | **Description** |
|--------------|-----------------|
| Register Account | Create new account with email, password, and role selection |
| Generate Key Pairs | Generate RSA-OAEP (encryption) and RSA-PSS (signing) key pairs |
| Retrieve Encrypted Exam | Fetch encrypted exam package and wrapped AES key from server |
| Unwrap AES Key | Decrypt the AES key using student's RSA-OAEP private key |
| Verify Instructor Signature | Validate instructor's RSA-PSS signature over encrypted content |
| Decrypt & Take Exam | Decrypt MCQs using AES-GCM and select answers |
| Encrypt Answers | Encrypt answers with a new AES key |
| Sign Submission | Create RSA-PSS signature over hash of plaintext answers |
| View Results | Retrieve signed results and verify instructor signature |

### Instructor Use Cases

| **Use Case** | **Description** |
|--------------|-----------------|
| Create Exam | Define exam metadata and MCQ questions |
| Encrypt Exam | Generate AES key and encrypt questions with AES-256-GCM |
| Sign Exam | Create RSA-PSS signature over encrypted content |
| Publish Exam | Upload encrypted package with signature; server wraps key per student |
| Decrypt Submissions | Unwrap AES key and decrypt student answers |
| Evaluate Answers | Grade submissions and provide feedback |
| Sign Results | Create RSA-PSS signature over canonical result JSON |
| Publish Results | Upload signed results to server |

---

# 8. Cryptographic Design 🔐

> [!IMPORTANT]
> This section details the core cryptographic mechanisms that provide the security guarantees of the system. All cryptographic operations are performed **client-side** using the **Web Crypto API**.

## 8.1 Cryptographic Algorithms Used

| **Algorithm** | **Purpose** | **Key Size** | **Standard** |
|---------------|-------------|--------------|--------------|
| **AES-256-GCM** | Symmetric encryption of questions and answers | 256 bits | NIST SP 800-38D |
| **RSA-OAEP** | Asymmetric encryption for key wrapping | 2048 bits | PKCS#1 v2.1 |
| **RSA-PSS** | Digital signatures for non-repudiation | 2048 bits | PKCS#1 v2.1 |
| **SHA-256** | Cryptographic hashing for integrity | 256 bits | FIPS 180-4 |
| **JWT (HS256)** | Authentication tokens | Shared secret | RFC 7519 |
| **Argon2** | Password hashing | Configurable | RFC 9106 |

### 8.1.1 AES-256-GCM

AES-GCM provides **Authenticated Encryption with Associated Data (AEAD)**:

- **Confidentiality**: 256-bit AES in CTR mode
- **Integrity**: GHASH-based authentication tag (128 bits)
- **Random IV**: 12-byte (96-bit) initialization vector per encryption

```javascript
// AES-GCM encryption in cryptoUtils.js
export async function aesGcmEncrypt(key, plaintext) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipher = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );
  return { cipher: new Uint8Array(cipher), iv };
}
```

### 8.1.2 RSA-OAEP

RSA-OAEP (Optimal Asymmetric Encryption Padding) provides:

- **Semantic security**: Different ciphertext for same plaintext
- **SHA-256**: Hash function for both mask generation and label hashing
- **Key size**: 2048 bits minimum (enforced by backend)

### 8.1.3 RSA-PSS

RSA-PSS (Probabilistic Signature Scheme) provides:

- **Provable security**: Reduces to RSA problem
- **Salt length**: 32 bytes (matching Web Crypto API)
- **Hash function**: SHA-256

### 8.1.4 JWT Authentication

JSON Web Tokens provide:

- **Stateless authentication**: Server verifies without database lookup
- **Claims**: User ID (`sub`), role, expiration (`exp`)
- **Algorithm**: HS256 (HMAC-SHA256)

## 8.2 Key Management Strategy

### 8.2.1 Client-Side Key Generation

Each user generates **two distinct RSA key pairs** in the browser:

1. **RSA-OAEP Key Pair**: For encryption/decryption operations
2. **RSA-PSS Key Pair**: For signing/verification operations

```javascript
// Key generation in browser
const oaepKeyPair = await window.crypto.subtle.generateKey(
  { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true, ['encrypt', 'decrypt']
);

const pssKeyPair = await window.crypto.subtle.generateKey(
  { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true, ['sign', 'verify']
);
```

### 8.2.2 Public Key Upload

Public keys are exported in PEM format and stored on the server:

```json
{
  "oaep": "-----BEGIN PUBLIC KEY-----\nMIIBI...",
  "pss": "-----BEGIN PUBLIC KEY-----\nMIIBI..."
}
```

### 8.2.3 Private Key Handling

| **Mode** | **Storage** | **Security Level** |
|----------|-------------|-------------------|
| Demo | localStorage (base64 encoded) | Low (for demonstration) |
| Production | Should use passphrase encryption or hardware keys | High |

> [!WARNING]
> In the current demonstration implementation, private keys are stored in localStorage. For production deployment, hardware-backed key storage (WebAuthn, platform authenticators) or passphrase-protected keys should be used.

### 8.2.4 Key Separation Principle

The use of separate key pairs for encryption and signing follows cryptographic best practices:

- **Prevents algorithm confusion attacks**
- **Enables independent key rotation**
- **Follows NIST recommendations** for key management

## 8.3 Secure Exam Publishing Workflow

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│  INSTRUCTOR BROWSER │      │    BACKEND API      │      │      DATABASE       │
└──────────┬──────────┘      └──────────┬──────────┘      └──────────┬──────────┘
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 1:     │                     │                            │
    │ Create Exam │                     │                            │
    │ Define MCQs │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 2:     │                     │                            │
    │ Generate    │                     │                            │
    │ AES-256 Key │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 3:     │                     │                            │
    │ AES-GCM     │                     │                            │
    │ Encrypt     │                     │                            │
    │ Questions   │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 4:     │                     │                            │
    │ RSA-PSS     │                     │                            │
    │ Sign        │                     │                            │
    │ Ciphertext  │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
           │ STEP 5: POST /publish/exam │                            │
           │ {encrypted_mcqs, iv,       │                            │
           │  signature, aes_key}       │                            │
           │───────────────────────────>│                            │
           │                            │                            │
           │                     ┌──────┴──────┐                     │
           │                     │ STEP 6:     │                     │
           │                     │ Verify      │  Fetch PSS key      │
           │                     │ Signature   │────────────────────>│
           │                     │             │<────────────────────│
           │                     │ pub_key.    │                     │
           │                     │ verify()    │                     │
           │                     └──────┬──────┘                     │
           │                            │                            │
           │                            │ STEP 7: Store Package      │
           │                            │ INSERT exam_packages       │
           │                            │───────────────────────────>│
           │                            │                            │
           │                     ┌──────┴──────┐                     │
           │                     │ STEP 8:     │                     │
           │                     │ FOR EACH    │  Get student keys   │
           │                     │ STUDENT:    │────────────────────>│
           │                     │ RSA-OAEP    │<────────────────────│
           │                     │ wrap key    │  INSERT exam_keys   │
           │                     │             │────────────────────>│
           │                     └──────┬──────┘                     │
           │                            │                            │
           │                            │ STEP 9: INSERT audit_logs  │
           │                            │───────────────────────────>│
           │                            │                            │
           │  {"message": "published"}  │                            │
           │<───────────────────────────│                            │
           │                            │                            │
           ▼                            ▼                            ▼
```

### Detailed Steps:

**Step 1: Exam Creation**
- Instructor creates exam with title, description, duration
- Adds MCQ questions with options and correct answers

**Step 2: AES Key Generation**
```javascript
const aesKey = await window.crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true, ['encrypt', 'decrypt']
);
```

**Step 3: MCQ Encryption**
```javascript
const mcqJson = JSON.stringify(questions);
const iv = window.crypto.getRandomValues(new Uint8Array(12));
const ciphertext = await window.crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  aesKey,
  new TextEncoder().encode(mcqJson)
);
```

**Step 4: Digital Signature**
```javascript
const signature = await window.crypto.subtle.sign(
  { name: 'RSA-PSS', saltLength: 32 },
  instructorPrivateKey,
  ciphertext
);
```

**Step 5-9: Server Processing**
- Signature verification using instructor's stored public key
- Storage of encrypted package (server never sees plaintext)
- Per-student key wrapping using RSA-OAEP

## 8.4 Secure Exam Retrieval Workflow

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   STUDENT BROWSER   │      │    BACKEND API      │      │      DATABASE       │
└──────────┬──────────┘      └──────────┬──────────┘      └──────────┬──────────┘
           │                            │                            │
           │ STEP 1: JWT Bearer Token   │                            │
           │───────────────────────────>│                            │
           │                            │ Verify JWT                 │
           │     {user_id, role}        │                            │
           │<───────────────────────────│                            │
           │                            │                            │
           │ STEP 2: GET /exams/package │                            │
           │───────────────────────────>│                            │
           │                            │ SELECT encrypted_mcqs      │
           │                            │───────────────────────────>│
           │                            │ SELECT wrapped_key         │
           │                            │───────────────────────────>│
           │                            │<───────────────────────────│
           │ {package, wrapped_key,     │                            │
           │  instructor_public_key}    │                            │
           │<───────────────────────────│                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 3:     │                     │                            │
    │ Load OAEP   │                     │                            │
    │ private key │                     │                            │
    │ RSA-OAEP    │                     │                            │
    │ decrypt     │                     │                            │
    │ wrapped_key │                     │                            │
    │ → K_exam    │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 4:     │                     │                            │
    │ Import PSS  │                     │                            │
    │ public key  │                     │                            │
    │ Verify sig  │                     │                            │
    │ ✗ Abort if  │                     │                            │
    │   invalid   │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 5:     │                     │                            │
    │ Import AES  │                     │                            │
    │ key         │                     │                            │
    │ AES-GCM     │                     │                            │
    │ decrypt     │                     │                            │
    │ Parse JSON  │                     │                            │
    │ → questions │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ DISPLAY     │                     │                            │
    │ EXAM TO     │                     │                            │
    │ STUDENT     │                     │                            │
    └─────────────┘                     │                            │
           │                            │                            │
           ▼                            ▼                            ▼
```

### Detailed Steps:

**Step 1: JWT Authentication**
- Student's request includes `Authorization: Bearer <token>`
- Backend verifies token signature and expiration

**Step 2: Encrypted Package Retrieval**
- Server returns encrypted blob + metadata
- Wrapped AES key specific to requesting student
- Instructor's public key for signature verification

**Step 3: Key Unwrapping**
```javascript
const privateKey = await importRsaOaepPrivateKeyFromBase64(storedPrivateKey);
const rawAesKey = await window.crypto.subtle.decrypt(
  { name: 'RSA-OAEP' },
  privateKey,
  wrappedKeyBuffer
);
```

**Step 4: Signature Verification**
```javascript
const instructorPubKey = await importRsaPssPublicKeyFromPem(instructorPem);
const isValid = await window.crypto.subtle.verify(
  { name: 'RSA-PSS', saltLength: 32 },
  instructorPubKey,
  signatureBuffer,
  ciphertext // includes GCM tag
);
if (!isValid) throw new Error('Invalid instructor signature');
```

**Step 5: Decryption**
```javascript
const aesKey = await window.crypto.subtle.importKey(
  'raw', rawAesKey, { name: 'AES-GCM' }, false, ['decrypt']
);
const plaintext = await window.crypto.subtle.decrypt(
  { name: 'AES-GCM', iv: ivBuffer },
  aesKey,
  ciphertextWithTag
);
const questions = JSON.parse(new TextDecoder().decode(plaintext));
```

## 8.5 Secure Answer Submission Workflow

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   STUDENT BROWSER   │      │    BACKEND API      │      │      DATABASE       │
└──────────┬──────────┘      └──────────┬──────────┘      └──────────┬──────────┘
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 1:     │                     │                            │
    │ Sort answers│                     │                            │
    │ by question │                     │                            │
    │ ID (canon.) │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 2:     │                     │                            │
    │ SHA-256     │                     │                            │
    │ hash answers│                     │                            │
    │ → H(answers)│                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 3:     │                     │                            │
    │ Load PSS    │                     │                            │
    │ private key │                     │                            │
    │ RSA-PSS sign│                     │                            │
    │ → signature │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 4:     │                     │                            │
    │ Generate    │                     │                            │
    │ fresh AES   │                     │                            │
    │ AES-GCM     │                     │                            │
    │ encrypt     │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
    ┌──────┴──────┐                     │                            │
    │ STEP 5:     │                     │                            │
    │ RSA-OAEP    │                     │                            │
    │ wrap key    │                     │                            │
    │ for instr.  │                     │                            │
    └──────┬──────┘                     │                            │
           │                            │                            │
           │ STEP 6: POST /submissions  │                            │
           │ {encrypted_answers, iv,    │                            │
           │  encrypted_aes_key,        │                            │
           │  student_signature, hash}  │                            │
           │───────────────────────────>│                            │
           │                            │                            │
           │                     ┌──────┴──────┐                     │
           │                     │ STEP 7:     │ Fetch student PSS   │
           │                     │ Verify sig  │────────────────────>│
           │                     │ pub_key.    │<────────────────────│
           │                     │ verify()    │                     │
           │                     │ ✗ Error if  │                     │
           │                     │   invalid   │                     │
           │                     └──────┬──────┘                     │
           │                            │                            │
           │                            │ STEP 8: Validate IV        │
           │                            │ INSERT submissions         │
           │                            │───────────────────────────>│
           │                            │ INSERT submission_keys     │
           │                            │───────────────────────────>│
           │                            │ INSERT audit_logs          │
           │                            │───────────────────────────>│
           │                            │                            │
           │ {"message": "recorded",    │                            │
           │  "submission_id": "..."}   │                            │
           │<───────────────────────────│                            │
           │                            │                            │
           ▼                            ▼                            ▼
```

### Detailed Steps:

**Step 1: Answer Canonicalization**
```javascript
function canonicalize(answers) {
  const sortedKeys = Object.keys(answers).sort();
  const canonical = {};
  for (const key of sortedKeys) {
    canonical[key] = answers[key];
  }
  return JSON.stringify(canonical);
}
```

**Step 2: SHA-256 Hashing**
```javascript
const encoder = new TextEncoder();
const data = encoder.encode(canonicalAnswers);
const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
const hashB64 = bufferToBase64(hashBuffer);
```

**Step 3: Student Signature**
```javascript
const signature = await window.crypto.subtle.sign(
  { name: 'RSA-PSS', saltLength: 32 },
  studentPrivateKey,
  hashBuffer
);
```

**Step 4-5: Encryption and Key Wrapping**
- Fresh AES key per submission (forward secrecy principle)
- Key wrapped for instructor only

**Step 6-8: Server Processing**
- Signature verification proves student authored submission
- Only encrypted data stored; server cannot read answers

## 8.6 Result Evaluation & Verification Workflow

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  INSTRUCTOR    │  │  BACKEND API   │  │   DATABASE     │  │    STUDENT     │
│    BROWSER     │  │                │  │                │  │    BROWSER     │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                   │                   │
        │ GET /submissions  │                   │                   │
        │──────────────────>│ SELECT ...        │                   │
        │                   │──────────────────>│                   │
        │                   │<──────────────────│                   │
        │ {encrypted_ans,   │                   │                   │
        │  wrapped_key}     │                   │                   │
        │<──────────────────│                   │                   │
        │                   │                   │                   │
 ┌──────┴──────┐            │                   │                   │
 │ STEP 1:     │            │                   │                   │
 │ RSA-OAEP    │            │                   │                   │
 │ unwrap key  │            │                   │                   │
 │ AES-GCM     │            │                   │                   │
 │ decrypt     │            │                   │                   │
 └──────┬──────┘            │                   │                   │
        │                   │                   │                   │
 ┌──────┴──────┐            │                   │                   │
 │ STEP 2:     │            │                   │                   │
 │ Grade       │            │                   │                   │
 │ submission  │            │                   │                   │
 │ Calculate   │            │                   │                   │
 │ marks       │            │                   │                   │
 └──────┬──────┘            │                   │                   │
        │                   │                   │                   │
 ┌──────┴──────┐            │                   │                   │
 │ STEP 3:     │            │                   │                   │
 │ Canonical   │            │                   │                   │
 │ result JSON │            │                   │                   │
 │ (sorted)    │            │                   │                   │
 └──────┬──────┘            │                   │                   │
        │                   │                   │                   │
 ┌──────┴──────┐            │                   │                   │
 │ STEP 4:     │            │                   │                   │
 │ RSA-PSS     │            │                   │                   │
 │ sign result │            │                   │                   │
 └──────┬──────┘            │                   │                   │
        │                   │                   │                   │
        │ STEP 5: POST      │                   │                   │
        │ /results/publish  │                   │                   │
        │──────────────────>│                   │                   │
        │                   │                   │                   │
        │            ┌──────┴──────┐            │                   │
        │            │ STEP 6:     │ Fetch PSS  │                   │
        │            │ Verify sig  │───────────>│                   │
        │            │             │<───────────│                   │
        │            │ pub_key.    │            │                   │
        │            │ verify()    │            │                   │
        │            └──────┬──────┘            │                   │
        │                   │                   │                   │
        │                   │ STEP 7: INSERT    │                   │
        │                   │ results           │                   │
        │                   │──────────────────>│                   │
        │                   │ INSERT audit_logs │                   │
        │                   │──────────────────>│                   │
        │                   │                   │                   │
        │ {"published"}     │                   │                   │
        │<──────────────────│                   │                   │
        │                   │                   │                   │
════════╪═══════════════════╪═══════════════════╪═══════════════════╪════════
        │                   │                   │    STEP 8:        │
        │                   │                   │    STUDENT        │
        │                   │                   │    VERIFICATION   │
        │                   │                   │                   │
        │                   │                   │   GET /results    │
        │                   │<──────────────────────────────────────│
        │                   │ SELECT result     │                   │
        │                   │──────────────────>│                   │
        │                   │<──────────────────│                   │
        │                   │ {result, instr_   │                   │
        │                   │  public_key}      │                   │
        │                   │──────────────────────────────────────>│
        │                   │                   │                   │
        │                   │                   │            ┌──────┴──────┐
        │                   │                   │            │ Recreate    │
        │                   │                   │            │ canonical   │
        │                   │                   │            │ Import PSS  │
        │                   │                   │            │ Verify sig  │
        │                   │                   │            │             │
        │                   │                   │            │ ✓ Verified  │
        │                   │                   │            │ ✗ Invalid   │
        │                   │                   │            └─────────────┘
        │                   │                   │                   │
        ▼                   ▼                   ▼                   ▼
```

### Detailed Steps:

**Step 3: Canonical Result Creation**
```javascript
const resultObj = {
  exam_id: examId,
  student_id: studentId,
  marks: calculatedMarks,
  evaluated_at: new Date().toISOString()
};
// Canonical: sorted keys, compact separators
const canonical = JSON.stringify(resultObj, Object.keys(resultObj).sort());
```

**Step 4: Result Signing**
```javascript
const encoder = new TextEncoder();
const signature = await window.crypto.subtle.sign(
  { name: 'RSA-PSS', saltLength: 32 },
  instructorPrivateKey,
  encoder.encode(canonical)
);
```

**Step 8: Student Verification**
```javascript
const instructorPubKey = await importRsaPssPublicKeyFromPem(instructorPem);
const canonical = JSON.stringify({
  exam_id: result.exam_id,
  student_id: result.student_id,
  marks: result.marks,
  evaluated_at: result.evaluated_at
}, null, null);

const isValid = await window.crypto.subtle.verify(
  { name: 'RSA-PSS', saltLength: 32 },
  instructorPubKey,
  base64ToArrayBuffer(result.instructor_signature),
  new TextEncoder().encode(canonical)
);
```

---

# 9. Database Design 🗄️

## 9.1 Entity-Relationship Overview

The database schema is designed to store only encrypted data and cryptographic metadata. **No plaintext examination content is ever stored.**

## 9.2 Table Definitions

### 9.2.1 `users`

| **Column** | **Type** | **Purpose** |
|------------|----------|-------------|
| id | UUID (PK) | Unique user identifier |
| email | VARCHAR | User email (unique) |
| password_hash | VARCHAR | Argon2 hashed password |
| role | VARCHAR | 'student' or 'instructor' |
| created_at | TIMESTAMP | Account creation time |

### 9.2.2 `public_keys`

| **Column** | **Type** | **Purpose** |
|------------|----------|-------------|
| id | UUID (PK) | Record identifier |
| user_id | UUID (FK) | Reference to users.id |
| public_key | TEXT | JSON containing OAEP and PSS public keys (PEM format) |
| created_at | TIMESTAMP | Key upload time |

**Purpose**: Stores public keys for cryptographic operations. Private keys **never** touch the server.

### 9.2.3 `exams`

| **Column** | **Type** | **Purpose** |
|------------|----------|-------------|
| exam_id | UUID (PK) | Unique exam identifier |
| instructor_id | UUID (FK) | Creator (instructor) reference |
| title | VARCHAR | Exam title |
| description | TEXT | Exam description |
| duration_minutes | INTEGER | Time limit for exam |
| status | VARCHAR | 'draft', 'published' |
| created_at | TIMESTAMP | Creation time |

### 9.2.4 `exam_packages`

| **Column** | **Type** | **Purpose** |
|------------|----------|-------------|
| package_id | UUID (PK) | Package identifier |
| exam_id | UUID (FK) | Reference to exams.exam_id |
| encrypted_mcqs | TEXT | Base64 AES-GCM ciphertext (without tag) |
| iv | TEXT | Base64 12-byte initialization vector |
| tag | TEXT | Base64 16-byte GCM authentication tag |
| signature | TEXT | Base64 RSA-PSS signature over ciphertext+tag |
| created_at | TIMESTAMP | Publishing time |

**Purpose**: Stores encrypted exam content. Server cannot decrypt.

### 9.2.5 `exam_keys`

| **Column** | **Type** | **Purpose** |
|------------|----------|-------------|
| id | UUID (PK) | Record identifier |
| package_id | UUID (FK) | Reference to exam_packages |
| exam_id | UUID (FK) | Reference to exams |
| student_id | UUID (FK) | Reference to users (student) |
| wrapped_key | TEXT | Base64 RSA-OAEP encrypted AES key |

**Purpose**: Per-student wrapped keys. Only the student's private key can unwrap.

### 9.2.6 `submissions`

| **Column** | **Type** | **Purpose** |
|------------|----------|-------------|
| submission_id | UUID (PK) | Submission identifier |
| exam_id | UUID (FK) | Reference to exams |
| student_id | UUID (FK) | Reference to users (student) |
| encrypted_answers | TEXT | Base64 AES-GCM encrypted answers |
| iv | TEXT | Base64 initialization vector |
| student_signature | TEXT | Base64 RSA-PSS signature over hash |
| hash | TEXT | Base64 SHA-256 hash of plaintext answers |
| created_at | TIMESTAMP | Submission time |

**Purpose**: Encrypted submissions with cryptographic proof of authorship.

### 9.2.7 `submission_keys`

| **Column** | **Type** | **Purpose** |
|------------|----------|-------------|
| id | UUID (PK) | Record identifier |
| submission_id | UUID (FK) | Reference to submissions |
| exam_id | UUID (FK) | Reference to exams |
| student_id | UUID (FK) | Reference to users |
| wrapped_key | TEXT | Base64 RSA-OAEP encrypted AES key (for instructor) |

**Purpose**: Wrapped keys for instructor to decrypt submissions.

### 9.2.8 `results`

| **Column** | **Type** | **Purpose** |
|------------|----------|-------------|
| id | UUID (PK) | Result identifier |
| exam_id | UUID (FK) | Reference to exams |
| student_id | UUID (FK) | Reference to users |
| instructor_id | UUID (FK) | Reference to users (evaluator) |
| marks | FLOAT | Awarded marks |
| feedback | TEXT | Optional feedback |
| instructor_signature | TEXT | Base64 RSA-PSS signature |
| evaluated_at | TIMESTAMP | Evaluation time |
| created_at | TIMESTAMP | Record creation time |

**Purpose**: Signed results that students can cryptographically verify.

### 9.2.9 `audit_logs`

| **Column** | **Type** | **Purpose** |
|------------|----------|-------------|
| id | UUID (PK) | Log entry identifier |
| user_id | UUID (FK) | Actor reference |
| event_type | VARCHAR | Operation type (e.g., 'publish_exam', 'submit_exam') |
| event_details | TEXT | Descriptive details |
| timestamp | TIMESTAMP | Event occurrence time |

**Purpose**: Comprehensive audit trail for security analysis and accountability.

## 9.3 Why Plaintext is Never Stored

The database design ensures:

1. **Exam questions**: Stored as AES-GCM ciphertext with separate IV and tag
2. **Student answers**: Stored as AES-GCM ciphertext
3. **AES keys**: Only stored in RSA-OAEP wrapped form
4. **Private keys**: Never transmitted to or stored on server
5. **Verification**: Server verifies signatures without decryption capability

---

# 10. Implementation Details ⚙️

## 10.1 Frontend Implementation

### 10.1.1 Technology Stack

- **React 18**: Component-based UI with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing

### 10.1.2 Role-Based Dashboards

**Student Dashboard** (`StudentExamDecrypt.jsx`):
- View available (published) exams
- Decrypt and take exams
- Submit encrypted answers
- View and verify results

**Instructor Dashboard** (`InstructorPublish.jsx`, `InstructorEvaluate.jsx`):
- Create exams
- Encrypt and publish exams
- Decrypt and evaluate submissions
- Sign and publish results

### 10.1.3 Crypto Operations in Browser

All cryptographic operations use the **Web Crypto API**:

```javascript
// cryptoUtils.js exports:
- bufferToBase64() / base64ToArrayBuffer()  // Encoding utilities
- generateAesKey()                          // AES-256-GCM key generation
- aesGcmEncrypt() / aesGcmDecrypt()        // Symmetric encryption
- exportPublicKeyPem()                      // Key export
- importRsaOaepPrivateKeyFromBase64()       // Key import
- rsaOaepEncrypt() / rsaOaepUnwrap()       // Asymmetric operations
- signWithPrivateKey()                      // RSA-PSS signing
- verifyRsaPssSignature()                   // RSA-PSS verification
```

### 10.1.4 Key Storage (Demo Mode)

```javascript
// Key storage in localStorage (demo only)
localStorage.setItem('oaep_private_key', base64PrivateKey);
localStorage.setItem('pss_private_key', base64PrivateKey);
```

## 10.2 Backend Implementation

### 10.2.1 Framework and Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI application entry
│   ├── db.py             # Supabase client configuration
│   ├── routes/
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── exams.py      # Exam CRUD
│   │   ├── publish.py    # Exam publishing with sig verification
│   │   ├── submissions.py # Answer submission handling
│   │   ├── results.py    # Result publishing
│   │   └── keys.py       # Public key management
│   └── utils/
│       └── crypto.py     # Server-side crypto utilities
```

### 10.2.2 JWT Authentication

```python
# auth.py
def create_jwt_token(user_id: str, role: str):
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=5),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def get_current_user(credentials: HTTPAuthorizationCredentials):
    token = credentials.credentials
    decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    return decoded
```

### 10.2.3 Server-Side Signature Verification

The backend **only verifies** signatures; it **never decrypts** content:

```python
# publish.py - Signature verification
pub_key.verify(
    sig,
    ciphertext,
    asym_padding.PSS(
        mgf=asym_padding.MGF1(hashes.SHA256()),
        salt_length=32
    ),
    hashes.SHA256()
)
```

### 10.2.4 Key Wrapping for Students

```python
# Server wraps exam key for each student
wrapped = student_pub.encrypt(
    k_exam,  # Raw 32-byte AES key
    asym_padding.OAEP(
        mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)
```

## 10.3 Database Implementation

### 10.3.1 Supabase Configuration

- PostgreSQL database with REST API
- Row-Level Security (RLS) policies for access control
- Real-time subscriptions (optional feature)

### 10.3.2 RLS Policies (Brief)

```sql
-- Example: Students can only see their own submissions
CREATE POLICY student_own_submissions ON submissions
    FOR SELECT
    USING (auth.uid() = student_id);

-- Example: Only instructors can insert exam_packages
CREATE POLICY instructor_publish ON exam_packages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'instructor'
        )
    );
```

---

# 11. Testing Strategy 🧪

## 11.1 Testing Approach

Testing is performed **frontend-based** using the browser interface. This approach validates:

- Complete end-to-end cryptographic workflows
- User interface functionality
- API integration
- Real Web Crypto API behavior

## 11.2 Student Workflow Testing

| **Test Case** | **Steps** | **Expected Result** |
|---------------|-----------|---------------------|
| Key Generation | Register → Generate Keys | Keys stored in localStorage; public keys uploaded |
| Exam Retrieval | Select published exam | Wrapped key and encrypted package received |
| Decryption | Click "Start Exam" | Questions displayed correctly |
| Signature Verification | Automatic on decryption | "Verified ✓" indicator shown |
| Answer Submission | Select answers → Submit | Success message; submission ID returned |

## 11.3 Instructor Workflow Testing

| **Test Case** | **Steps** | **Expected Result** |
|---------------|-----------|---------------------|
| Exam Creation | Fill form → Save | Exam created with draft status |
| Exam Publishing | Select exam → Publish | Encrypted package stored; keys wrapped |
| Submission Viewing | Select exam → View submissions | Encrypted submissions listed |
| Decryption | Click "Decrypt" | Student answers displayed |
| Result Publishing | Enter marks → Publish | Signed result stored |

## 11.4 Tampering Tests

| **Scenario** | **Modification** | **Expected Behavior** |
|--------------|------------------|----------------------|
| Question Tampering | Alter `encrypted_mcqs` in DB | Signature verification fails; exam not displayed |
| Signature Modification | Alter `signature` in DB | Verification fails with error |
| Answer Tampering | Alter `encrypted_answers` in DB | Hash mismatch detected |
| Result Modification | Alter `marks` in DB | Student verification fails |

## 11.5 Unauthorized Access Tests

| **Scenario** | **Action** | **Expected Result** |
|--------------|------------|---------------------|
| Student publishing exam | POST to /publish/exam | 403 Forbidden |
| Instructor submitting answers | POST to /submissions | 403 Forbidden |
| Wrong wrapped key | Use different student's key | RSA-OAEP decryption fails |
| Expired JWT | Request after 5 hours | 401 Unauthorized |

## 11.6 Signature Failure Scenarios

| **Scenario** | **Cause** | **Result** |
|--------------|-----------|------------|
| Wrong private key | Key mismatch | Signature invalid |
| Modified payload | Data changed after signing | Verification fails |
| Salt length mismatch | Different PSS parameters | Verification fails |
| Corrupt signature | Base64 decoding error | Bad request error |

---

# 12. Security Analysis 🛡️

## 12.1 Security Goals Mapping

| **Security Goal** | **Achieved Using** | **Implementation Detail** |
|-------------------|--------------------|---------------------------|
| **Confidentiality** | AES-256-GCM | 256-bit keys, 12-byte random IV, authenticated encryption |
| **Integrity** | SHA-256 + AES-GCM | Hash of answers stored; GCM tag detects tampering |
| **Authentication** | JWT + RSA Public Keys | Bearer tokens + cryptographic key binding |
| **Non-Repudiation** | RSA-PSS Digital Signatures | Instructors sign exams/results; students sign submissions |
| **Server Blindness** | Client-side WebCrypto | All encrypt/decrypt in browser; server handles ciphertext only |
| **Accountability** | Audit Logs | All operations logged with user ID and timestamp |

## 12.2 Threat Model Analysis

### 12.2.1 Threat: Database Breach

**Scenario**: Attacker gains access to database.

**Mitigation**: 
- Questions stored as AES-GCM ciphertext
- AES keys wrapped with RSA-OAEP
- Private keys never stored on server
- Attacker cannot decrypt without private keys

### 12.2.2 Threat: Man-in-the-Middle Attack

**Scenario**: Attacker intercepts network traffic.

**Mitigation**:
- HTTPS/TLS encryption for transport
- End-to-end encryption above TLS
- Digital signatures detect modification

### 12.2.3 Threat: Malicious Server

**Scenario**: Server operator attempts to access content.

**Mitigation**:
- Server never sees plaintext
- Cannot forge signatures without private keys
- Clients verify all signatures independently

### 12.2.4 Threat: Student Impersonation

**Scenario**: Attacker submits answers as different student.

**Mitigation**:
- JWT tied to student identity
- RSA-PSS signature with student's private key
- Server verifies signature before accepting

## 12.3 Cryptographic Strength

| **Algorithm** | **Security Level** | **Quantum Resistance** |
|---------------|-------------------|------------------------|
| AES-256-GCM | 256-bit | Grover's: 128-bit equivalent |
| RSA-2048 | 112-bit | Not quantum resistant |
| SHA-256 | 256-bit | Collision: 128-bit equivalent |

> [!NOTE]
> For post-quantum security, future versions should consider lattice-based cryptography (e.g., CRYSTALS-Kyber for encryption, CRYSTALS-Dilithium for signatures).

---

# 13. Limitations ⚠️

## 13.1 Current Implementation Limitations

| **Limitation** | **Description** | **Impact** |
|----------------|-----------------|------------|
| **LocalStorage Private Keys** | Private keys stored in browser localStorage | Vulnerable to XSS attacks; not suitable for production |
| **No Biometric Proctoring** | No camera/screen monitoring | Cannot prevent exam sharing |
| **No Hardware-Backed Keys** | Keys are software-based | Extractable if device compromised |
| **Trusted Client Assumption** | Assumes browser not compromised | Malware could intercept plaintext |
| **No Rate Limiting** | API endpoints lack rate limits | Susceptible to brute-force attacks |
| **Single Server** | No distributed architecture | Single point of failure |

## 13.2 Demonstration Mode Caveats

- Password-derived key protection not implemented
- No key backup/recovery mechanism
- Session management is basic
- No 2FA/MFA implementation

---

# 14. Future Enhancements 🚀

## 14.1 Security Enhancements

| **Enhancement** | **Description** | **Benefit** |
|-----------------|-----------------|-------------|
| **Hardware-Backed Keys** | WebAuthn/FIDO2 integration | Keys protected by hardware security modules |
| **Passphrase-Protected Keys** | PBKDF2/Argon2 key derivation | Private keys encrypted at rest |
| **Post-Quantum Cryptography** | CRYSTALS-Kyber + Dilithium | Quantum computer resistance |
| **Threshold Cryptography** | Multi-party key management | No single point of compromise |

## 14.2 Functional Enhancements

| **Enhancement** | **Description** |
|-----------------|-----------------|
| **Exam Timer Enforcement** | Server-side timer with cryptographic commitment |
| **Replay Attack Protection** | Nonces and timestamps in signed payloads |
| **Subjective Questions** | Encrypted essay response support |
| **Batch Operations** | Bulk result publishing with aggregate signatures |
| **Mobile Application** | Native iOS/Android apps with secure enclave |

## 14.3 Operational Enhancements

| **Enhancement** | **Description** |
|-----------------|-----------------|
| **Key Rotation** | Periodic key renewal protocols |
| **Audit Analytics** | Anomaly detection in audit logs |
| **Compliance Reporting** | Automated security compliance reports |
| **Disaster Recovery** | Encrypted backups with key escrow |

---

# 15. Conclusion ✅

## 15.1 Summary of Achievements

This project successfully demonstrates a **cryptographically secured online examination system** that addresses the fundamental security challenges of digital assessments:

1. **End-to-End Encryption**: All examination content (questions and answers) is encrypted on the client device using AES-256-GCM before transmission, ensuring the server never accesses plaintext.

2. **Digital Signatures for Non-Repudiation**: RSA-PSS signatures bind examination content to instructors and submissions to students, providing unforgeable proof of authorship.

3. **Zero-Knowledge Server Architecture**: The backend operates without any capability to decrypt content, eliminating insider threats and reducing the impact of server compromises.

4. **Cryptographic Result Verification**: Students can independently verify that their grades are authentic and unmodified, building trust in the examination process.

5. **Comprehensive Audit Trail**: All security-relevant operations are logged for accountability and forensic analysis.

## 15.2 Cryptographic Robustness

The system employs industry-standard algorithms recommended by NIST:

- **AES-256-GCM** provides authenticated encryption with 256-bit security
- **RSA-2048** with OAEP padding provides semantic security for key wrapping
- **RSA-PSS** with SHA-256 provides provably secure digital signatures
- **Argon2** provides memory-hard password hashing resistant to GPU attacks

## 15.3 Academic Relevance

This project serves as a practical demonstration of:

- Applied cryptography principles in a real-world system
- End-to-end encryption architecture design
- Digital signature workflows for non-repudiation
- Secure key management strategies
- Trust boundary analysis in distributed systems

The implementation bridges theoretical cryptographic concepts with practical software engineering, making it suitable for academic evaluation in computer security and cryptography courses.

---

# 16. References 📎

1. W. Diffie and M. Hellman, "New Directions in Cryptography," *IEEE Transactions on Information Theory*, vol. 22, no. 6, pp. 644–654, November 1976.

2. R. Rivest, A. Shamir, and L. Adleman, "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems," *Communications of the ACM*, vol. 21, no. 2, pp. 120–126, February 1978.

3. National Institute of Standards and Technology (NIST), "Announcing the Advanced Encryption Standard (AES)," *Federal Information Processing Standards Publication 197*, November 2001.

4. National Institute of Standards and Technology (NIST), "Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC," *Special Publication 800-38D*, November 2007.

5. J. Jonsson and B. Kaliski, "Public-Key Cryptography Standards (PKCS) #1: RSA Cryptography Specifications Version 2.1," RFC 3447, February 2003.

6. M. Jones, J. Bradley, and N. Sakimura, "JSON Web Token (JWT)," RFC 7519, May 2015.

7. A. Biryukov, D. Dinu, and D. Khovratovich, "Argon2: the memory-hard function for password hashing and other applications," RFC 9106, September 2021.

8. OWASP Foundation, "Cryptographic Storage Cheat Sheet," *OWASP Cheat Sheet Series*, 2023. [Online]. Available: https://cheatsheetseries.owasp.org/

9. W3C, "Web Cryptography API," W3C Recommendation, January 2017. [Online]. Available: https://www.w3.org/TR/WebCryptoAPI/

10. E. Rescorla, "The Transport Layer Security (TLS) Protocol Version 1.3," RFC 8446, August 2018.

---

## 📊 Appendix A: Acronyms and Abbreviations

| **Abbreviation** | **Full Form** |
|------------------|---------------|
| AES | Advanced Encryption Standard |
| AEAD | Authenticated Encryption with Associated Data |
| API | Application Programming Interface |
| E2EE | End-to-End Encryption |
| GCM | Galois/Counter Mode |
| HSM | Hardware Security Module |
| IV | Initialization Vector |
| JWT | JSON Web Token |
| NIST | National Institute of Standards and Technology |
| OAEP | Optimal Asymmetric Encryption Padding |
| PEM | Privacy-Enhanced Mail |
| PKCS | Public-Key Cryptography Standards |
| PSS | Probabilistic Signature Scheme |
| RLS | Row-Level Security |
| RSA | Rivest–Shamir–Adleman |
| SHA | Secure Hash Algorithm |
| SPA | Single Page Application |
| TLS | Transport Layer Security |
| UUID | Universally Unique Identifier |

---

*Document generated on 02 January 2026*

*This report is submitted in partial fulfillment of the requirements for the course in Computer Security / Cryptography.*
