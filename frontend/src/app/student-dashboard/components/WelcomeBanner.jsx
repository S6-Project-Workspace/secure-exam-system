import React from "react";

export default function WelcomeBanner({ name }) {
    return (
        <section className="bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-[#1e1e1e] dark:to-[#1e1e1e] rounded-2xl p-8 border border-indigo-100 dark:border-neutral-700 shadow-sm relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/40 dark:bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2 font-display">Welcome back, {name || 'Student'} 👋</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Your secure academic workspace is ready.</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-neutral-700">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">System Secure & Encrypted</span>
                </div>
            </div>
        </section>
    );
}

