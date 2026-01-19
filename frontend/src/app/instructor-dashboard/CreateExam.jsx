/**
 * CreateExam.jsx
 * 
 * Step 2.3: Create new exam form
 * Allows instructors to create a new exam with title, description, and duration.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { getToken, authFetch } from "../auth/authHelpers";

export default function CreateExam() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams({
                title,
                description,
                duration_minutes: durationMinutes.toString()
            });

            const response = await authFetch(
                `${API_BASE_URL}/exams/create?${params.toString()}`,
                { method: "POST" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to create exam");
            }

            // Handle both possible field names from Supabase
            const examId = data.exam.exam_id || data.exam.id;
            if (!examId) {
                throw new Error("Could not get exam ID from server response");
            }

            // Redirect to AddMCQs page with the new exam ID
            navigate(`/instructor/exams/${examId}/questions`);

        } catch (err) {
            console.error("Create exam error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                <div className="max-w-3xl mx-auto flex items-center gap-2 text-sm text-slate-500">
                    <Link to="/instructor/dashboard" className="hover:text-blue-900">Dashboard</Link>
                    <span>›</span>
                    <Link to="/instructor/dashboard" className="hover:text-blue-900">Exams</Link>
                    <span>›</span>
                    <span className="text-slate-900 font-medium">Create New</span>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6">
                <div className="w-full max-w-2xl">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Exam</h2>
                        <p className="text-slate-500">
                            Set up a new examination. You'll be able to add questions after creation.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                            <span className="material-symbols-outlined">error</span>
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Exam Title */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Exam Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Advanced Cryptography Midterm"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of the exam content and instructions..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Duration (minutes) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                                        min={10}
                                        max={300}
                                        required
                                        className="w-32 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    <span className="text-slate-500 text-sm">minutes</span>
                                </div>
                                <p className="mt-2 text-xs text-slate-400">Recommended: 60-120 minutes for midterm exams</p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || !title.trim()}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-950 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">add_circle</span>
                                            Create Exam
                                        </>
                                    )}
                                </button>
                                <Link
                                    to="/instructor/dashboard"
                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
