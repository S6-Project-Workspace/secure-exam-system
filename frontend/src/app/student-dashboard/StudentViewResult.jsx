/**
 * StudentViewResult.jsx
 * 
 * Displays exam results with cryptographic signature verification.
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

export default function StudentViewResult() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [signatureValid, setSignatureValid] = useState(null);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/login");
            return;
        }

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

            // Verify signature
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

            // Parse instructor public key (may be JSON with oaep/pss)
            let pssPem = instructorPubKey;
            try {
                const keyObj = JSON.parse(instructorPubKey);
                pssPem = keyObj.pss || keyObj.oaep;
            } catch { }

            if (!pssPem) {
                setSignatureValid(false);
                return;
            }

            // Import PSS public key
            const pubKey = await importRsaPssPublicKeyFromPem(pssPem);

            // Recreate canonical JSON (must match backend)
            const canonicalObj = {
                evaluated_at: resultData.evaluated_at,
                exam_id: resultData.exam_id,
                marks: resultData.marks,
                student_id: resultData.student_id,
            };
            const canonicalJson = JSON.stringify(canonicalObj);
            const dataBuf = new TextEncoder().encode(canonicalJson);

            // Verify signature
            const valid = await verifyRsaPssSignature(
                pubKey,
                resultData.instructor_signature,
                dataBuf
            );
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark transition-colors duration-300">
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-blue-600 dark:text-blue-400 animate-spin mb-4">
                        progress_activity
                    </span>
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Loading result...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-background-dark py-10 px-4 transition-colors duration-300">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
                        <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
                        <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Result Not Found</h2>
                        <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
                        <Link
                            to="/student/dashboard"
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const resultData = result?.result;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark font-body transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 px-6 py-4 transition-colors duration-300">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                                RESULT
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded">
                                {examId?.slice(0, 8).toUpperCase()}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Result</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
                            aria-label="Toggle theme"
                        >
                            <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100 text-amber-500'}`}>
                                light_mode
                            </span>
                            <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100 text-blue-400' : 'opacity-0 -rotate-90 scale-0'}`}>
                                dark_mode
                            </span>
                        </button>
                        <Link
                            to="/student/dashboard"
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Signature Verification Banner */}
                <div
                    className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${signatureValid === null || verifying
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            : signatureValid
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                        }`}
                >
                    {verifying ? (
                        <>
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 animate-spin">
                                progress_activity
                            </span>
                            <div>
                                <p className="font-semibold text-blue-800 dark:text-blue-300">Verifying Signature...</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    Checking instructor's digital signature
                                </p>
                            </div>
                        </>
                    ) : signatureValid ? (
                        <>
                            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-3xl">
                                verified
                            </span>
                            <div>
                                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                                    ✅ Signature Verified
                                </p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    This result is authentic and has not been tampered with.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">
                                gpp_bad
                            </span>
                            <div>
                                <p className="font-semibold text-red-800 dark:text-red-300">⚠️ Signature Invalid</p>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    Warning: This result may have been tampered with. Contact your instructor.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Only show result if signature is valid */}
                {signatureValid === false && (
                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-red-200 dark:border-red-800 p-8 text-center transition-colors duration-300">
                        <span className="material-symbols-outlined text-5xl text-red-400 mb-4">
                            lock
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Result Cannot Be Displayed
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            The cryptographic signature verification failed. This result cannot be trusted.
                        </p>
                        <Link
                            to="/student/dashboard"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                )}

                {signatureValid && resultData && (
                    <>
                        {/* Result Card */}
                        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm mb-1">Your Score</p>
                                        <p className="text-5xl font-bold">{resultData.marks}</p>
                                        <p className="text-blue-100 text-sm mt-1">out of 100</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end mb-2">
                                            <span className="material-symbols-outlined text-emerald-300">
                                                verified
                                            </span>
                                            <span className="text-sm text-emerald-200">Digitally Signed</span>
                                        </div>
                                        <p className="text-blue-100 text-sm">
                                            Evaluated: {new Date(resultData.evaluated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Result Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <p className="text-sm text-slate-500 mb-1">Exam ID</p>
                                        <p className="font-mono text-slate-900">{resultData.exam_id}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <p className="text-sm text-slate-500 mb-1">Student ID</p>
                                        <p className="font-mono text-slate-900">{resultData.student_id}</p>
                                    </div>
                                </div>

                                {resultData.feedback && (
                                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                        <p className="text-sm font-semibold text-blue-800 mb-2">
                                            Instructor Feedback
                                        </p>
                                        <p className="text-slate-700">{resultData.feedback}</p>
                                    </div>
                                )}

                                {/* Security Info */}
                                <div className="border-t border-slate-200 pt-6 mt-6">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                        Security Information
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
                                            <span className="material-symbols-outlined text-emerald-600">verified</span>
                                            <span className="text-sm text-emerald-700">RSA-PSS Signed</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                                            <span className="material-symbols-outlined text-blue-600">lock</span>
                                            <span className="text-sm text-blue-700">Tamper-Proof</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                                            <span className="material-symbols-outlined text-slate-600">schedule</span>
                                            <span className="text-sm text-slate-700">
                                                {new Date(resultData.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <Link
                                to="/student/dashboard"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
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
