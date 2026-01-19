import React from "react";

export default function PerformanceAnalytics({ performance, stats, results }) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance Overview */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-neutral-700 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-slate-800 dark:text-white font-bold text-lg">Performance Overview</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Weighted Average Grade</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <span className="material-symbols-outlined text-xl">insights</span>
                    </div>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-slate-800 dark:text-white">{performance.average}%</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${parseFloat(performance.trend) >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                        <span className="material-symbols-outlined text-xs">{parseFloat(performance.trend) >= 0 ? 'trending_up' : 'trending_down'}</span>
                        {parseFloat(performance.trend) >= 0 ? '+' : ''}{performance.trend}%
                    </span>
                </div>
                <div className="h-16 w-full relative">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 60">
                        <defs>
                            <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#818CF8" stopOpacity="0.2"></stop>
                                <stop offset="100%" stopColor="#818CF8" stopOpacity="0"></stop>
                            </linearGradient>
                        </defs>
                        <path d="M0,40 L30,35 L60,45 L90,20 L120,25 L150,15 L180,10 L200,5" fill="none" stroke="#818CF8" strokeLinecap="round" strokeWidth="2.5" vectorEffect="non-scaling-stroke"></path>
                        <path d="M0,40 L30,35 L60,45 L90,20 L120,25 L150,15 L180,10 L200,5 V 60 H 0 Z" fill="url(#sparkline-gradient)" stroke="none"></path>
                    </svg>
                </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-neutral-700 hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-slate-800 dark:text-white font-bold text-lg">Subject Breakdown</h3>
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">info</span>
                </div>
                <div className="space-y-4">
                    {results.length > 0 ? results.slice(0, 3).map((result, idx) => (
                        <div key={idx} className="group">
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-semibold text-slate-800 dark:text-white truncate">{result.exam_id?.slice(0, 8) || 'Exam'}</span>
                                <span className={`font-bold ${result.marks >= 80 ? 'text-emerald-500' : result.marks >= 60 ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-500'}`}>{result.marks}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                                <div className={`h-full rounded-full ${result.marks >= 80 ? 'bg-emerald-500' : result.marks >= 60 ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${result.marks}%` }}></div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No results yet</p>
                    )}
                </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-neutral-700 hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
                <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1 self-start">Completion Rate</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 self-start">Academic Year Progress</p>
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" fill="none" r="42" stroke="#E2E8F0" className="dark:stroke-neutral-700" strokeWidth="8"></circle>
                        <circle cx="50" cy="50" fill="none" r="42" stroke="#10B981" strokeDasharray="264" strokeDashoffset={264 - (264 * (stats.totalExams > 0 ? (stats.attempted / stats.totalExams) * 100 : 0) / 100)} strokeLinecap="round" strokeWidth="8"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-800 dark:text-white">{stats.totalExams > 0 ? Math.round((stats.attempted / stats.totalExams) * 100) : 0}%</span>
                    </div>
                </div>
                <div className="mt-4 flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-800 dark:text-slate-300">{stats.attempted} Done</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-neutral-600"></span>
                        <span className="text-slate-800 dark:text-slate-300">{stats.upcoming} Remaining</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

