# Fresh Testing Guide - Secure Exam System

Complete step-by-step guide to clear all data and test the system from scratch.

---

## 🧹 Part 1: Database Cleanup (Supabase)

### Step 1.1: Access Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Login to your account
3. Select your project for the Secure Exam System

### Step 1.2: Clear All Tables

Navigate to **Table Editor** in the left sidebar, then for each table below, delete all rows:

#### Tables to Clear (in this order):

1. **`results`** - Exam results
   ```sql
   DELETE FROM results;
   ```

2. **`submissions`** - Student answer submissions
   ```sql
   DELETE FROM submissions;
   ```

3. **`exam_publications`** - Published encrypted exams
   ```sql
   DELETE FROM exam_publications;
   ```

4. **`questions`** - Exam questions
   ```sql
   DELETE FROM questions;
   ```

5. **`exams`** - Exam metadata
   ```sql
   DELETE FROM exams;
   ```

6. **`public_keys`** - User public keys
   ```sql
   DELETE FROM public_keys;
   ```

7. **`users`** - User accounts
   ```sql
   DELETE FROM users;
   ```

### Step 1.3: Execute SQL (Alternative Method)

Go to **SQL Editor** → Click **New Query** → Paste and run:

```sql
-- Clear all tables in correct order (respects foreign keys)
DELETE FROM results;
DELETE FROM submissions;
DELETE FROM exam_publications;
DELETE FROM questions;
DELETE FROM exams;
DELETE FROM public_keys;
DELETE FROM users;

-- Verify tables are empty
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'public_keys', COUNT(*) FROM public_keys
UNION ALL
SELECT 'exams', COUNT(*) FROM exams
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'exam_publications', COUNT(*) FROM exam_publications
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'results', COUNT(*) FROM results;
```

Expected output: All counts should be `0`.

---

## 🧹 Part 2: Browser Cleanup

### Step 2.1: Clear localStorage (All Users)

Open browser **Developer Tools** (F12), then go to **Console** tab and run:

```javascript
// Clear all localStorage keys
localStorage.clear();

// Verify it's empty
console.log('localStorage keys:', Object.keys(localStorage));
```

Expected output: `localStorage keys: []` (empty array)

### Step 2.2: Clear Session Storage

```javascript
sessionStorage.clear();
console.log('sessionStorage keys:', Object.keys(sessionStorage));
```

### Step 2.3: Clear Cookies (Optional)

In Developer Tools → **Application** tab → **Cookies** → Right-click → **Clear**

### Step 2.4: Hard Reload

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

---

## ✅ Part 3: End-to-End Testing Flow

### 🎓 STUDENT FLOW

#### Step 3.1: Student Registration

1. Navigate to: `http://localhost:5173/signup`
2. Fill in the form:
   - **Email**: `student1@test.com`
   - **Password**: `TestPass123!`
   - **Role**: Select **Student**
3. Click **Create Account**
4. Expected: Redirect to `/login`

#### Step 3.2: Student Login

1. Navigate to: `http://localhost:5173/login`
2. Login with:
   - **Email**: `student1@test.com`
   - **Password**: `TestPass123!`
   - **Role**: Select **Student**
3. Click **Secure Login**
4. Expected: Redirect to `/student/dashboard`

#### Step 3.3: Generate RSA Keys

1. From dashboard, click **Generate Keys** or navigate to: `http://localhost:5173/student/keygen`
2. Click **Generate RSA Keys** button
3. Wait 5-10 seconds for key generation
4. Expected: Success message "RSA key pairs generated successfully!"
5. Verify in console:
   ```javascript
   // Check keys exist
   console.log('OAEP Private:', localStorage.getItem('student_oaep_private_key') ? 'EXISTS' : 'MISSING');
   console.log('PSS Private:', localStorage.getItem('student_pss_private_key') ? 'EXISTS' : 'MISSING');
   ```

#### Step 3.4: Upload Public Keys

1. Click **Upload Public Key** button
2. Expected: Success message "Public key uploaded successfully to the exam server!"
3. Verify in Supabase:
   - Go to **Table Editor** → `public_keys` table
   - Should see 1 row with your student user_id

#### Step 3.5: Wait for Instructor to Publish Exam

- At this point, switch to **Instructor Flow** (open in incognito/different browser)
- Complete instructor steps to create and publish an exam
- Then return here to continue

#### Step 3.6: Access & Decrypt Exam

1. Navigate to: `http://localhost:5173/student/decrypt`
2. Select the published exam from dropdown
3. Click **Decrypt & Start Exam**
4. Expected: 
   - Loading screen with "Decrypting exam..."
   - Exam questions displayed
   - Security status showing:
     - ✅ "Exam decrypted successfully"
     - ✅ "Signature Verified" (if instructor signed)
     - Timer starts counting down

#### Step 3.7: Answer Questions

1. For each question, select an answer (A, B, C, or D)
2. Verify progress counter updates: "X of Y Answered"

#### Step 3.8: Submit Answers

1. Click **Submit Exam** button
2. Review the submission modal showing:
   - Total questions
   - Answered count
   - Question review list
3. Click **Encrypt & Submit Answers**
4. Watch the status updates:
   - "Preparing answers..."
   - "Computing hash..."
   - "Signing answers..."
   - "Generating encryption key..."
   - "Encrypting answers..."
   - "Wrapping key for instructor..."
   - "Submitting..."
   - "✓ Answers submitted successfully!"
5. Expected: Success message and redirect option
6. Click **Return to Dashboard**

#### Step 3.9: View Results (After Instructor Evaluation)

1. Navigate to: `http://localhost:5173/student/results/{exam_id}`
2. Expected:
   - Signed result displayed
   - Signature verification status: ✅ "Verified" or ⚠️ "Unverified"
   - Score and feedback shown

---

### 👨‍🏫 INSTRUCTOR FLOW

#### Step 3.10: Instructor Registration

1. **Open incognito window** or **different browser**
2. Navigate to: `http://localhost:5173/signup`
3. Fill in the form:
   - **Email**: `instructor1@test.com`
   - **Password**: `InstrPass123!`
   - **Role**: Select **Instructor**
4. Click **Create Account**
5. Expected: Redirect to `/login`

#### Step 3.11: Instructor Login

1. Navigate to: `http://localhost:5173/login`
2. Login with:
   - **Email**: `instructor1@test.com`
   - **Password**: `InstrPass123!`
   - **Role**: Select **Instructor**
3. Click **Secure Login**
4. Expected: Redirect to `/instructor/dashboard`

#### Step 3.12: Generate RSA Keys

1. Navigate to: `http://localhost:5173/instructor/keygen`
2. Click **Generate RSA Keys** button
3. Wait 5-10 seconds
4. Expected: Success message
5. Verify in console:
   ```javascript
   console.log('Instructor OAEP:', localStorage.getItem('instructor_oaep_private_key') ? 'EXISTS' : 'MISSING');
   console.log('Instructor PSS:', localStorage.getItem('instructor_pss_private_key') ? 'EXISTS' : 'MISSING');
   ```

#### Step 3.13: Upload Public Keys

1. Click **Upload Public Key** button
2. Expected: Success message
3. Verify in Supabase:
   - `public_keys` table should now have 2 rows (student + instructor)

#### Step 3.14: Create Exam

1. Navigate to: `http://localhost:5173/instructor/exams/create`
2. Fill in exam details:
   - **Title**: "Computer Security Midterm"
   - **Description**: "Cryptography fundamentals"
   - **Duration**: 60 minutes
   - **Total Marks**: 100
3. Click **Create Exam**
4. Expected: Redirect to add questions page or exam ID displayed
5. **Copy the exam ID** - you'll need it for the next step

#### Step 3.15: Add MCQ Questions

1. Navigate to: `http://localhost:5173/instructor/exams/{exam_id}/questions`
2. Add Question 1:
   - **Question**: "What does RSA stand for?"
   - **Option A**: "Rivest-Shamir-Adleman"
   - **Option B**: "Random Security Algorithm"
   - **Option C**: "Reliable System Authentication"
   - **Option D**: "None of the above"
   - **Correct Answer**: A
   - **Marks**: 10
3. Click **Add Question**
4. Add 2-3 more questions similarly
5. Expected: Questions saved successfully

#### Step 3.16: Publish Encrypted Exam

1. Navigate to: `http://localhost:5173/instructor/publish`
2. Select the exam you created
3. Click **Fetch Students** or **Publish Exam**
4. Watch the encryption progress:
   - "Generating AES key..."
   - "Encrypting exam..."
   - "Signing package..."
   - "Wrapping keys for students..."
   - "Publishing..."
5. Expected: 
   - Success message
   - Exam published to all students with uploaded keys

#### Step 3.17: Fetch & Decrypt Submissions

1. Navigate to: `http://localhost:5173/instructor/evaluate`
2. Select the exam
3. Click **Fetch Submissions**
4. For each submission, click **Decrypt**
5. Expected:
   - Student answers decrypted locally
   - Answers displayed in readable format
   - Student signature verification status shown

#### Step 3.18: Evaluate & Assign Marks

1. For each question answer:
   - Verify the selected answer
   - Assign marks (or use auto-grading if available)
2. Enter total score
3. Add feedback (optional)

#### Step 3.19: Sign & Publish Results

1. Click **Sign Results** button
2. Watch the signing process:
   - "Preparing results..."
   - "Signing with RSA-PSS..."
   - "Publishing..."
3. Expected: Success message
4. Verify in Supabase:
   - `results` table should have entries with:
     - `encrypted_result`
     - `instructor_signature`
     - `result_hash`

---

## 🧪 Part 4: Verification Checklist

### Database Verification

Check Supabase Tables:

- [ ] `users`: 2 rows (1 student, 1 instructor)
- [ ] `public_keys`: 2 rows (1 student, 1 instructor)
- [ ] `exams`: 1+ rows (created exams)
- [ ] `questions`: 2+ rows (exam questions)
- [ ] `exam_publications`: 1+ rows (published exams)
- [ ] `submissions`: 1+ rows (student submissions)
- [ ] `results`: 1+ rows (evaluated results)

### Browser localStorage Verification

**Student Browser**:
```javascript
// Verify student keys are stored
console.log({
  oaepPrivate: !!localStorage.getItem('student_oaep_private_key'),
  pssPrivate: !!localStorage.getItem('student_pss_private_key'),
  token: !!localStorage.getItem('token'),
  role: localStorage.getItem('role')
});
```

**Instructor Browser**:
```javascript
// Verify instructor keys are stored
console.log({
  oaepPrivate: !!localStorage.getItem('instructor_oaep_private_key'),
  pssPrivate: !!localStorage.getItem('instructor_pss_private_key'),
  token: !!localStorage.getItem('token'),
  role: localStorage.getItem('role')
});
```

### Cryptographic Verification

- [ ] Student can decrypt exam (proves RSA-OAEP decryption works)
- [ ] Exam signature verified (proves RSA-PSS verification works)
- [ ] Student submission encrypted (proves AES-GCM encryption works)
- [ ] Instructor can decrypt submission (proves key wrapping works)
- [ ] Student signature verified by instructor (proves RSA-PSS signing works)
- [ ] Result signature verified by student (proves end-to-end trust chain)

### UI/UX Verification

- [ ] Theme toggle works on all pages
- [ ] Theme persists across page reloads
- [ ] Dark mode colors are consistent
- [ ] No console errors
- [ ] Loading states show properly
- [ ] Success/error messages display correctly
- [ ] Form validation works

---

## 🚨 Common Issues & Solutions

### Issue 1: "Private key not found"
**Solution**: 
- Make sure you generated AND uploaded keys
- Check localStorage: `console.log(localStorage)`
- Regenerate keys if needed

### Issue 2: "Failed to unwrap key"
**Solution**:
- Student regenerated keys after exam was published
- Instructor needs to re-publish the exam OR
- Student needs to use the same keys they had when exam was published

### Issue 3: "Signature verification failed"
**Solution**:
- Ensure canonical JSON is being used
- Check that RSA-PSS saltLength is 32
- Verify the same data is being signed and verified

### Issue 4: Database foreign key errors
**Solution**:
- Clear tables in the correct order (as shown in Part 1)
- Or temporarily disable foreign key checks

### Issue 5: CORS errors
**Solution**:
- Backend must be running on `http://localhost:8000`
- Frontend must be running on `http://localhost:5173`
- Check backend CORS configuration in `main.py`

---

## 📊 Expected Console Output

### During Student Key Generation:
```
Generating RSA-OAEP key pair...
Generating RSA-PSS key pair...
Keys generated successfully
Exporting public keys...
Keys stored in localStorage
```

### During Exam Decryption:
```
Fetching encrypted package...
Unwrapping AES key with RSA-OAEP...
Decrypting exam with AES-GCM...
Verifying instructor signature with RSA-PSS...
✓ Signature verified: true
Exam decrypted successfully
```

### During Answer Submission:
```
Canonicalizing answers...
Computing SHA-256 hash...
Signing with RSA-PSS private key...
Generating fresh AES-256 key...
Encrypting answers with AES-GCM...
Wrapping AES key for instructor with RSA-OAEP...
Submitting to backend...
✓ Submission successful
```

---

## ✅ Success Criteria

You've successfully tested the system end-to-end if:

1. ✅ Both student and instructor can register and login
2. ✅ Both can generate and upload RSA key pairs
3. ✅ Instructor can create exam with MCQs
4. ✅ Instructor can publish encrypted exam
5. ✅ Student can decrypt and view exam questions
6. ✅ Student can submit encrypted + signed answers
7. ✅ Instructor can decrypt and evaluate submissions
8. ✅ Instructor can sign and publish results
9. ✅ Student can view and verify signed results
10. ✅ All cryptographic operations complete without errors
11. ✅ Theme toggle works across all pages
12. ✅ No server-side decryption of sensitive data occurs

---

## 🎯 Next Steps After Testing

If everything works:
1. Document any issues found
2. Take screenshots for documentation
3. Consider adding the remaining dark mode to instructor pages
4. Test cross-browser compatibility (Chrome, Firefox, Safari)
5. Test on mobile devices
6. Prepare for production deployment (see walkthrough.md recommendations)

Good luck with your testing! 🚀
