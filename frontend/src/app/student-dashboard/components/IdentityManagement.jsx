import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

export default function IdentityManagement({ keyStatus, onGenerateKeys }) {
    const { isDarkMode } = useTheme();
    
    return (
        <section className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} rounded-2xl border overflow-hidden transition-colors duration-300`}>


            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full grid grid-cols-2 gap-4">
                        <div className={`${keyStatus.generated ? 'bg-emerald-500/10 border-emerald-500/20' : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-lg p-4 flex flex-col items-center text-center gap-2 group hover:bg-opacity-70 transition-colors`}>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${keyStatus.generated ? 'bg-emerald-500/20 text-emerald-500' : isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                                <span className="material-symbols-outlined">{keyStatus.generated ? 'check_circle' : 'pending'}</span>
                            </div>
                            <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Key Generated</h4>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{keyStatus.generated ? 'Stored Locally' : 'Not Generated'}</p>
                        </div>
                        <div className={`${keyStatus.uploaded ? 'bg-emerald-500/10 border-emerald-500/20' : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-lg p-4 flex flex-col items-center text-center gap-2 group hover:bg-opacity-70 transition-colors`}>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${keyStatus.uploaded ? 'bg-emerald-500/20 text-emerald-500' : isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                                <span className="material-symbols-outlined">{keyStatus.uploaded ? 'cloud_done' : 'cloud_off'}</span>
                            </div>
                            <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Key Uploaded</h4>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{keyStatus.uploaded ? 'Synced with Server' : 'Not Synced'}</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-amber-500 shrink-0">warning</span>
                                <div>
                                    <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Private Key Security</h4>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mt-1 leading-relaxed`}>
                                        Your private key never leaves this device. Do not clear your browser cache before submitting your exam.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to="/student/keygen"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">vpn_key</span>
                                {keyStatus.generated ? 'Manage Keys' : 'Setup Keys'}
                            </Link>
                            <button className={`flex-1 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'} border hover:text-blue-500 font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2`}>
                                <span className="material-symbols-outlined text-lg">download</span> Backup Key
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

