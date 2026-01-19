/**
 * AddMCQs.jsx
 * 
 * Step 2.3: Add MCQ questions to an exam
 * Allows instructors to add multiple choice questions to a specific exam.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { getToken, authFetch } from "../auth/authHelpers";

export default function AddMCQs() {
    const navigate = useNavigate();
    const { examId } = useParams();

    const [examTitle, setExamTitle] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Current question being edited
    const [currentQuestion, setCurrentQuestion] = useState({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        marks: 1
    });

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/login");
            return;
        }
        fetchExamData();
    }, [navigate, examId]);

    const fetchExamData = async () => {
        try {
            // Fetch existing questions for this exam
            const response = await authFetch(
                `${API_BASE_URL}/questions/list?exam_id=${examId}`
            );
            const data = await response.json();

            if (response.ok) {
                setQuestions(data.questions || []);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async () => {
        // Validate
        if (!currentQuestion.question_text.trim()) {
            setError("Question text is required");
            return;
        }
        if (!currentQuestion.option_a.trim() || !currentQuestion.option_b.trim()) {
            setError("At least options A and B are required");
            return;
        }

        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await authFetch(`${API_BASE_URL}/questions/add`, {
                method: "POST",
                body: JSON.stringify({
                    exam_id: examId,
                    question_text: currentQuestion.question_text,
                    option_a: currentQuestion.option_a,
                    option_b: currentQuestion.option_b,
                    option_c: currentQuestion.option_c || "N/A",
                    option_d: currentQuestion.option_d || "N/A",
                    correct_answer: currentQuestion.correct_answer,
                    marks: currentQuestion.marks
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to add question");
            }

            // Add to list and clear form
            setQuestions([...questions, data.question]);
            setCurrentQuestion({
                question_text: "",
                option_a: "",
                option_b: "",
                option_c: "",
                option_d: "",
                correct_answer: "A",
                marks: 1
            });
            setSuccessMessage("Question added successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);

        } catch (err) {
            console.error("Add question error:", err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin material-symbols-outlined text-4xl text-blue-900">progress_activity</div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col font-body">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-[#1E3A8A] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <span className="material-symbols-outlined text-2xl">school</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold leading-none tracking-tight">Secure Online Examination System</h1>
                                <span className="text-xs text-blue-200 font-medium uppercase tracking-wider">Faculty Portal</span>
                            </div>
                        </div>
                        <Link to="/instructor/dashboard" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-200 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-slate-500">
                    <Link to="/instructor/dashboard" className="hover:text-blue-900">Dashboard</Link>
                    <span>›</span>
                    <span className="hover:text-blue-900">Exams</span>
                    <span>›</span>
                    <span className="text-slate-900 font-medium">Add Questions</span>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow py-8 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Add Exam Questions</h2>
                            <p className="text-slate-500">
                                Exam ID: <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{examId}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Questions Added</p>
                            <p className="text-3xl font-bold text-blue-900">{questions.length}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                            <span className="material-symbols-outlined">error</span>
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
                            <span className="material-symbols-outlined">check_circle</span>
                            <p className="text-sm font-medium">{successMessage}</p>
                        </div>
                    )}

                    {/* Add Question Form */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
                        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                            <h3 className="text-lg font-bold text-slate-900">New Question</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Question Text */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Question Text <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={currentQuestion.question_text}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                                    placeholder="Enter your question here..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Answer Options */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Answer Options
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {["A", "B", "C", "D"].map((opt) => (
                                        <div key={opt} className="flex items-center gap-3">
                                            <div
                                                onClick={() => setCurrentQuestion({ ...currentQuestion, correct_answer: opt })}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${currentQuestion.correct_answer === opt
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {opt}
                                            </div>
                                            <input
                                                type="text"
                                                value={currentQuestion[`option_${opt.toLowerCase()}`]}
                                                onChange={(e) => setCurrentQuestion({
                                                    ...currentQuestion,
                                                    [`option_${opt.toLowerCase()}`]: e.target.value
                                                })}
                                                placeholder={`Option ${opt}`}
                                                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-slate-400">Click the circle to mark the correct answer</p>
                            </div>

                            {/* Add Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleAddQuestion}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-colors"
                                >
                                    {saving ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">add</span>
                                            Add Question
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Existing Questions List */}
                    {questions.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900">Added Questions ({questions.length})</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {questions.map((q, index) => (
                                    <div key={q.question_id || index} className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-slate-800 font-medium mb-3">{q.question_text}</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {["A", "B", "C", "D"].map((opt) => (
                                                        <div
                                                            key={opt}
                                                            className={`px-3 py-2 rounded-lg ${q.correct_answer === opt
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : 'bg-slate-50 text-slate-600'
                                                                }`}
                                                        >
                                                            <span className="font-semibold">{opt}.</span> {q[`option_${opt.toLowerCase()}`]}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Finish Button */}
                    <div className="mt-8 flex justify-center">
                        <Link
                            to="/instructor/dashboard"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            Finish & Return to Dashboard
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
