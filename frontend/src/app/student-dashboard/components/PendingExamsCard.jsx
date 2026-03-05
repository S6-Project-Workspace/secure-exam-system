import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

export default function PendingExamsCard({ exams = [], results = [], submissions = [] }) {
    const { isDarkMode } = useTheme();
    // Filter pending exams — exclude exams the student has already submitted
    const submittedExamIds = new Set(submissions.map(s => s.exam_id));
    const pendingExams = exams.filter(exam => !submittedExamIds.has(exam.exam_id));

    return (
        <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} rounded-xl p-6 border`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold text-lg`}>Pending Exams</h3>
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Exams awaiting your attempt</p>
                </div>
                <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'} transition-colors`}>
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                </button>
            </div>

            <div className="space-y-3">
                {pendingExams.length > 0 ? (
                    pendingExams.slice(0, 3).map((exam, index) => (
                        <div key={exam.exam_id} className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100'} rounded-lg transition-colors`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-base">assignment</span>
                                </div>
                                <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium text-sm`}>{exam.title || `Exam #${exam.exam_id?.slice(0, 4).toUpperCase()}`}</span>
                            </div>
                            <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>{exam.duration_minutes || 120} mins</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                        </div>
                        <p className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold`}>All Caught Up!</p>
                        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm mt-1`}>No pending exams at the moment</p>
                    </div>
                )}
            </div>

            {pendingExams.length > 0 && (
                <Link
                    to="/student/dashboard#exams"
                    className="w-full mt-4 flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors group"
                >
                    View All Exams
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
            )}
        </div>
    );
}
