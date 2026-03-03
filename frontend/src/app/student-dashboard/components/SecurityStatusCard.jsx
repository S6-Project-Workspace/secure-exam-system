import React from "react";
import { useTheme } from "../../../context/ThemeContext";

export default function SecurityStatusCard({ keyStatus }) {
    const { isDarkMode } = useTheme();
    const { generated = false, uploaded = false } = keyStatus;

    const securityItems = [
        {
            icon: "key",
            title: "RSA Key Pair",
            subtitle: "Local generation verified",
            verified: generated
        },
        {
            icon: "public",
            title: "Public Key",
            subtitle: "Synced with server",
            verified: uploaded
        },
        {
            icon: "lock",
            title: "Encryption",
            subtitle: "AES-256 Enabled",
            verified: generated && uploaded
        }
    ];

    return (
        <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} rounded-xl p-6 border`}>
            <div className="mb-6">
                <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold text-lg`}>Security Status</h3>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Device compliance check</p>
            </div>

            <div className="space-y-5">
                {securityItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                item.verified 
                                    ? "bg-blue-500/20 text-blue-400" 
                                    : isDarkMode ? "bg-slate-600/30 text-slate-500" : "bg-slate-100 text-slate-400"
                            }`}>
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            </div>
                            <div>
                                <p className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium text-sm`}>{item.title}</p>
                                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs`}>{item.subtitle}</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            item.verified 
                                ? "bg-emerald-500 text-white" 
                                : isDarkMode ? "bg-slate-600 text-slate-400" : "bg-slate-200 text-slate-500"
                        }`}>
                            <span className="material-symbols-outlined text-base">
                                {item.verified ? "check" : "close"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors group">
                View Detailed Report 
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
        </div>
    );
}
