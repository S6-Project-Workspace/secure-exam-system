import React from "react";

export default function SystemHealth({ keyStatus }) {
    return (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-neutral-700 shadow-sm p-5 transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-neutral-700 pb-2">System Health</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
                            <span className="material-symbols-outlined">wifi</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Network</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Stable (12ms)</p>
                        </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined">public</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Browser</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Chrome (Verified)</p>
                        </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${keyStatus.uploaded ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'}`}>
                            <span className="material-symbols-outlined">vpn_key</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Crypto Keys</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{keyStatus.uploaded ? 'Active' : 'Setup Required'}</p>
                        </div>
                    </div>
                    <span className={`h-2 w-2 rounded-full ${keyStatus.uploaded ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </div>
            </div>
        </div>
    );
}

