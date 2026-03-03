import React from "react";

export default function SecurityFooter() {
    return (
        <section className="mt-auto pt-6 pb-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between border border-blue-100 dark:border-blue-800 gap-4">
                <div className="flex items-start md:items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 rounded-full shrink-0">
                        <span className="material-symbols-outlined">shield_lock</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400">System Security & Trust Protocols</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>All question papers are AES-256 encrypted
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>Submissions are RSA-signed
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>Results are cryptographically verifiable
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 md:pl-4 pt-2 md:pt-0">
                    Last Security Audit: Today, 09:41 AM<br />
                    Server IP: 192.168.X.X (Secured)
                </div>
            </div>
        </section>
    );
}
