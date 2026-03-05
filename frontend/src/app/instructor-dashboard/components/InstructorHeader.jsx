import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

export default function InstructorHeader({ name, onLogout }) {
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();

    // Auto-detect: show Back to Dashboard on any page other than the dashboard
    const isDashboardPage = location.pathname === "/instructor/dashboard";
    const showBackButton = !isDashboardPage;

    const navItems = [
        { label: "Dashboard", path: "/instructor/dashboard" },
        { label: "Create Exam", path: "/instructor/exams/create" },
        { label: "Publish", path: "/instructor/publish" },
        { label: "Evaluate", path: "/instructor/evaluate" },
    ];

    const isActive = (item) => location.pathname === item.path;

    return (
        <header className={`${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900 border-b border-slate-200'} shadow-lg transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500/40 bg-blue-600/10">
                            <img src="/logo.png" alt="Secure Exam Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Secure Exam</span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {showBackButton ? (
                            <Link
                                to="/instructor/dashboard"
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} transition-colors flex items-center gap-2`}
                            >
                                <span className="material-symbols-outlined text-base">arrow_back</span>
                                Back to Dashboard
                            </Link>
                        ) : (
                            navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive(item)
                                            ? "bg-blue-600/20 text-blue-400"
                                            : isDarkMode
                                                ? "text-slate-400 hover:text-white hover:bg-white/5"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))
                        )}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`relative flex items-center justify-center w-9 h-9 rounded-full ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition-all duration-300`}
                            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100 text-amber-500'}`}>
                                light_mode
                            </span>
                            <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100 text-blue-400' : 'opacity-0 -rotate-90 scale-0'}`}>
                                dark_mode
                            </span>
                        </button>

                        {/* User Avatar */}
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {name?.charAt(0) || "I"}
                        </div>

                        {/* Logout */}
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}
                                aria-label="Logout"
                            >
                                <span className="material-symbols-outlined">logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
