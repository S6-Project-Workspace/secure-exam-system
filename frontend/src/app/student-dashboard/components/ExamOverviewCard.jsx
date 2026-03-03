import React from "react";
import { useTheme } from "../../../context/ThemeContext";

export default function ExamOverviewCard({ stats }) {
    const { isDarkMode } = useTheme();
    const { totalExams = 0, pending = 0, completed = 0 } = stats;
    
    // Calculate percentages for the circular progress segments
    const completedPercentage = totalExams > 0 ? (completed / totalExams) * 100 : 0;
    const pendingPercentage = totalExams > 0 ? (pending / totalExams) * 100 : 0;
    
    // SVG circle parameters
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    // Calculate stroke dash offsets for each segment
    const completedLength = (completedPercentage / 100) * circumference;
    const pendingLength = (pendingPercentage / 100) * circumference;
    const completedOffset = circumference - completedLength;
    const pendingOffset = circumference - pendingLength;

    return (
        <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} rounded-xl p-6 border`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold text-lg`}>Exam Overview</h3>
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Current semester progress</p>
                </div>
                <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'} transition-colors`}>
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                </button>
            </div>

            {/* Circular Progress */}
            <div className="flex flex-col items-center py-4">
                <div className="relative">
                    <svg width={size} height={size} className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={isDarkMode ? "#374151" : "#e2e8f0"}
                            strokeWidth={strokeWidth}
                        />
                        {/* Completed segment (blue) - starts from top */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={completedOffset}
                            className="transition-all duration-500 ease-out"
                        />
                        {/* Pending segment (amber) - starts after completed */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={`${pendingLength} ${circumference - pendingLength}`}
                            strokeDashoffset={-completedLength}
                            className="transition-all duration-500 ease-out"
                        />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalExams}</span>
                        <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm uppercase tracking-wide`}>Total</span>
                    </div>
                </div>
            </div>

            {/* Stats Row - Inline */}
            <div className={`flex justify-center gap-8 mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Pending</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold`}>{pending}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Completed</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold`}>{completed}</span>
                </div>
            </div>
        </div>
    );
}
