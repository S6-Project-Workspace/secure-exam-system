/**
 * InstructorEvaluate.jsx
 * 
 * Instructor page to evaluate student submissions.
 * - Fetches encrypted submissions for an exam
 * - Unwraps AES keys (RSA-OAEP) and decrypts answers (AES-GCM)
 * - Auto-grades MCQ answers by comparing with answer key
 * - Shows per-question comparison with correct/incorrect indicators
 * - Signs results (RSA-PSS) and publishes to backend
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";
import { getToken, authFetch } from "./app/auth/authHelpers";
import { useTheme } from "./context/ThemeContext";
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
  const { isDarkMode, toggleTheme } = useTheme();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [subs, setSubs] = useState([]);
  const [answerKey, setAnswerKey] = useState(null);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [selected, setSelected] = useState(null);
  const [parsedAnswers, setParsedAnswers] = useState(null);
  const [gradingResult, setGradingResult] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [hasKeys, setHasKeys] = useState(false);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [publishedStudents, setPublishedStudents] = useState(new Set());

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate("/login"); return; }
    const hasOaepKey = !!localStorage.getItem("instructor_oaep_private_key");
    const hasSignKey = !!localStorage.getItem("instructor_pss_private_key");
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
      setStatus("Fetching submissions & answer key...");
      setStatusType("loading");

      // Fetch submissions and answer key in parallel
      const [subsRes, keyRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/instructor/submissions/${selectedExamId}`),
        authFetch(`${API_BASE_URL}/instructor/exam/${selectedExamId}/answer-key`),
      ]);

      if (!subsRes.ok) {
        const err = await subsRes.json();
        throw new Error(err.detail || "Failed to fetch submissions");
      }
      if (!keyRes.ok) {
        const err = await keyRes.json();
        throw new Error(err.detail || "Failed to fetch answer key");
      }

      const subsData = await subsRes.json();
      const keyData = await keyRes.json();

      setSubs(subsData.submissions || []);
      setAnswerKey(keyData);
      setStatus(`Found ${subsData.submissions?.length || 0} submissions · ${keyData.total_questions} questions · ${keyData.total_marks} total marks`);
      setStatusType("success");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
      setStatusType("error");
    }
  };

  const autoGrade = (studentAnswers) => {
    if (!answerKey || !studentAnswers) return null;

    const answerMap = {};
    (studentAnswers.answers || []).forEach(a => {
      answerMap[a.question_id] = a.selected;
    });

    let totalMarks = 0;
    let scoredMarks = 0;
    const details = answerKey.questions.map(q => {
      const studentAnswer = answerMap[q.question_id] || null;
      const isCorrect = studentAnswer === q.correct_answer;
      const earned = isCorrect ? q.marks : 0;
      totalMarks += q.marks;
      scoredMarks += earned;

      return {
        question_id: q.question_id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        student_answer: studentAnswer,
        is_correct: isCorrect,
        marks: q.marks,
        earned,
      };
    });

    return { details, totalMarks, scoredMarks, percentage: Math.round((scoredMarks / totalMarks) * 100) };
  };

  const decryptSubmission = async (submission) => {
    try {
      setSelected(submission);
      setStatus("Unwrapping AES key with RSA-OAEP...");
      setStatusType("loading");
      setParsedAnswers(null);
      setGradingResult(null);
      setFeedback("");

      const b64OaepPk = localStorage.getItem("instructor_oaep_private_key");
      if (!b64OaepPk) throw new Error("Instructor RSA-OAEP private key not found.");

      const priv = await importRsaOaepPrivateKeyFromBase64(b64OaepPk);
      const rawAes = await rsaOaepUnwrap(priv, submission.wrapped_aes_key_for_instructor);

      const aesKeyB64 = bufferToBase64(rawAes);
      const aesKey = await importAesKeyRaw(aesKeyB64);

      setStatus("Decrypting answers with AES-256-GCM...");
      const cipherBuf = base64ToArrayBuffer(submission.encrypted_answers);
      const ivBuf = base64ToArrayBuffer(submission.iv);
      const plain = await aesGcmDecrypt(aesKey, new Uint8Array(ivBuf), new Uint8Array(cipherBuf));

      const parsed = JSON.parse(plain);
      setParsedAnswers(parsed);

      // Auto-grade
      const result = autoGrade(parsed);
      setGradingResult(result);

      setStatus(`Decrypted & graded: ${result.scoredMarks}/${result.totalMarks} (${result.percentage}%)`);
      setStatusType("success");
    } catch (err) {
      console.error(err);
      setStatus(`Decrypt error: ${err.message}`);
      setStatusType("error");
    }
  };

  const signAndPublish = async () => {
    try {
      if (!selected || !gradingResult) throw new Error("No graded submission selected");
      setStatus("Preparing signed result...");
      setStatusType("loading");

      const evaluated_at = new Date().toISOString();

      // Build feedback JSON with per-question details + text feedback
      const feedbackObj = {
        text: feedback || "",
        breakdown: gradingResult.details.map(d => ({
          question_id: d.question_id,
          question_text: d.question_text,
          correct_answer: d.correct_answer,
          student_answer: d.student_answer,
          is_correct: d.is_correct,
          marks: d.marks,
          earned: d.earned,
        })),
        total_marks: gradingResult.totalMarks,
        scored_marks: gradingResult.scoredMarks,
        percentage: gradingResult.percentage,
      };

      const resultObj = {
        exam_id: selected.exam_id || selectedExamId,
        evaluated_at,
        marks: Number(gradingResult.scoredMarks),
        student_id: selected.student_id,
      };

      const sortedKeys = Object.keys(resultObj).sort();
      const ordered = {};
      for (const k of sortedKeys) ordered[k] = resultObj[k];
      const canonical = JSON.stringify(ordered);
      const dataBuf = new TextEncoder().encode(canonical);

      const b64SignPk = localStorage.getItem("instructor_pss_private_key");
      if (!b64SignPk) throw new Error("Instructor signing key not found.");

      const signPriv = await importPrivateKeyFromBase64(b64SignPk);
      const signatureB64 = await signWithPrivateKey(signPriv, dataBuf);

      const payload = {
        exam_id: resultObj.exam_id,
        student_id: resultObj.student_id,
        marks: resultObj.marks,
        feedback: JSON.stringify(feedbackObj),
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
      setPublishedStudents(prev => new Set([...prev, selected.student_id]));

      // Clear form
      setParsedAnswers(null);
      setGradingResult(null);
      setFeedback("");
      setSelected(null);
    } catch (err) {
      console.error(err);
      setStatus(`Publish error: ${err.message}`);
      setStatusType("error");
    }
  };

  const optionLabels = ["A", "B", "C", "D"];
  const getOptionText = (q, opt) => {
    const map = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
    return map[opt] || opt;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'} font-body transition-colors duration-300`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700' : 'bg-white border-slate-200'} border-b px-6 py-4 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'} text-xs font-semibold rounded`}>
                INSTRUCTOR
              </span>
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Evaluate Submissions</h1>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Decrypt, auto-grade, and publish signed results</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className={`relative flex items-center justify-center w-9 h-9 rounded-full ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'} transition-all duration-300`} aria-label="Toggle theme">
              <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100 text-amber-500'}`}>light_mode</span>
              <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100 text-blue-400' : 'opacity-0 -rotate-90 scale-0'}`}>dark_mode</span>
            </button>
            <Link to="/instructor/dashboard" className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>
              <span className="material-symbols-outlined">arrow_back</span>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Key Warning */}
        {!hasKeys && (
          <div className={`mb-6 p-4 ${isDarkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border rounded-xl`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600">warning</span>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>Private Keys Required</p>
                <p className={`text-sm ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`}>
                  Generate and store your private keys to decrypt submissions.{" "}
                  <Link to="/instructor/keygen" className="underline">Go to Key Generation</Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Exam Selection */}
        <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700' : 'bg-white border-slate-200'} rounded-2xl shadow-sm border p-6 mb-6 transition-colors duration-300`}>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>Select Exam</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Exam to Evaluate</label>
              {isLoadingExams ? (
                <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} py-3`}>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Loading exams...
                </div>
              ) : (
                <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'}`}>
                  <option value="">-- Select an exam --</option>
                  {exams.map((exam) => (
                    <option key={exam.exam_id || exam.id} value={exam.exam_id || exam.id}>{exam.title}</option>
                  ))}
                </select>
              )}
            </div>
            <button onClick={fetchSubmissions} disabled={!selectedExamId || !hasKeys}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${selectedExamId && hasKeys
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : `${isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'} cursor-not-allowed`}`}>
              <span className="material-symbols-outlined">download</span>
              Fetch Submissions
            </button>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${statusType === "error"
            ? `${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`
            : statusType === "success"
              ? `${isDarkMode ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`
              : `${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}`}>
            <span className={`material-symbols-outlined ${statusType === "loading" ? "animate-spin" : ""} ${statusType === "error" ? "text-red-500" : statusType === "success" ? "text-emerald-500" : "text-blue-500"}`}>
              {statusType === "error" ? "error" : statusType === "success" ? "check_circle" : "progress_activity"}
            </span>
            <span className={`font-medium text-sm ${statusType === "error" ? `${isDarkMode ? 'text-red-400' : 'text-red-700'}` : statusType === "success" ? `${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}` : `${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}`}>
              {status}
            </span>
          </div>
        )}

        {/* Submissions List */}
        {subs.length > 0 && !gradingResult && (
          <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700' : 'bg-white border-slate-200'} rounded-2xl shadow-sm border overflow-hidden mb-6`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Student Submissions ({subs.length})</h2>
            </div>
            <div className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {subs.map((s) => {
                const isPublished = publishedStudents.has(s.student_id);
                return (
                  <div key={s.submission_id} className={`p-4 flex items-center justify-between ${selected?.submission_id === s.submission_id ? `${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'}` : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>person</span>
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Student: {s.student_id?.slice(0, 8)}...</p>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : "Submitted"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isPublished ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Published
                        </span>
                      ) : (
                        <>
                          <div className={`flex items-center gap-2 px-3 py-1 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg`}>
                            <span className="material-symbols-outlined text-blue-600 text-sm">lock</span>
                            <span className="text-sm text-blue-600">Encrypted</span>
                          </div>
                          <button onClick={() => decryptSubmission(s)} disabled={!hasKeys}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${hasKeys ? "bg-amber-500 hover:bg-amber-600 text-white" : `${isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'} cursor-not-allowed`}`}>
                            <span className="material-symbols-outlined text-sm">lock_open</span>
                            Decrypt & Grade
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grading Result - Per-Question Comparison */}
        {gradingResult && (
          <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700' : 'bg-white border-slate-200'} rounded-2xl shadow-sm border overflow-hidden mb-6`}>
            {/* Score Header */}
            <div className={`px-6 py-5 ${isDarkMode ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-slate-700' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-slate-200'} border-b`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${gradingResult.percentage >= 60 ? 'bg-emerald-500/20 text-emerald-400' : gradingResult.percentage >= 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                    <span className="material-symbols-outlined text-3xl">
                      {gradingResult.percentage >= 60 ? 'emoji_events' : gradingResult.percentage >= 40 ? 'trending_flat' : 'trending_down'}
                    </span>
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Auto-Grading Result
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Student: {selected?.student_id?.slice(0, 12)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-bold ${gradingResult.percentage >= 60 ? 'text-emerald-500' : gradingResult.percentage >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                    {gradingResult.scoredMarks}/{gradingResult.totalMarks}
                  </p>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{gradingResult.percentage}%</p>
                </div>
              </div>

              {/* Score Bar */}
              <div className={`mt-4 h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} overflow-hidden`}>
                <div className={`h-full rounded-full transition-all duration-1000 ${gradingResult.percentage >= 60 ? 'bg-emerald-500' : gradingResult.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${gradingResult.percentage}%` }}></div>
              </div>
            </div>

            {/* Per-Question Breakdown */}
            <div className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
              {gradingResult.details.map((d, idx) => (
                <div key={d.question_id || idx} className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Question Number & Status */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${d.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      <span className="material-symbols-outlined text-lg">{d.is_correct ? 'check' : 'close'}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Question Text */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          <span className={`text-xs font-bold uppercase mr-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Q{idx + 1}</span>
                          {d.question_text}
                        </p>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold ${d.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {d.earned}/{d.marks}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {["A", "B", "C", "D"].map(opt => {
                          const optText = getOptionText(d, opt);
                          if (!optText || optText === "N/A") return null;
                          const isCorrectOpt = opt === d.correct_answer;
                          const isStudentOpt = opt === d.student_answer;

                          let borderColor = isDarkMode ? 'border-slate-700' : 'border-slate-200';
                          let bgColor = 'transparent';
                          let textColor = isDarkMode ? 'text-slate-300' : 'text-slate-700';
                          let icon = null;

                          if (isCorrectOpt) {
                            borderColor = 'border-emerald-500/50';
                            bgColor = isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50';
                            textColor = isDarkMode ? 'text-emerald-300' : 'text-emerald-700';
                            icon = <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>;
                          }
                          if (isStudentOpt && !isCorrectOpt) {
                            borderColor = 'border-red-500/50';
                            bgColor = isDarkMode ? 'bg-red-500/10' : 'bg-red-50';
                            textColor = isDarkMode ? 'text-red-300' : 'text-red-700';
                            icon = <span className="material-symbols-outlined text-red-500 text-sm">cancel</span>;
                          }

                          return (
                            <div key={opt} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgColor}`}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrectOpt ? 'bg-emerald-500 text-white' : isStudentOpt ? 'bg-red-500 text-white' : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                                {opt}
                              </span>
                              <span className={`text-sm flex-1 ${textColor}`}>{optText}</span>
                              {icon}
                            </div>
                          );
                        })}
                      </div>

                      {/* Wrong answer label */}
                      {!d.is_correct && d.student_answer && (
                        <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          Student chose <span className="text-red-500 font-semibold">{d.student_answer}</span>, correct was <span className="text-emerald-500 font-semibold">{d.correct_answer}</span>
                        </p>
                      )}
                      {!d.student_answer && (
                        <p className={`mt-2 text-xs text-amber-500`}>Not answered</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback & Publish */}
            <div className={`p-6 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} border-t`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>Feedback & Publish</h3>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Feedback for Student (optional)
                </label>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? 'border-slate-600 bg-slate-800 text-white placeholder-slate-500' : 'border-slate-300 bg-white text-slate-900'}`}
                  placeholder="e.g. Good effort! Review topics on database normalization..." />
              </div>

              <div className="flex items-center gap-4">
                <button onClick={signAndPublish}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                  <span className="material-symbols-outlined">draw</span>
                  Sign & Publish Result ({gradingResult.scoredMarks}/{gradingResult.totalMarks})
                </button>
                <button onClick={() => { setGradingResult(null); setParsedAnswers(null); setSelected(null); }}
                  className={`px-4 py-3 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} rounded-xl font-medium transition-colors`}>
                  ← Back to List
                </button>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} mt-3`}>
                Result will be digitally signed with your RSA-PSS private key
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {subs.length === 0 && selectedExamId && status && statusType === "success" && (
          <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700' : 'bg-white border-slate-200'} rounded-2xl shadow-sm border p-12 text-center`}>
            <span className={`material-symbols-outlined text-5xl ${isDarkMode ? 'text-slate-600' : 'text-slate-300'} mb-4`}>inbox</span>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>No Submissions Yet</h3>
            <p className={isDarkMode ? 'text-slate-500' : 'text-slate-500'}>No students have submitted answers for this exam.</p>
          </div>
        )}
      </main>
    </div>
  );
}
