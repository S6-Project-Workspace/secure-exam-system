# Secure Online Examination System with Cryptographic Verification

A secure web-based examination system that implements end-to-end cryptographic verification for exam integrity, student authentication, and result validation. This system ensures tamper-proof exam distribution, submission, and verification using RSA encryption and digital signatures.

## 🔒 Key Security Features

- **Client-Side Key Generation**: RSA 2048-bit key pairs generated in the browser
- **Encrypted Exam Distribution**: Exams encrypted with instructor's public key
- **Digital Signatures**: All submissions and results are cryptographically signed
- **Tamper-Proof Results**: Students can verify result authenticity using instructor's public key
- **JWT Authentication**: Secure token-based authentication with role-based access control
- **Password Hashing**: Argon2 password hashing for secure credential storage

## 🏗️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Supabase** - PostgreSQL database with real-time capabilities
- **PyJWT** - JSON Web Token authentication
- **Passlib** - Password hashing with Argon2
- **Python Cryptography** - Cryptographic operations

### Frontend
- **React** - UI library with hooks
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Web Crypto API** - Browser-native cryptographic operations
- **React Router** - Client-side routing

## 📋 Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Supabase Account** - For database hosting

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/secure-exam-system.git
cd secure-exam-system
```

### 2. Backend Setup

#### 2.1 Create Virtual Environment

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

#### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration
JWT_SECRET=your_random_jwt_secret_here
JWT_ALGO=HS256
```

> **🔑 Getting Supabase Credentials:**
> 1. Go to [Supabase Dashboard](https://app.supabase.com)
> 2. Select your project
> 3. Go to Settings > API
> 4. Copy the `URL` and `service_role` key

> **🔐 Generating JWT Secret:**
> ```bash
> # Using Python
> python -c "import secrets; print(secrets.token_hex(32))"
> 
> # Or using OpenSSL
> openssl rand -hex 32
> ```

#### 2.4 Setup Database Schema

The application expects the following Supabase tables:
- `users` - User accounts with roles (student/instructor)
- `public_keys` - RSA public keys for users
- `exams` - Exam metadata
- `questions` - Exam questions
- `exam_publications` - Encrypted exam distributions
- `submissions` - Student exam submissions
- `results` - Signed evaluation results

Refer to `docs/` for the complete database schema.

#### 2.5 Run Backend Server

```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup

#### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

#### 3.2 Configure Environment Variables (Optional)

If you need to change the API URL, create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
```

#### 3.3 Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎯 Usage

### For Students

1. **Sign Up**: Create an account with student role
2. **Generate Keys**: Generate RSA key pair (stored locally)
3. **Upload Public Key**: Submit public key to the system
4. **Take Exam**: Decrypt exam questions, submit encrypted answers
5. **Verify Results**: Verify result signatures using instructor's public key

### For Instructors

1. **Sign Up**: Create an account with instructor role
2. **Generate Keys**: Generate RSA key pair (stored locally)
3. **Upload Public Key**: Submit public key to the system
4. **Create Exam**: Add exam questions (MCQ and descriptive)
5. **Publish Exam**: Encrypt and distribute exam to students
6. **Evaluate**: Grade submissions and sign results
7. **Publish Results**: Distribute cryptographically signed results

## 🔐 Security Considerations

### Before Deploying to Production

1. **Change All Default Secrets**
   - Generate new JWT secret
   - Use production Supabase credentials
   - Enable row-level security (RLS) in Supabase

2. **Never Commit Secrets**
   - Ensure `.env` files are in `.gitignore`
   - Never commit API keys, tokens, or credentials
   - Use environment variables for all sensitive data

3. **HTTPS Only**
   - Always use HTTPS in production
   - Enable CORS restrictions
   - Set secure cookie flags

4. **Key Storage**
   - Private keys are stored in browser's IndexedDB
   - Users must backup their private keys
   - Lost private keys cannot be recovered

## 📁 Project Structure

```
secure-exam-system/
├── backend/
│   ├── app/
│   │   ├── routes/        # API endpoints
│   │   ├── models/        # Data models
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   ├── db.py          # Database connection
│   │   └── main.py        # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/           # React components
│   │   ├── config.js      # Configuration
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── .env.example
├── docs/                  # Documentation
├── tests/                 # Test files
└── README.md
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📝 Environment Variables Reference

### Backend (`.env`)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | `eyJhbGc...` |
| `JWT_SECRET` | Secret for JWT token signing | Yes | `fb72141...` |
| `JWT_ALGO` | JWT algorithm | Yes | `HS256` |

### Frontend (`.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | No | `http://localhost:8000` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This is an academic project for educational purposes. For production use, conduct a thorough security audit and implement additional security measures as needed.

## 🐛 Known Issues

- Private key backup/recovery mechanism not implemented
- No multi-factor authentication (MFA)
- Session management could be enhanced

## 📞 Support

For issues and questions, please open an issue on GitHub.