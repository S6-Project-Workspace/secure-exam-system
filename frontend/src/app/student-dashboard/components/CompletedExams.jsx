import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

export default function CompletedExams({ exams, results = [], submissions = [] }) {
    const { isDarkMode } = useTheme();

    // Build lookup maps
    const examsMap = {};
    (exams || []).forEach(ex => {
        examsMap[ex.exam_id || ex.id] = ex;
    });
    const resultsMap = {};
    results.forEach(r => {
        resultsMap[r.exam_id] = r;
    });

    // Deduplicate submissions by exam_id (keep latest)
    const submittedExams = [];
    const seen = new Set();
    for (const sub of submissions) {
        if (!seen.has(sub.exam_id)) {
            seen.add(sub.exam_id);
            submittedExams.push(sub);
        }
    }

    return (
        <section id="results">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} font-display`}>Completed Exams & Results</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submittedExams.length > 0 ? submittedExams.map((sub) => {
                    const examDetail = examsMap[sub.exam_id] || {};
                    const title = examDetail.title || `Exam #${sub.exam_id?.slice(0, 8)}`;
                    const result = resultsMap[sub.exam_id];
                    const isPublished = !!result;
                    const isPassing = result ? result.marks >= 50 : false;

                    return (
                        <div key={sub.exam_id} className={`rounded-xl border p-5 transition-all hover:shadow-lg group ${isDarkMode ? 'bg-[#1a2332] border-slate-700/50 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        <span className={`material-symbols-outlined text-xl ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            task_alt
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1 mt-0.5`}>
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                            {new Date(sub.created_at || result?.evaluated_at || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {/* Published status badge */}
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPublished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {isPublished ? "Published" : "Pending"}
                                </span>
                            </div>

                            <div className={`p-3 rounded-lg flex items-center justify-between mb-4 border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500 text-sm">verified</span>
                                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Score</span>
                                </div>
                                {isPublished ? (
                                    <div className={`text-xl font-bold ${isPassing ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {result.marks}
                                    </div>
                                ) : (
                                    <span className={`text-sm italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Awaiting</span>
                                )}
                            </div>

                            <div className="flex justify-end">
                                {isPublished ? (
                                    <Link
                                        to={`/student/results/${sub.exam_id}`}
                                        className={`inline-flex items-center gap-1.5 px-4 py-2 w-full justify-center rounded-lg text-sm font-semibold transition-colors border ${isDarkMode ? 'bg-[#0f172a] text-blue-400 border-blue-900/50 hover:bg-blue-900/20 hover:border-blue-500/50' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                        View Detailed Result
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        title="Results have not been published yet"
                                        className={`inline-flex items-center gap-1.5 px-4 py-2 w-full justify-center rounded-lg text-sm font-semibold border cursor-not-allowed opacity-50 ${isDarkMode ? 'bg-[#0f172a] text-slate-500 border-slate-700' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm">lock</span>
                                        Results Not Published
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className={`col-span-full p-10 border border-dashed rounded-xl text-center ${isDarkMode ? 'bg-[#1a2332] border-slate-700' : 'bg-white border-slate-300'}`}>
                        <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                            <span className="material-symbols-outlined text-2xl">history</span>
                        </div>
                        <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No Completed Exams Yet</p>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Submit an exam to see it here.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
