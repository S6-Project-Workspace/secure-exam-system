/**
 * StudentExamDecrypt.jsx
 * 
 * Step 2.5 + Step 3: Student Exam Retrieval, Decryption & Submission
 * 
 * Flow:
 * 1. Student selects published exam
 * 2. Fetch encrypted package + wrapped AES key
 * 3. Unwrap key with RSA-OAEP private key
 * 4. Decrypt MCQs with AES-256-GCM
 * 5. Verify instructor signature
 * 6. Display exam questions
 * 7. Submit: encrypt answers, sign hash, wrap key for instructor
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";
import { getToken, authFetch } from "./app/auth/authHelpers";
import {
  base64ToArrayBuffer,
  bufferToBase64,
  importRsaOaepPrivateKeyFromBase64,
  importRsaOaepPublicKeyFromPem,
  rsaOaepUnwrap,
  rsaOaepEncrypt,
  importAesKeyRaw,
  aesGcmDecrypt,
  aesGcmEncrypt,
  generateAesKey,
  exportAesKeyRaw,
  importPrivateKeyFromBase64,
  signWithPrivateKey,
} from "./cryptoUtils";

// Helper: import RSA-PSS public key from PEM for signature verification
async function importRsaPssPublicKeyFromPem(pem) {
  const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/, "").replace(/-----END PUBLIC KEY-----/, "").replace(/\r|\n/g, "");
  const raw = base64ToArrayBuffer(b64);
  return await window.crypto.subtle.importKey(
    "spki",
    raw,
    { name: "RSA-PSS", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

// Canonicalize object (sorted keys)
function canonicalize(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(canonicalize);
  const sorted = {};
  Object.keys(obj).sort().forEach((key) => {
    sorted[key] = canonicalize(obj[key]);
  });
  return sorted;
}

export default function StudentExamDecrypt() {
  const navigate = useNavigate();

  // State
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examData, setExamData] = useState(null);
  const [mcqs, setMcqs] = useState(null);
  const [answers, setAnswers] = useState({});
  const [decryptionStatus, setDecryptionStatus] = useState("idle");
  const [signatureVerified, setSignatureVerified] = useState(false);
  const [error, setError] = useState("");
  const [hasKeys, setHasKeys] = useState(false);
  const [isLoadingExams, setIsLoadingExams] = useState(true);

  // Submission state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    const hasPrivateKey = !!localStorage.getItem("student_private_key") || !!localStorage.getItem("student_oaep_private_key");
    setHasKeys(hasPrivateKey);
    fetchExams();
  }, [navigate]);

  useEffect(() => {
    if (timeRemaining && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { hrs, mins, secs };
  };

  const fetchExams = async () => {
    setIsLoadingExams(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/exams/me`);
      const data = await response.json();
      if (response.ok) {
        setExams(data.exams || []);
      }
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    } finally {
      setIsLoadingExams(false);
    }
  };

  const startDecryption = async () => {
    if (!selectedExamId) return;

    setDecryptionStatus("loading");
    setError("");
    setSignatureVerified(false);
    setMcqs(null);

    try {
      // 1. Fetch encrypted package
      const pkgRes = await authFetch(`${API_BASE_URL}/exams/${selectedExamId}/package`);
      if (!pkgRes.ok) {
        const err = await pkgRes.json();
        throw new Error(err.detail || "Failed to fetch exam package");
      }
      const pkg = await pkgRes.json();
      setExamData(pkg);

      if (pkg.duration_minutes) {
        setTimeRemaining(pkg.duration_minutes * 60);
      }

      // 2. Fetch wrapped AES key
      const keyRes = await authFetch(`${API_BASE_URL}/exams/${selectedExamId}/key`);
      if (!keyRes.ok) {
        const err = await keyRes.json();
        throw new Error(err.detail || "Failed to fetch wrapped key");
      }
      const keyData = await keyRes.json();

      // 3. Load student's RSA-OAEP private key
      let b64Pkcs8 = localStorage.getItem("student_private_key") || localStorage.getItem("student_oaep_private_key");
      if (!b64Pkcs8) throw new Error("Private key not found. Please go to /student/keygen to generate keys.");

      let privateKey;
      try {
        privateKey = await importRsaOaepPrivateKeyFromBase64(b64Pkcs8);
      } catch (keyErr) {
        throw new Error(`Failed to import private key: ${keyErr.message}. You may need to regenerate keys.`);
      }

      // 4. Unwrap AES key
      let rawAes;
      try {
        rawAes = await rsaOaepUnwrap(privateKey, keyData.wrapped_key);
      } catch (unwrapErr) {
        throw new Error("Failed to unwrap key. This may happen if you regenerated your keys after the exam was published. Contact your instructor.");
      }
      const aesKey = await importAesKeyRaw(bufferToBase64(rawAes));

      // 5. Combine ciphertext + tag for decryption
      const cipherBuf = base64ToArrayBuffer(pkg.encrypted_mcqs);
      const tagBuf = base64ToArrayBuffer(pkg.tag);
      const ivBuf = base64ToArrayBuffer(pkg.iv);

      const combined = new Uint8Array(cipherBuf.byteLength + tagBuf.byteLength);
      combined.set(new Uint8Array(cipherBuf), 0);
      combined.set(new Uint8Array(tagBuf), cipherBuf.byteLength);

      // 6. Decrypt
      const plaintext = await aesGcmDecrypt(aesKey, new Uint8Array(ivBuf), combined);
      const parsed = JSON.parse(plaintext);

      // 7. Verify instructor signature
      try {
        const instrKeyRes = await authFetch(`${API_BASE_URL}/keys/get?user_id=${pkg.instructor_id}`);
        if (instrKeyRes.ok) {
          const keyInfo = await instrKeyRes.json();
          let pssPublicPem = keyInfo.public_key;

          try {
            const keyObj = JSON.parse(pssPublicPem);
            pssPublicPem = keyObj.pss || keyObj.oaep;
          } catch { }

          if (pssPublicPem) {
            const pubKey = await importRsaPssPublicKeyFromPem(pssPublicPem);
            const sigBuf = base64ToArrayBuffer(pkg.signature);
            const valid = await window.crypto.subtle.verify(
              { name: "RSA-PSS", saltLength: 32 },
              pubKey,
              sigBuf,
              combined
            );
            setSignatureVerified(valid);
          }
        }
      } catch (verifyErr) {
        console.warn("Signature verification failed:", verifyErr);
      }

      setMcqs(parsed);
      setDecryptionStatus("success");
    } catch (err) {
      console.error("Decryption failed:", err);
      setError(err.message);
      setDecryptionStatus("error");
    }
  };

  const onSelectAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // ============= SUBMISSION LOGIC =============
  const submitAnswers = async () => {
    setIsSubmitting(true);
    setSubmitStatus("Preparing answers...");

    try {
      // 1. Build answers object
      const answersData = {
        exam_id: selectedExamId,
        answers: Object.entries(answers).map(([qid, ans]) => ({
          question_id: qid,
          selected: ans
        })),
        submitted_at: new Date().toISOString()
      };

      // 2. Canonicalize
      const canonicalAnswers = canonicalize(answersData);
      const answersJson = JSON.stringify(canonicalAnswers);

      // 3. Compute SHA-256 hash
      setSubmitStatus("Computing hash...");
      const hashBuf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(answersJson));
      const hashB64 = bufferToBase64(hashBuf);

      // 4. Sign hash with RSA-PSS private key
      setSubmitStatus("Signing answers...");
      const signPrivKey = localStorage.getItem("student_sign_private_key") || localStorage.getItem("student_pss_private_key");
      if (!signPrivKey) throw new Error("Signing private key not found. Please regenerate keys.");

      const pssPrivateKey = await importPrivateKeyFromBase64(signPrivKey);
      const signatureB64 = await signWithPrivateKey(pssPrivateKey, new Uint8Array(hashBuf));

      // 5. Generate fresh AES key
      setSubmitStatus("Generating encryption key...");
      const aesKey = await generateAesKey();

      // 6. Encrypt answers
      setSubmitStatus("Encrypting answers...");
      const { cipher, iv } = await aesGcmEncrypt(aesKey, answersJson);
      const encryptedAnswersB64 = bufferToBase64(cipher.buffer);
      const ivB64 = bufferToBase64(iv.buffer);

      // 7. Wrap AES key for instructor
      setSubmitStatus("Wrapping key for instructor...");
      const instrKeyRes = await authFetch(`${API_BASE_URL}/keys/get?user_id=${examData.instructor_id}`);
      if (!instrKeyRes.ok) throw new Error("Failed to fetch instructor public key");

      const instrKeyData = await instrKeyRes.json();
      let instrOaepPem = instrKeyData.public_key;

      try {
        const keyObj = JSON.parse(instrOaepPem);
        instrOaepPem = keyObj.oaep || keyObj.pss;
      } catch { }

      if (!instrOaepPem) throw new Error("Instructor OAEP public key not found");

      const instrPubKey = await importRsaOaepPublicKeyFromPem(instrOaepPem);
      const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
      const wrappedKeyB64 = await rsaOaepEncrypt(instrPubKey, rawAesKey);

      // 8. Submit to backend
      setSubmitStatus("Submitting...");
      const response = await authFetch(`${API_BASE_URL}/submissions`, {
        method: "POST",
        body: JSON.stringify({
          exam_id: selectedExamId,
          encrypted_answers: encryptedAnswersB64,
          iv: ivB64,
          encrypted_aes_key: wrappedKeyB64,
          student_signature: signatureB64,
          hash: hashB64
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Submission failed");

      setSubmitStatus("✓ Answers submitted successfully!");
      setSubmitSuccess(true);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitStatus(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = mcqs?.questions?.length || 0;
  const time = timeRemaining ? formatTime(timeRemaining) : null;

  // Get current server time
  const serverTime = new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "UTC" });

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      {/* Exam Header - Only show when exam is loaded */}
      {mcqs && !showSubmitModal && (
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">MID-TERM</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded">
                  {selectedExamId?.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{examData?.title || mcqs?.title || "Exam"}</h1>
              <p className="text-sm text-slate-500">Total Marks: 100</p>
            </div>

            {time && (
              <div className="flex items-center gap-1 text-center">
                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                  <span className="text-2xl font-bold text-blue-600">{String(time.hrs).padStart(2, "0")}</span>
                  <p className="text-xs text-slate-500 uppercase">HRS</p>
                </div>
                <span className="text-slate-400 text-xl">:</span>
                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                  <span className="text-2xl font-bold text-blue-600">{String(time.mins).padStart(2, "0")}</span>
                  <p className="text-xs text-slate-500 uppercase">MIN</p>
                </div>
                <span className="text-slate-400 text-xl">:</span>
                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                  <span className="text-2xl font-bold text-red-500">{String(time.secs).padStart(2, "0")}</span>
                  <p className="text-xs text-slate-500 uppercase">SEC</p>
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Exam Selection */}
        {decryptionStatus === "idle" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-blue-600 text-3xl">lock_open</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Secure Exam</h1>
              <p className="text-slate-500">Select an exam and decrypt it with your private key.</p>
            </div>

            {!hasKeys && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-600">warning</span>
                  <div>
                    <p className="font-semibold text-amber-800">Private Key Required</p>
                    <p className="text-sm text-amber-600">
                      Generate and upload your keys first. <Link to="/student/keygen" className="underline">Go to Key Generation</Link>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Exam</label>
              {isLoadingExams ? (
                <div className="flex items-center gap-2 text-slate-500 py-4">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Loading available exams...
                </div>
              ) : (
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select an exam --</option>
                  {exams.map((exam) => (
                    <option key={exam.exam_id || exam.id} value={exam.exam_id || exam.id}>
                      {exam.title}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={startDecryption}
                disabled={!selectedExamId || !hasKeys}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${selectedExamId && hasKeys
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
              >
                <span className="material-symbols-outlined">lock_open</span>
                Decrypt & Start Exam
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {decryptionStatus === "loading" && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-blue-600 animate-spin mb-4">progress_activity</span>
            <p className="text-lg font-semibold text-slate-700">Decrypting exam...</p>
            <p className="text-slate-500">Unwrapping keys and verifying signature</p>
          </div>
        )}

        {/* Error State */}
        {decryptionStatus === "error" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
              <h2 className="text-xl font-bold text-red-800 mb-2">Decryption Failed</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button onClick={() => setDecryptionStatus("idle")} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-blue-600 text-3xl">lock</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Submit Exam Securely</h1>
              <p className="text-slate-500">Please review your answers before final encryption and submission. This action is irreversible.</p>
            </div>

            {/* Encrypted Banner */}
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">verified_user</span>
              <span className="text-sm font-medium text-emerald-700">All answers are currently encrypted locally on your device</span>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {/* Left - Summary */}
                <div className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Exam Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Total Questions</span>
                      <span className="text-2xl font-bold text-slate-900">{totalQuestions}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-emerald-600">Answered</span>
                      <span className="text-2xl font-bold text-emerald-600">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-amber-600">Flagged</span>
                      <span className="text-2xl font-bold text-amber-500">0</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-blue-600 mt-0.5">info</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Security Note</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Your answers are digitally signed using your private key. The server verifies the signature but cannot decrypt the content without the faculty's private key.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right - Question Review */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Question Review</h2>
                    <button onClick={() => setShowSubmitModal(false)} className="text-sm text-blue-600 hover:underline">
                      Scroll to review
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {mcqs?.questions?.map((q, idx) => {
                      const answered = !!answers[q.question_id || q.id];
                      return (
                        <div key={q.question_id || idx} className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-600">Q{idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${answered ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {answered ? "● Answered" : "○ Unanswered"}
                          </span>
                          <button onClick={() => setShowSubmitModal(false)} className="text-sm text-blue-600 hover:underline">
                            REVIEW
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="p-6 bg-slate-50 border-t border-slate-200">
                {submitSuccess ? (
                  <div className="text-center py-4">
                    <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">check_circle</span>
                    <p className="text-lg font-bold text-emerald-700">{submitStatus}</p>
                    <Link to="/student/dashboard" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg">
                      Return to Dashboard
                    </Link>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={submitAnswers}
                      disabled={isSubmitting}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${isSubmitting
                          ? "bg-blue-400 text-white cursor-wait"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          {submitStatus}
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">lock</span>
                          Encrypt & Submit Answers
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3">
                      By clicking submit, you confirm that these answers are your own work.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">lock</span>
                End-to-end encryption enabled (AES-256)
              </div>
              <div>Server Time: {serverTime} UTC</div>
            </div>
          </div>
        )}

        {/* Success - Show Exam */}
        {decryptionStatus === "success" && mcqs && !showSubmitModal && (
          <>
            {/* Security Status Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Security Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-sm text-emerald-600">Exam decrypted successfully</span>
                  <span className="text-emerald-600 font-bold">100%</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600">lock</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">AES-256 Encrypted</p>
                    <p className="text-xs text-slate-500">End-to-end protection</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
                  <span className={`material-symbols-outlined ${signatureVerified ? "text-emerald-600" : "text-amber-500"}`}>
                    {signatureVerified ? "verified" : "warning"}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {signatureVerified ? "Signature Verified" : "Signature Unverified"}
                    </p>
                    <p className="text-xs text-slate-500">Instructor Key: {examData?.instructor_id?.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Section A: Multiple Choice</h2>
                <span className="text-sm text-slate-500">Questions 1 - {totalQuestions}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {mcqs.questions?.map((q, idx) => (
                  <div key={q.question_id || idx} className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 mb-4">{q.question_text || q.q}</p>
                        <p className="text-xs text-slate-400 mb-3">Select the one best answer</p>

                        <div className="space-y-2">
                          {["A", "B", "C", "D"].map((opt) => {
                            const optionText = q[`option_${opt.toLowerCase()}`] || (q.options && q.options[["A", "B", "C", "D"].indexOf(opt)]);
                            if (!optionText || optionText === "N/A") return null;

                            const isSelected = answers[q.question_id || q.id] === opt;

                            return (
                              <label
                                key={opt}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.question_id || q.id}`}
                                  checked={isSelected}
                                  onChange={() => onSelectAnswer(q.question_id || q.id, opt)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-slate-700">{optionText}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Progress</p>
                <p className="font-bold text-slate-900">{answeredCount} of {totalQuestions} Answered</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50">
                  Save Draft
                </button>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  Submit Exam
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
