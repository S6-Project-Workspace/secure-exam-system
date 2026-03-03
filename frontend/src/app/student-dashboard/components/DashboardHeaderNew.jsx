import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

export default function DashboardHeaderNew({ name, id, onLogout, showBackButton = false }) {
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();

    const navItems = [
        { label: "Dashboard", path: "/student", section: "dashboard" },
        { label: "My Exams", path: "#exams", section: "exams" },
        { label: "Results", path: "#results", section: "results" },
        { label: "Settings", path: "#settings", section: "settings" }
    ];

    const handleNavClick = (e, item) => {
        if (item.path.startsWith("#")) {
            e.preventDefault();
            const section = document.getElementById(item.section);
            if (section) {
                section.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    const isActive = (item, index) => {
        if (location.pathname === "/student" || location.pathname === "/student/dashboard") {
            return index === 0;
        }
        return false;
    };

    return (
        <header className={`${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900 border-b border-slate-200'} shadow-lg transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
                            <span className="material-symbols-outlined text-xl text-white">verified_user</span>
                        </div>
                        <span className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Secure Exam System</span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {showBackButton ? (
                            <Link
                                to="/student/dashboard"
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} transition-colors flex items-center gap-2`}
                            >
                                <span className="material-symbols-outlined text-base">arrow_back</span>
                                Back to Dashboard
                            </Link>
                        ) : (
                            navItems.map((item, index) => (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={(e) => handleNavClick(e, item)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive(item, index)
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

                    {/* Right Side - User Info */}
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

                        {/* Notification Bell */}
                        <button className={`relative flex items-center justify-center w-9 h-9 rounded-full ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition-colors`}>
                            <span className={`material-symbols-outlined text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>notifications</span>
                        </button>

                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{name || "Student"}</span>
                                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ID: {id?.slice(0, 8) || "N/A"}</span>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {name?.charAt(0) || "S"}
                            </div>
                        </div>

                        {/* Logout Button */}
                        {onLogout && (
                            <button 
                                onClick={onLogout} 
                                className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors ml-2`}
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
