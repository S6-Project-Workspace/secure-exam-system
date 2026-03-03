import React from "react";
import { Link } from "react-router-dom";

export default function IdentityManagement({ keyStatus }) {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-900 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/90">key</span>
                    <h3 className="text-white font-bold text-lg">Cryptographic Identity Management</h3>
                </div>
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">RSA-2048</span>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full grid grid-cols-2 gap-4">
                        <div className={`${keyStatus?.generated ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'} border rounded-lg p-4 flex flex-col items-center text-center gap-2 group hover:bg-opacity-70 transition-colors`}>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${keyStatus?.generated ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                <span className="material-symbols-outlined">{keyStatus?.generated ? 'check_circle' : 'pending'}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Key Generated</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{keyStatus?.generated ? 'Stored Locally' : 'Not Generated'}</p>
                        </div>
                        <div className={`${keyStatus?.uploaded ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'} border rounded-lg p-4 flex flex-col items-center text-center gap-2 group hover:bg-opacity-70 transition-colors`}>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${keyStatus?.uploaded ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                <span className="material-symbols-outlined">{keyStatus?.uploaded ? 'cloud_done' : 'cloud_off'}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Key Uploaded</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{keyStatus?.uploaded ? 'Synced with Server' : 'Not Synced'}</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 shrink-0">info</span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Instructor Signing Keys</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                        Your private key is used to digitally sign exams and results, ensuring authenticity.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to="/instructor/keygen"
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">vpn_key</span>
                                {keyStatus?.generated ? 'Manage Keys' : 'Setup Keys'}
                            </Link>
                            <button className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-indigo-400 font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">download</span> Backup Key
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
