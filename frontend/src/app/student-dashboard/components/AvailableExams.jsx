import React from "react";
import { Link } from "react-router-dom";

export default function AvailableExams({ exams, results = [] }) {
    // Create a set of exam IDs that have results
    const examsWithResults = new Set(results.map(r => r.exam_id));

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Available Exams</h3>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">All</button>
                    <button className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">Active</button>
                    <button className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">Upcoming</button>
                </div>
            </div>

            <div className="space-y-4">
                {exams.length > 0 ? exams.map((exam) => {
                    const hasResult = examsWithResults.has(exam.exam_id);
                    const result = results.find(r => r.exam_id === exam.exam_id);

                    return (
                        <div key={exam.exam_id} className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-neutral-700 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">EXAM-{exam.exam_id?.slice(0, 4)}</span>
                                    {hasResult ? (
                                        <span className="flex items-center gap-1 text-xs font-semibold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-500/20">
                                            <span className="material-symbols-outlined text-sm">check_circle</span> Completed
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
                                            <span className="material-symbols-outlined text-sm">lock_open</span> Open Now
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{exam.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{exam.description || 'No description available'}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">schedule</span> {exam.duration_minutes || 120} mins</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">calendar_today</span> {new Date(exam.created_at).toLocaleDateString()}</span>
                                    {hasResult && (
                                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                            <span className="material-symbols-outlined text-lg">grade</span> Score: {result.marks}/100
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                {hasResult ? (
                                    <Link
                                        to={`/student/results/${exam.exam_id}`}
                                        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        View Result
                                    </Link>
                                ) : (
                                    <Link
                                        to="/student/decrypt"
                                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        View Exam <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </Link>
                                )}
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-emerald-500 text-sm">verified</span> {hasResult ? "Signature Verified" : "Encrypted"}
                                </span>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="p-10 bg-white dark:bg-[#1e1e1e] border border-dashed border-slate-300 dark:border-neutral-700 rounded-xl text-center">
                        <p className="text-slate-500 dark:text-slate-400">No exams available at the moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

