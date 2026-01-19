/**
 * ExamOverview.jsx
 * 
 * Displays a grid of exam cards with question count, duration, and action buttons.
 * Matches the provided UI design with exam cards and "Create New Exam" card.
 */

import React from "react";
import { Link } from "react-router-dom";

export default function ExamOverview({ exams, onRefresh }) {
    return (
        <section className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Exam Overview</h2>
                    <p className="text-sm text-slate-500">Manage, edit, and configure your examination papers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Search exams..."
                            className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                        />
                    </div>
                    <Link
                        to="/instructor/exams/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Create New Exam
                    </Link>
                </div>
            </div>

            {/* Exam Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Existing Exam Cards */}
                {exams.map((exam) => {
                    const examId = exam.exam_id || exam.id;
                    return (
                        <div key={examId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5">
                                {/* Exam Code Badge */}
                                <div className="flex items-start justify-between mb-3">
                                    <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                        {examId?.slice(0, 8).toUpperCase() || "DRAFT"}
                                    </span>
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <span className="material-symbols-outlined text-lg">more_vert</span>
                                    </button>
                                </div>

                                {/* Exam Title & Description */}
                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{exam.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    {exam.description || "No description provided."}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center gap-6 text-sm mb-4">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-wide">Questions</span>
                                        <p className="font-bold text-slate-800 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-indigo-500 text-base">quiz</span>
                                            {exam.question_count ?? 0}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-wide">Duration</span>
                                        <p className="font-bold text-slate-800 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-emerald-500 text-base">timer</span>
                                            {exam.duration_minutes || "--"} min
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Link
                                        to={`/instructor/exams/${examId}/questions`}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">edit_note</span>
                                        Add Questions
                                    </Link>
                                    <button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-base">visibility</span>
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Create New Exam Card */}
                <Link
                    to="/instructor/exams/create"
                    className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 transition-colors p-5 flex flex-col items-center justify-center min-h-[220px] group"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-200 group-hover:bg-blue-100 flex items-center justify-center mb-4 transition-colors">
                        <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-blue-600">add</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Create New Exam</h3>
                    <p className="text-sm text-slate-500 text-center">Start from scratch or import from previous semester.</p>
                </Link>
            </div>
        </section>
    );
}
