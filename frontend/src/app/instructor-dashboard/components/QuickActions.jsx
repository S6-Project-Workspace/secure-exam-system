import React from "react";
import { Link } from "react-router-dom";

export default function QuickActions() {
    return (
        <section aria-label="Instructor Actions">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">bolt</span>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Create New Exam */}
                <button className="flex flex-col items-start gap-3 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group text-left h-full">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">add_circle</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Create New Exam</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Setup new assessment parameters and draft questions.</p>
                    </div>
                </button>

                {/* Publish Paper */}
                <Link to="/instructor/publish" className="flex flex-col items-start gap-3 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group text-left h-full">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-full group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">upload_file</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Publish Paper</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Encrypted release. Requires digital signature confirmation.</p>
                    </div>
                </Link>

                {/* Evaluate */}
                <Link to="/instructor/evaluate" className="flex flex-col items-start gap-3 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group text-left h-full">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 rounded-full group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">rate_review</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Evaluate</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Review student answers and assign secure grades.</p>
                    </div>
                </Link>

                {/* Publish Results */}
                <button className="flex flex-col items-start gap-3 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-900 dark:hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group text-left h-full">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 rounded-full group-hover:bg-blue-900 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">publish</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Publish Results</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Finalize and release digitally signed grades to students.</p>
                    </div>
                </button>
            </div>
        </section>
    );
}
