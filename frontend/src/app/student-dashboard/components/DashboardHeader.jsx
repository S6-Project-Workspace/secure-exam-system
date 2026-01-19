import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

export default function DashboardHeader({ name, id, onLogout }) {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-neutral-700 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-900/10 dark:bg-blue-500/10 text-blue-900 dark:text-blue-400">
                            <span className="material-symbols-outlined text-2xl">verified_user</span>
                        </div>
                        <div>
                            <h1 className="text-slate-800 dark:text-white font-bold text-lg leading-tight tracking-tight">SecureExam</h1>
                            <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">University Portal</p>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-blue-900 dark:text-blue-400 font-semibold text-sm border-b-2 border-blue-900 dark:border-blue-400 py-5" href="#">Dashboard</a>
                        <Link to="/student/decrypt" className="text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors font-medium text-sm py-5">My Exams</Link>
                        <a className="text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors font-medium text-sm py-5" href="#">Results</a>
                        <a className="text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors font-medium text-sm py-5" href="#">Support</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-neutral-700 hover:bg-slate-200 dark:hover:bg-neutral-600 transition-all duration-300"
                            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100 text-amber-500'}`}>
                                light_mode
                            </span>
                            <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100 text-blue-400' : 'opacity-0 -rotate-90 scale-0'}`}>
                                dark_mode
                            </span>
                        </button>

                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">ID: {id?.slice(0, 8)}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-900/20 dark:bg-blue-500/20 flex items-center justify-center text-blue-900 dark:text-blue-400 font-bold">
                            {name?.charAt(0)}
                        </div>
                        <button onClick={onLogout} className="text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

