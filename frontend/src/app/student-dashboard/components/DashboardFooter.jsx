import React from "react";
import { useTheme } from "../../../context/ThemeContext";

export default function DashboardFooter() {
    const { isDarkMode } = useTheme();
    
    return (
        <footer className={`${isDarkMode ? 'bg-[#0a0f1a] border-slate-800' : 'bg-white border-slate-200'} border-t mt-auto py-6 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>© 2026 SecureExam Portal. All rights reserved.</p>
                <div className={`flex gap-6 text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                    <a className="hover:text-blue-400 transition-colors" href="#">Privacy Policy</a>
                    <a className="hover:text-blue-400 transition-colors" href="#">Help Desk</a>
                    <a className="hover:text-blue-400 transition-colors" href="#">System Requirements</a>
                </div>
            </div>
        </footer>
    );
}

