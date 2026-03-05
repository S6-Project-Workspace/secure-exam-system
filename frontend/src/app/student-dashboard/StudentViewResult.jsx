/**
 * StudentViewResult.jsx
 * 
 * Displays exam results with cryptographic signature verification.
 * Shows per-question breakdown with correct/incorrect indicators.
 * Verifies instructor RSA-PSS signature before showing results.
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { authFetch, getToken } from "../auth/authHelpers";
import { useTheme } from "../../context/ThemeContext";
import {
    importRsaPssPublicKeyFromPem,
    verifyRsaPssSignature,
} from "../../cryptoUtils";
import DashboardHeaderNew from "./components/DashboardHeaderNew";

export default function StudentViewResult() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [signatureValid, setSignatureValid] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [feedbackData, setFeedbackData] = useState(null);

    useEffect(() => {
        const token = getToken();
        if (!token) { navigate("/login"); return; }
        fetchResult();
    }, [examId, navigate]);

    const fetchResult = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await authFetch(`${API_BASE_URL}/results/${examId}`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to fetch result");
            }
            const data = await response.json();
            setResult(data);

            // Parse feedback JSON
            if (data.result?.feedback) {
                try {
                    const parsed = JSON.parse(data.result.feedback);
                    setFeedbackData(parsed);
                } catch {
                    // Plain text feedback
                    setFeedbackData({ text: data.result.feedback, breakdown: [] });
                }
            }

            if (data.result && data.instructor_public_key) {
                await verifySignature(data.result, data.instructor_public_key);
            }
        } catch (err) {
            console.error("Fetch result failed:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const verifySignature = async (resultData, instructorPubKey) => {
        try {
            setVerifying(true);
            let pssPem = instructorPubKey;
            try {
                const keyObj = JSON.parse(instructorPubKey);
                pssPem = keyObj.pss || keyObj.oaep;
            } catch { }

            if (!pssPem) { setSignatureValid(false); return; }

            const pubKey = await importRsaPssPublicKeyFromPem(pssPem);
            const canonicalObj = {
                evaluated_at: resultData.evaluated_at,
                exam_id: resultData.exam_id,
                marks: resultData.marks,
                student_id: resultData.student_id,
            };
            const canonicalJson = JSON.stringify(canonicalObj);
            const dataBuf = new TextEncoder().encode(canonicalJson);
            const valid = await verifyRsaPssSignature(pubKey, resultData.instructor_signature, dataBuf);
            setSignatureValid(valid);
        } catch (err) {
            console.error("Signature verification error:", err);
            setSignatureValid(false);
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-blue-500 animate-spin mb-4">progress_activity</span>
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Loading result...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'} py-10 px-4`}>
                <div className="max-w-2xl mx-auto">
                    <div className={`${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-2xl p-8 text-center`}>
                        <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
                        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-800'} mb-2`}>Result Not Found</h2>
                        <p className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-6`}>{error}</p>
                        <Link to="/student/dashboard" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Return to Dashboard</Link>
                    </div>
                </div>
            </div>
        );
    }

    const resultData = result?.result;
    const correctCount = feedbackData?.breakdown?.filter(d => d.is_correct).length || 0;
    const totalQuestions = feedbackData?.breakdown?.length || 0;
    const percentage = feedbackData?.percentage || (resultData?.marks ? Math.round(resultData.marks) : 0);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'} font-body transition-colors duration-300`}>
            {/* Standard Header */}
            <DashboardHeaderNew />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Signature Verification Banner */}
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${signatureValid === null || verifying
                    ? `${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`
                    : signatureValid
                        ? `${isDarkMode ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`
                        : `${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}`}>
                    {verifying ? (
                        <>
                            <span className="material-symbols-outlined text-blue-500 animate-spin">progress_activity</span>
                            <div>
                                <p className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Verifying Signature...</p>
                                <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Checking instructor's digital signature</p>
                            </div>
                        </>
                    ) : signatureValid ? (
                        <>
                            <span className="material-symbols-outlined text-emerald-500 text-3xl">verified</span>
                            <div>
                                <p className={`font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>✅ Signature Verified</p>
                                <p className={`text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>This result is authentic and has not been tampered with.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-red-500 text-3xl">gpp_bad</span>
                            <div>
                                <p className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>⚠️ Signature Invalid</p>
                                <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Warning: This result may have been tampered with.</p>
                            </div>
                        </>
                    )}
                </div>

                {signatureValid === false && (
                    <div className={`${isDarkMode ? 'bg-[#1a2332] border-red-800' : 'bg-white border-red-200'} rounded-2xl border p-8 text-center`}>
                        <span className="material-symbols-outlined text-5xl text-red-400 mb-4">lock</span>
                        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>Result Cannot Be Displayed</h2>
                        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-6`}>The cryptographic signature verification failed.</p>
                        <Link to="/student/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Return to Dashboard</Link>
                    </div>
                )}

                {signatureValid && resultData && (
                    <>
                        {/* Score Card */}
                        <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700' : 'bg-white border-slate-200'} rounded-2xl shadow-lg border overflow-hidden mb-6`}>
                            <div className={`px-8 py-6 ${percentage >= 60 ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : percentage >= 40 ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-red-600 to-rose-600'} text-white`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-sm mb-1">Score</p>
                                        <p className="text-5xl font-bold">{feedbackData?.scored_marks ?? resultData.marks}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-6xl font-bold opacity-90">{percentage}%</p>
                                        <div className="flex items-center gap-2 justify-end mt-2">
                                            <span className="material-symbols-outlined text-emerald-200">verified</span>
                                            <span className="text-sm text-emerald-100">Digitally Signed</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Score bar */}
                                <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
                                    <div className="h-full rounded-full bg-white/80 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                </div>

                                {totalQuestions > 0 && (
                                    <div className="mt-3 flex gap-4 text-sm text-white/80">
                                        <span>✓ {correctCount} correct</span>
                                        <span>✗ {totalQuestions - correctCount} incorrect</span>
                                        <span>Total: {totalQuestions} questions</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructor Feedback */}
                        {feedbackData?.text && (
                            <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} rounded-xl border p-5 mb-6`}>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-blue-500 mt-0.5">chat</span>
                                    <div>
                                        <p className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-1`}>Instructor Feedback</p>
                                        <p className={`${isDarkMode ? 'text-blue-200' : 'text-slate-700'}`}>{feedbackData.text}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Per-Question Breakdown */}
                        {feedbackData?.breakdown?.length > 0 && (
                            <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700' : 'bg-white border-slate-200'} rounded-2xl shadow-sm border overflow-hidden mb-6`}>
                                <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                    <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Question-by-Question Breakdown</h2>
                                </div>

                                <div className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                                    {feedbackData.breakdown.map((d, idx) => (
                                        <div key={d.question_id || idx} className="p-5">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${d.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    <span className="material-symbols-outlined text-lg">{d.is_correct ? 'check' : 'close'}</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                            <span className={`text-xs font-bold uppercase mr-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Q{idx + 1}</span>
                                                            {d.question_text}
                                                        </p>
                                                        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold ${d.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {d.earned}/{d.marks}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col gap-2 mt-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {d.student_answer ? (
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                                                    d.is_correct
                                                                        ? isDarkMode ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                        : isDarkMode ? 'bg-red-900/30 text-red-300 border-red-700/50' : 'bg-red-50 text-red-700 border-red-200'
                                                                }`}>
                                                                    <span className="material-symbols-outlined text-xs">{d.is_correct ? 'check_circle' : 'cancel'}</span>
                                                                    <span className="font-semibold">Your answer:</span>&nbsp;{d.student_answer}
                                                                </span>
                                                            ) : (
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${isDarkMode ? 'bg-amber-900/20 text-amber-300 border-amber-700/50' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                                    <span className="material-symbols-outlined text-xs">warning</span>
                                                                    Not answered
                                                                </span>
                                                            )}
                                                            {!d.is_correct && (
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${isDarkMode ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                                    <span className="material-symbols-outlined text-xs">check_circle</span>
                                                                    <span className="font-semibold">Correct answer:</span>&nbsp;{d.correct_answer}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {d.feedback && (
                                                            <div className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs border ${isDarkMode ? 'bg-blue-900/20 text-blue-200 border-blue-800/40' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                                <span className="material-symbols-outlined text-xs mt-0.5">chat</span>
                                                                <span><span className="font-semibold">Feedback:</span> {d.feedback}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security Info */}
                        <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700' : 'bg-white border-slate-200'} rounded-2xl border p-6 mb-6`}>
                            <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-3`}>Security Information</h4>
                            <div className="flex flex-wrap gap-3">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
                                    <span className="material-symbols-outlined text-emerald-500">verified</span>
                                    <span className={`text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>RSA-PSS Signed</span>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                                    <span className="material-symbols-outlined text-blue-500">lock</span>
                                    <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Tamper-Proof</span>
                                </div>
                                {resultData.evaluated_at && (
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        <span className={`material-symbols-outlined ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>schedule</span>
                                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                                            {new Date(resultData.evaluated_at).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center">
                            <Link to="/student/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span>
                                Return to Dashboard
                            </Link>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
