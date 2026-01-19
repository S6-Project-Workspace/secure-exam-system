import React from "react";

export default function StatsCards({ stats }) {
    return (
        <section aria-label="Key Performance Indicators" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Active Exams */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between group hover:border-indigo-500/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Active Exams</p>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.activeExams || 3}</h3>
                    <p className="text-indigo-600 text-xs mt-2 font-medium bg-indigo-50 inline-block px-2 py-1 rounded">Currently Open</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 text-indigo-600">
                    <span className="material-symbols-outlined text-[28px]">assignment</span>
                </div>
            </div>

            {/* Submissions Received */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between group hover:border-emerald-500/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Submissions Received</p>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.submissions || 142}</h3>
                    <p className="text-emerald-600 text-xs mt-2 font-medium bg-emerald-50 inline-block px-2 py-1 rounded">AES Encrypted</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 text-emerald-500">
                    <span className="material-symbols-outlined text-[28px]">inbox</span>
                </div>
            </div>

            {/* Results Published */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between group hover:border-blue-900/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Results Published</p>
                    <h3 className="text-3xl font-bold text-slate-800">{stats.resultsPublished || 12}</h3>
                    <p className="text-blue-900 text-xs mt-2 font-medium bg-blue-50 inline-block px-2 py-1 rounded">Digitally Signed</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300 text-blue-900">
                    <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
                </div>
            </div>

            {/* Security Status */}
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 shadow-sm flex items-start justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-emerald-700 text-sm font-bold mb-1">Security Status</p>
                    <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                            <span className="material-symbols-outlined text-[16px]">lock</span>
                            RSA Signatures Active
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                            <span className="material-symbols-outlined text-[16px]">key</span>
                            AES Encryption Enabled
                        </div>
                    </div>
                </div>
                <div className="text-emerald-600/20 absolute -right-4 -bottom-4 z-0 rotate-12">
                    <span className="material-symbols-outlined text-[100px]">security</span>
                </div>
            </div>
        </section>
    );
}
