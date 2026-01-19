import React from "react";
import { Link } from "react-router-dom";

export default function IdentityManagement({ keyStatus, onGenerateKeys }) {
    return (
        <section className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-700 overflow-hidden transition-colors duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/90">key</span>
                    <h3 className="text-white font-bold text-lg">Cryptographic Identity Management</h3>
                </div>
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">RSA-2048</span>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full grid grid-cols-2 gap-4">
                        <div className={`${keyStatus.generated ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700'} border rounded-lg p-4 flex flex-col items-center text-center gap-2 group hover:bg-opacity-70 transition-colors`}>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${keyStatus.generated ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500' : 'bg-slate-200 dark:bg-neutral-700 text-slate-400 dark:text-slate-500'}`}>
                                <span className="material-symbols-outlined">{keyStatus.generated ? 'check_circle' : 'pending'}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Key Generated</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{keyStatus.generated ? 'Stored Locally' : 'Not Generated'}</p>
                        </div>
                        <div className={`${keyStatus.uploaded ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700'} border rounded-lg p-4 flex flex-col items-center text-center gap-2 group hover:bg-opacity-70 transition-colors`}>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${keyStatus.uploaded ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500' : 'bg-slate-200 dark:bg-neutral-700 text-slate-400 dark:text-slate-500'}`}>
                                <span className="material-symbols-outlined">{keyStatus.uploaded ? 'cloud_done' : 'cloud_off'}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Key Uploaded</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{keyStatus.uploaded ? 'Synced with Server' : 'Not Synced'}</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-amber-500 shrink-0">warning</span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Private Key Security</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                        Your private key never leaves this device. Do not clear your browser cache before submitting your exam.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to="/student/keygen"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">vpn_key</span>
                                {keyStatus.generated ? 'Manage Keys' : 'Setup Keys'}
                            </Link>
                            <button className="flex-1 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-700 hover:text-blue-600 dark:hover:text-blue-400 font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">download</span> Backup Key
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

