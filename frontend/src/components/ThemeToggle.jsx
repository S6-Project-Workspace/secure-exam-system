import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle Component
 * Reusable theme toggle button with animated sun/moon icons
 */
export default function ThemeToggle() {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 group"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Sun Icon */}
            <span
                className={`material-symbols-outlined text-xl absolute transition-all duration-300 ${isDarkMode
                        ? 'opacity-0 rotate-90 scale-0'
                        : 'opacity-100 rotate-0 scale-100 text-amber-500'
                    }`}
            >
                light_mode
            </span>
            {/* Moon Icon */}
            <span
                className={`material-symbols-outlined text-xl absolute transition-all duration-300 ${isDarkMode
                        ? 'opacity-100 rotate-0 scale-100 text-blue-400'
                        : 'opacity-0 -rotate-90 scale-0'
                    }`}
            >
                dark_mode
            </span>
        </button>
    );
}
