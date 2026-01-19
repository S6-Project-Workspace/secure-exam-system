import React from "react";

export default function StatsCards({ stats, keyStatus }) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-t-4 border-indigo-600 dark:border-indigo-500 group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                        <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">event_note</span>
                    </div>
                    <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-md">New</span>
                </div>
                <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Upcoming Exams</h3>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{stats.upcoming}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Scheduled for this week</p>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-t-4 border-emerald-500 group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                        <span className="material-symbols-outlined text-emerald-500 text-2xl">fact_check</span>
                    </div>
                    <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2 py-1 rounded-md">{stats.attempted} Total</span>
                </div>
                <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Attempted Exams</h3>
                <p className="text-3xl font-bold text-emerald-500 mb-2">{stats.attempted}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Successfully submitted</p>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-t-4 border-emerald-500 group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                        <span className="material-symbols-outlined text-emerald-500 text-2xl">verified</span>
                    </div>
                    <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2 py-1 rounded-md">Verified</span>
                </div>
                <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Results & Verification</h3>
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-emerald-500 text-sm">lock</span>
                    <p className="text-sm font-semibold text-emerald-500">Cryptographically verified</p>
                </div>
                <button className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1">
                    View Transcripts <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-t-4 border-blue-500 dark:border-blue-400 group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">vpn_key</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${keyStatus.uploaded ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'}`}>
                        {keyStatus.uploaded ? 'Active' : 'Setup Required'}
                    </span>
                </div>
                <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Security Status</h3>
                <p className={`text-sm font-semibold mb-3 ${keyStatus.uploaded ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500'}`}>
                    {keyStatus.uploaded ? 'End-to-End Encryption Enabled' : 'Keys Not Configured'}
                </p>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        <div className={`h-2 w-2 rounded-full ring-2 ring-white dark:ring-[#1e1e1e] ${keyStatus.generated ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        <div className={`h-2 w-2 rounded-full ring-2 ring-white dark:ring-[#1e1e1e] ${keyStatus.uploaded ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        <div className={`h-2 w-2 rounded-full ring-2 ring-white dark:ring-[#1e1e1e] ${keyStatus.uploaded ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{keyStatus.uploaded ? 'Keys Synced' : 'Pending'}</span>
                </div>
            </div>
        </section>
    );
}

