/**
 * InstructorPublish.jsx
 * 
 * Step 2.4: Encrypt & Publish Exam
 * UI matches the SecureExam Pro design with progress stepper and security protocols.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";
import { getToken, authFetch } from "./app/auth/authHelpers";
import { useTheme } from "./context/ThemeContext";
import InstructorHeader from "./app/instructor-dashboard/components/InstructorHeader";
import {
  bufferToBase64,
  importPrivateKeyFromBase64,
  generateAesKey,
  exportAesKeyRaw,
  aesGcmEncrypt,
  signWithPrivateKey,
  canonicalizeJson,
} from "./cryptoUtils";



export default function InstructorPublish() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isLoadingMcqs, setIsLoadingMcqs] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [hasKeys, setHasKeys] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    // Check for keys
    const hasPrivateKey = !!localStorage.getItem("instructor_private_key");
    setHasKeys(hasPrivateKey);
    fetchExams();
  }, [navigate]);

  useEffect(() => {
    if (selectedExamId) {
      const exam = exams.find((e) => (e.exam_id || e.id) === selectedExamId);
      setSelectedExam(exam);
      fetchMcqs(selectedExamId);
    } else {
      setSelectedExam(null);
      setMcqs([]);
    }
  }, [selectedExamId, exams]);

  const fetchExams = async () => {
    setIsLoadingExams(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/exams/instructor`);
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

  const fetchMcqs = async (examId) => {
    setIsLoadingMcqs(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/questions/list?exam_id=${examId}`);
      const data = await response.json();
      if (response.ok) {
        setMcqs(data.questions || []);
      }
    } catch (err) {
      console.error("Failed to fetch MCQs:", err);
    } finally {
      setIsLoadingMcqs(false);
    }
  };

  const publish = async () => {
    if (!selectedExamId || mcqs.length === 0) return;

    setIsPublishing(true);
    setStatus("Preparing encryption...");
    setError("");

    try {
      const b64Pkcs8 = localStorage.getItem("instructor_private_key");
      if (!b64Pkcs8) throw new Error("Private key not found. Generate keys first.");

      const privateKey = await importPrivateKeyFromBase64(b64Pkcs8);

      const examPackage = {
        exam_id: selectedExamId,
        title: selectedExam?.title || "Exam",
        questions: mcqs.map((q) => ({
          question_id: q.question_id || q.id,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          marks: q.marks || 1,
          correct_answer: q.correct_answer,
        })),
      };

      const mcqJson = canonicalizeJson(examPackage);

      setStatus("Generating AES-256 key...");
      const aesKey = await generateAesKey();

      setStatus("Encrypting with AES-256-GCM...");
      const { cipher, iv } = await aesGcmEncrypt(aesKey, mcqJson);

      setStatus("Signing with RSA-4096...");
      const signatureB64 = await signWithPrivateKey(privateKey, cipher);
      const aesKeyB64 = await exportAesKeyRaw(aesKey);

      const payload = {
        exam_id: selectedExamId,
        encrypted_mcqs: bufferToBase64(cipher.buffer),
        iv: bufferToBase64(iv.buffer),
        signature: signatureB64,
        aes_key: aesKeyB64,
      };

      setStatus("Publishing to server...");
      const response = await authFetch(`${API_BASE_URL}/publish/exam`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Publish failed");

      setStatus("✓ Exam published successfully!");
    } catch (err) {
      console.error("Publish failed:", err);
      setError(err.message);
      setStatus("");
    } finally {
      setIsPublishing(false);
    }
  };

  const isPublished = status.includes("successfully");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-background-dark dark:to-background-dark font-body transition-colors duration-300">
      <InstructorHeader />



      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Publish Exam Securely</h1>
         
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          {/* Exam Selection */}
          <div className="p-6 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Exam Title </p>

            {isLoadingExams ? (
              <div className="flex items-center gap-2 text-slate-500 py-3">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Loading exams...
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="material-symbols-outlined text-slate-400">description</span>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="flex-1 text-lg font-semibold text-slate-900 dark:text-white bg-transparent dark:bg-slate-800 border-0 focus:ring-0 cursor-pointer"
                  >
                    <option value="">Select an exam...</option>
                    {exams.map((exam) => (
                      <option key={exam.exam_id || exam.id} value={exam.exam_id || exam.id}>
                        {exam.title}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedExam && (
                  <span className={`px-3 py-2 rounded-full text-xs font-semibold ${isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'}`}>
                    {isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Security Protocols */}
          {selectedExam && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left - Security Info */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">verified_user</span>
                  <h3 className="font-bold text-slate-900 dark:text-white">Security Protocols Applied</h3>
                </div>

                {/* Encryption Policy Box */}
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 mt-0.5">info</span>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Strict Encryption Policy</h4>
                      <p className="text-sm text-slate-600">
                        This exam will be encrypted using <span className="font-semibold">AES-256</span> and digitally signed with your private key (RSA-4096). Students can only decrypt the content after authenticated login.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Protocol Badges */}
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-blue-600">lock</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">End-to-End Encryption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-purple-600">verified</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Digital Signature</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Ready to Sign */}
              <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl">
                {hasKeys ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-emerald-600 text-3xl">fingerprint</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Ready to Sign</h3>
                    <p className="text-sm text-slate-500 mb-6">Your digital ID is active.</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-amber-600 text-3xl">key_off</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Keys Not Found</h3>
                    <p className="text-sm text-slate-500 mb-4">Generate keys first.</p>
                    <Link to="/instructor/keygen" className="text-blue-600 text-sm font-medium hover:underline">
                      → Go to Key Generation
                    </Link>
                  </>
                )}

                {hasKeys && mcqs.length > 0 && (
                  <>
                    <button
                      onClick={publish}
                      disabled={isPublishing || isPublished}
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all ${isPublished
                        ? 'bg-emerald-600 text-white cursor-default'
                        : isPublishing
                          ? 'bg-blue-400 text-white cursor-wait'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                        }`}
                    >
                      {isPublished ? (
                        <>
                          <span className="material-symbols-outlined">check_circle</span>
                          Published Successfully
                        </>
                      ) : isPublishing ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          {status}
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">lock</span>
                          Encrypt & Publish Exam
                        </>
                      )}
                    </button>
                    
                  </>
                )}

                {hasKeys && mcqs.length === 0 && !isLoadingMcqs && (
                  <div className="text-center">
                    <p className="text-sm text-amber-600 mb-2">No questions found.</p>
                    <Link to={`/instructor/exams/${selectedExamId}/questions`} className="text-blue-600 text-sm font-medium hover:underline">
                      → Add Questions First
                    </Link>
                  </div>
                )}

                {isLoadingMcqs && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Loading questions...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedExam && !isLoadingExams && (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-slate-300 text-5xl mb-4">folder_open</span>
              <p className="text-slate-500">Select an exam above to view security options.</p>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-center gap-8 mt-8 text-sm">
          <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
            <span className="material-symbols-outlined text-lg">help</span>
            Help Center
          </a>
          <Link to="/instructor/keygen" className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
            <span className="material-symbols-outlined text-lg">key</span>
            Manage Keys
          </Link>
        </div>
      </main>
    </div>
  );
}
