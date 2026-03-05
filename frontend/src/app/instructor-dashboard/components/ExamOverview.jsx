/**
 * ExamOverview.jsx
 *
 * Two sections:
 *  1. Exam Overview  – unpublished/draft exams (editable, can add questions)
 *  2. Published Exams – published exams (read-only, Evaluate Now button)
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ExamOverview({ exams, onRefresh }) {
    const navigate = useNavigate();

    const unpublished = exams.filter((e) => !e.is_published);
    const published = exams.filter((e) => e.is_published);

    /* ------------------------------------------------------------------ */
    /* Shared card shell                                                    */
    /* ------------------------------------------------------------------ */
    const CardShell = ({ exam, children }) => {
        const examId = exam.exam_id || exam.id;
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                    {/* Badge row */}
                    <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                            {examId?.slice(0, 8).toUpperCase() || "DRAFT"}
                        </span>
                    </div>

                    {/* Title & description */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{exam.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                        {exam.description || "No description provided."}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm mb-4">
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Questions</span>
                            <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-base">quiz</span>
                                {exam.question_count ?? 0}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Duration</span>
                            <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-emerald-500 dark:text-emerald-400 text-base">timer</span>
                                {exam.duration_minutes || "--"} min
                            </p>
                        </div>
                    </div>

                    {/* Action buttons (slot) */}
                    {children}
                </div>
            </div>
        );
    };

    /* ------------------------------------------------------------------ */
    /* Section 1 – Exam Overview (unpublished / draft)                     */
    /* ------------------------------------------------------------------ */
    return (
        <div className="space-y-10">
            <section className="space-y-6">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Exam Overview</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Search exams..."
                                className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
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

                {/* Unpublished Exam Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unpublished.length === 0 && (
                        <p className="text-sm text-slate-400 dark:text-slate-500 col-span-full">No draft exams. Create one below.</p>
                    )}

                    {unpublished.map((exam) => {
                        const examId = exam.exam_id || exam.id;
                        return (
                            <CardShell key={examId} exam={exam}>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/instructor/exams/${examId}/questions`}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">edit_note</span>
                                        Add Questions
                                    </Link>
                                </div>
                            </CardShell>
                        );
                    })}

                    {/* Create New Exam Card */}
                    <Link
                        to="/instructor/exams/create"
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors p-5 flex flex-col items-center justify-center min-h-[220px] group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center mb-4 transition-colors">
                            <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">add</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Create New Exam</h3>
                    </Link>
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Section 2 – Published Exams                                      */}
            {/* ---------------------------------------------------------------- */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500 text-xl">verified</span>
                            Published Exams
                        </h2>
                    </div>
                </div>

                {published.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                        No published exams yet. Publish a draft exam to see it here.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {published.map((exam) => {
                            const examId = exam.exam_id || exam.id;
                            return (
                                <CardShell key={examId} exam={exam}>
                                    {/* Published badge */}
                                    <div className="mb-3 flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                                            <span className="material-symbols-outlined text-xs">check_circle</span>
                                            Published
                                        </span>
                                    </div>

                                    {/* Evaluate Now button */}
                                    <button
                                        onClick={() => navigate(`/instructor/evaluate?exam_id=${examId}`)}
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">grading</span>
                                        Evaluate Now
                                    </button>
                                </CardShell>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
