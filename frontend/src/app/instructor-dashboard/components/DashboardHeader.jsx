import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

export default function DashboardHeader({ name, onLogout }) {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header className="bg-[#1E3A8A] dark:bg-surface-dark text-white shadow-lg relative overflow-hidden transition-colors duration-300">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 25%), radial-gradient(circle at 80% 80%, rgba(79, 70, 229, 0.4) 0%, transparent 25%)" }}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-indigo-300 dark:text-indigo-400">verified_user</span>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
                    </div>
                    <p className="text-blue-200 dark:text-slate-400 text-sm font-light tracking-wide ml-12">Secure Examination Control Panel • University Faculty Portal</p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 dark:bg-white/5 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 dark:border-white/5">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 dark:bg-neutral-700 hover:bg-white/20 dark:hover:bg-neutral-600 transition-all duration-300"
                        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100 text-amber-400'}`}>
                            light_mode
                        </span>
                        <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100 text-blue-400' : 'opacity-0 -rotate-90 scale-0'}`}>
                            dark_mode
                        </span>
                    </button>

                    <div className="h-10 w-10 rounded-full bg-indigo-400/30 dark:bg-indigo-500/20 flex items-center justify-center text-white font-bold border-2 border-indigo-300 dark:border-indigo-500">
                        {name?.charAt(0) || "I"}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{name || "Instructor"}</span>
                        <span className="text-xs text-blue-200 dark:text-slate-400 uppercase tracking-wider">Faculty</span>
                    </div>
                    <button onClick={onLogout} aria-label="Logout" className="ml-2 text-blue-200 dark:text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 border-t border-white/10 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8 overflow-x-auto">
                        <a className="text-white font-semibold text-sm border-b-2 border-white py-4" href="#">Dashboard</a>
                        <Link to="/instructor/publish" className="text-blue-200 dark:text-slate-400 hover:text-white transition-colors font-medium text-sm py-4">Publish Exam</Link>
                        <Link to="/instructor/evaluate" className="text-blue-200 dark:text-slate-400 hover:text-white transition-colors font-medium text-sm py-4">Evaluate</Link>
                        <a className="text-blue-200 dark:text-slate-400 hover:text-white transition-colors font-medium text-sm py-4" href="#">Results</a>
                    </div>
                </div>
            </nav>
        </header>
    );
}

