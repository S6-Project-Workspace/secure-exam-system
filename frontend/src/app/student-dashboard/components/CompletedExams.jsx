import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

export default function CompletedExams({ exams, results = [] }) {
    const { isDarkMode } = useTheme();

    // Map exams to an easily accessible dictionary
    const examsMap = {};
    (exams || []).forEach(ex => {
        examsMap[ex.exam_id || ex.id] = ex;
    });

    return (
        <section id="results">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} font-display`}>Completed Exams & Results</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                        Digitally signed and tamper-proof evaluation results.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.length > 0 ? results.map((result) => {
                    const examDetail = examsMap[result.exam_id] || {};
                    const title = examDetail.title || `Exam #${result.exam_id.slice(0, 8)}`;

                    // Basic pass/fail determination based on marks (assuming out of 100)
                    const isPassing = result.marks >= 50;

                    return (
                        <div key={result.result_id} className={`rounded-xl border p-5 transition-all hover:shadow-lg group ${isDarkMode ? 'bg-[#1a2332] border-slate-700/50 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
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
                                            {new Date(result.evaluated_at || result.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-3 rounded-lg flex items-center justify-between mb-4 border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500 text-sm">verified</span>
                                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Score</span>
                                </div>
                                <div className={`text-xl font-bold ${isPassing ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {result.marks} <span className="text-sm text-slate-400 font-normal">/ 100</span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Link
                                    to={`/student/result/${result.exam_id}`}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 w-full justify-center rounded-lg text-sm font-semibold transition-colors border ${isDarkMode ? 'bg-[#0f172a] text-blue-400 border-blue-900/50 hover:bg-blue-900/20 hover:border-blue-500/50' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    View Detailed Result
                                </Link>
                            </div>
                        </div>
                    );
                }) : (
                    <div className={`col-span-full p-10 border border-dashed rounded-xl text-center ${isDarkMode ? 'bg-[#1a2332] border-slate-700' : 'bg-white border-slate-300'}`}>
                        <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                            <span className="material-symbols-outlined text-2xl">history</span>
                        </div>
                        <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No Results Yet</p>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Complete an exam to see your results here.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
