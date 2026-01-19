/**
 * InstructorEvaluate.jsx
 * 
 * Instructor page to evaluate student submissions.
 * - Fetches encrypted submissions for an exam
 * - Unwraps AES keys (RSA-OAEP) and decrypts answers (AES-GCM)
 * - Signs results (RSA-PSS) and publishes to backend
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";
import { getToken, authFetch } from "./app/auth/authHelpers";
import {
  base64ToArrayBuffer,
  bufferToBase64,
  importRsaOaepPrivateKeyFromBase64,
  rsaOaepUnwrap,
  importAesKeyRaw,
  aesGcmDecrypt,
  importPrivateKeyFromBase64,
  signWithPrivateKey,
} from "./cryptoUtils";

export default function InstructorEvaluate() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [subs, setSubs] = useState([]);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info"); // info, success, error, loading
  const [selected, setSelected] = useState(null);
  const [decrypted, setDecrypted] = useState("");
  const [parsedAnswers, setParsedAnswers] = useState(null);
  const [marks, setMarks] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hasKeys, setHasKeys] = useState(false);
  const [isLoadingExams, setIsLoadingExams] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Check for instructor keys
    const hasOaepKey = !!localStorage.getItem("instructor_oaep_private_key");
    const hasSignKey = !!localStorage.getItem("instructor_sign_private_key");
    setHasKeys(hasOaepKey && hasSignKey);

    fetchExams();
  }, [navigate]);

  const fetchExams = async () => {
    setIsLoadingExams(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/exams/instructor`);
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams || []);
      }
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    } finally {
      setIsLoadingExams(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedExamId) return;

    try {
      setStatus("Fetching submissions...");
      setStatusType("loading");

      const res = await authFetch(`${API_BASE_URL}/instructor/submissions/${selectedExamId}`);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to fetch submissions");
      }

      const data = await res.json();
      setSubs(data.submissions || []);
      setStatus(`Fetched ${data.submissions?.length || 0} submissions`);
      setStatusType("success");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
      setStatusType("error");
    }
  };

  const decryptSubmission = async (submission) => {
    try {
      setSelected(submission);
      setStatus("Unwrapping AES key with RSA-OAEP...");
      setStatusType("loading");
      setDecrypted("");
      setParsedAnswers(null);

      // Load instructor RSA-OAEP private key from localStorage
      const b64OaepPk = localStorage.getItem("instructor_oaep_private_key");
      if (!b64OaepPk) {
        throw new Error("Instructor RSA-OAEP private key not found. Please generate keys first.");
      }

      const priv = await importRsaOaepPrivateKeyFromBase64(b64OaepPk);
      const rawAes = await rsaOaepUnwrap(priv, submission.wrapped_aes_key_for_instructor);

      // Import AES key for WebCrypto
      const aesKeyB64 = bufferToBase64(rawAes);
      const aesKey = await importAesKeyRaw(aesKeyB64);

      setStatus("Decrypting answers with AES-256-GCM...");
      const cipherBuf = base64ToArrayBuffer(submission.encrypted_answers);
      const ivBuf = base64ToArrayBuffer(submission.iv);

      const plain = await aesGcmDecrypt(aesKey, new Uint8Array(ivBuf), new Uint8Array(cipherBuf));
      setDecrypted(plain);

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(plain);
        setParsedAnswers(parsed);
      } catch { }

      setStatus("🔓 Decrypted successfully");
      setStatusType("success");
    } catch (err) {
      console.error(err);
      setStatus(`Decrypt error: ${err.message}`);
      setStatusType("error");
    }
  };

  const signAndPublish = async () => {
    try {
      if (!selected) throw new Error("No submission selected");
      setStatus("Preparing signed result...");
      setStatusType("loading");

      const evaluated_at = new Date().toISOString();

      const resultObj = {
        exam_id: selected.exam_id || selectedExamId,
        evaluated_at,
        marks: Number(marks),
        student_id: selected.student_id,
      };

      // Canonicalize: sort keys (must match backend sort_keys=True)
      const sortedKeys = Object.keys(resultObj).sort();
      const ordered = {};
      for (const k of sortedKeys) ordered[k] = resultObj[k];
      const canonical = JSON.stringify(ordered);
      const dataBuf = new TextEncoder().encode(canonical);

      // Load instructor RSA-PSS signing private key
      const b64SignPk = localStorage.getItem("instructor_sign_private_key");
      if (!b64SignPk) {
        throw new Error("Instructor signing private key not found. Please generate keys first.");
      }

      const signPriv = await importPrivateKeyFromBase64(b64SignPk);
      const signatureB64 = await signWithPrivateKey(signPriv, dataBuf);

      // Build payload
      const payload = {
        exam_id: resultObj.exam_id,
        student_id: resultObj.student_id,
        marks: resultObj.marks,
        feedback: feedback || null,
        evaluated_at,
        instructor_signature: signatureB64,
      };

      setStatus("Publishing signed result...");
      const res = await authFetch(`${API_BASE_URL}/results/publish`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to publish result");
      }

      setStatus("✅ Result published successfully!");
      setStatusType("success");

      // Clear form
      setDecrypted("");
      setParsedAnswers(null);
      setMarks(0);
      setFeedback("");
      setSelected(null);
    } catch (err) {
      console.error(err);
      setStatus(`Publish error: ${err.message}`);
      setStatusType("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                INSTRUCTOR
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Evaluate Submissions</h1>
            <p className="text-sm text-slate-500">Decrypt student answers and publish signed results</p>
          </div>
          <Link
            to="/instructor/dashboard"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Key Warning */}
        {!hasKeys && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600">warning</span>
              <div>
                <p className="font-semibold text-amber-800">Private Keys Required</p>
                <p className="text-sm text-amber-600">
                  You need to generate and store your private keys to decrypt submissions.{" "}
                  <Link to="/instructor/keygen" className="underline">
                    Go to Key Generation
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Exam Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Select Exam</h2>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Exam to Evaluate
              </label>
              {isLoadingExams ? (
                <div className="flex items-center gap-2 text-slate-500 py-3">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Loading exams...
                </div>
              ) : (
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Select an exam --</option>
                  {exams.map((exam) => (
                    <option key={exam.exam_id || exam.id} value={exam.exam_id || exam.id}>
                      {exam.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={fetchSubmissions}
              disabled={!selectedExamId || !hasKeys}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${selectedExamId && hasKeys
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
            >
              <span className="material-symbols-outlined">download</span>
              Fetch Submissions
            </button>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${statusType === "error"
                ? "bg-red-50 border-red-200"
                : statusType === "success"
                  ? "bg-emerald-50 border-emerald-200"
                  : statusType === "loading"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-slate-50 border-slate-200"
              }`}
          >
            <span
              className={`material-symbols-outlined ${statusType === "loading" ? "animate-spin" : ""
                } ${statusType === "error"
                  ? "text-red-600"
                  : statusType === "success"
                    ? "text-emerald-600"
                    : "text-blue-600"
                }`}
            >
              {statusType === "error"
                ? "error"
                : statusType === "success"
                  ? "check_circle"
                  : "progress_activity"}
            </span>
            <span
              className={`font-medium ${statusType === "error"
                  ? "text-red-700"
                  : statusType === "success"
                    ? "text-emerald-700"
                    : "text-blue-700"
                }`}
            >
              {status}
            </span>
          </div>
        )}

        {/* Submissions List */}
        {subs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Student Submissions ({subs.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {subs.map((s) => (
                <div
                  key={s.submission_id}
                  className={`p-4 flex items-center justify-between ${selected?.submission_id === s.submission_id ? "bg-purple-50" : ""
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600">person</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Student: {s.student_id?.slice(0, 8)}...
                      </p>
                      <p className="text-sm text-slate-500">
                        Submitted: {new Date(s.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                      <span className="material-symbols-outlined text-blue-600 text-sm">lock</span>
                      <span className="text-sm text-blue-700">Encrypted</span>
                    </div>
                    <button
                      onClick={() => decryptSubmission(s)}
                      disabled={!hasKeys}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${hasKeys
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      Decrypt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decrypted Answers & Evaluation Form */}
        {decrypted && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">verified</span>
                <h2 className="text-lg font-bold text-slate-900">Decrypted Answers</h2>
              </div>
              <p className="text-sm text-slate-500">
                Student: {selected?.student_id}
              </p>
            </div>

            <div className="p-6">
              {/* Parsed Answers */}
              {parsedAnswers ? (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Student Responses</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    {parsedAnswers.answers?.map((a, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                        <span className="text-slate-600">Question {a.question_id}</span>
                        <span className="font-medium text-slate-900 px-3 py-1 bg-blue-100 rounded">
                          {a.selected}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 text-sm text-slate-500">
                      Submitted: {parsedAnswers.submitted_at && new Date(parsedAnswers.submitted_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Raw Data</h3>
                  <pre className="bg-slate-50 rounded-lg p-4 whitespace-pre-wrap text-sm text-slate-700 overflow-x-auto">
                    {decrypted}
                  </pre>
                </div>
              )}

              {/* Evaluation Form */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Assign Grade</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Marks (out of 100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback (optional)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Add feedback for the student..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <button
                    onClick={signAndPublish}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined">draw</span>
                    Sign & Publish Result
                  </button>
                  <p className="text-sm text-slate-500">
                    Your result will be digitally signed with your private key (RSA-PSS)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {subs.length === 0 && selectedExamId && status && statusType === "success" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inbox</span>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Submissions Yet</h3>
            <p className="text-slate-500">No students have submitted answers for this exam.</p>
          </div>
        )}
      </main>
    </div>
  );
}
