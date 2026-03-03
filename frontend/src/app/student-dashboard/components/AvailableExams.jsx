import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

// Exam subject icons mapping
const getExamIcon = (title) => {
    const titleLower = title?.toLowerCase() || '';
    if (titleLower.includes('database') || titleLower.includes('sql')) return { icon: 'storage', color: 'bg-teal-500/20 text-teal-400' };
    if (titleLower.includes('network') || titleLower.includes('security')) return { icon: 'hub', color: 'bg-amber-500/20 text-amber-400' };
    if (titleLower.includes('algorithm') || titleLower.includes('data structure')) return { icon: 'account_tree', color: 'bg-purple-500/20 text-purple-400' };
    if (titleLower.includes('web') || titleLower.includes('frontend')) return { icon: 'web', color: 'bg-blue-500/20 text-blue-400' };
    if (titleLower.includes('machine') || titleLower.includes('ai')) return { icon: 'psychology', color: 'bg-pink-500/20 text-pink-400' };
    return { icon: 'school', color: 'bg-indigo-500/20 text-indigo-400' };
};

export default function AvailableExams({ exams, results = [] }) {
    const { isDarkMode } = useTheme();
    // Create a set of exam IDs that have results
    const examsWithResults = new Set(results.map(r => r.exam_id));
    // Only show exams that haven't been completed
    const pendingExams = exams.filter(exam => !examsWithResults.has(exam.exam_id));

    return (
        <section id="exams">
            <div className="mb-6">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} font-display`}>Upcoming Exams</h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                    Secure environment active. Please ensure your workstation meets the integrity requirements before beginning any session.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {pendingExams.length > 0 ? pendingExams.map((exam) => {
                    const { icon, color } = getExamIcon(exam.title);
                    const examDate = new Date(exam.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                        <div
                            key={exam.exam_id}
                            className={`rounded-xl border p-5 transition-all hover:shadow-lg group ${isDarkMode
                                    ? 'bg-[#1a2332] border-slate-700/50 hover:border-emerald-500/50'
                                    : 'bg-white border-slate-200 hover:border-emerald-300'
                                }`}
                        >
                            {/* Icon and Title */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                                    <span className="material-symbols-outlined text-xl">{icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                        {exam.title}
                                    </h4>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {examDate} • {exam.duration_minutes || 120}mins
                                    </p>
                                </div>
                            </div>

                            {/* Status and Action */}
                            <div className="flex items-center justify-between">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isDarkMode
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                    READY
                                </span>

                                <Link
                                    to={`/student/decrypt/${exam.exam_id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">lock_open</span>
                                    Decrypt & Start
                                </Link>
                            </div>
                        </div>
                    );
                }) : (
                    <div className={`col-span-full p-10 border border-dashed rounded-xl text-center ${isDarkMode
                        ? 'bg-[#1a2332] border-slate-700'
                        : 'bg-white border-slate-300'
                        }`}>
                        <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <span className="material-symbols-outlined text-2xl">event_busy</span>
                        </div>
                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>No exams available at the moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

