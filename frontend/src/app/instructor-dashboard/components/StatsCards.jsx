import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

// ── Card 1: Evaluation Overview (circle chart) ───────────────────────────────
function EvaluationOverviewCard({ submissionStats }) {
    const { isDarkMode } = useTheme();
    const total     = submissionStats?.total      || 0;
    const evaluated = submissionStats?.evaluated  || 0;
    const pending   = submissionStats?.pending    || 0;

    const size        = 160;
    const strokeWidth = 12;
    const radius      = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const evaluatedPct = total > 0 ? (evaluated / total) * 100 : 0;
    const pendingPct   = total > 0 ? (pending   / total) * 100 : 0;

    const evaluatedLen = (evaluatedPct / 100) * circumference;
    const pendingLen   = (pendingPct   / 100) * circumference;

    return (
        <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} rounded-xl p-6 border`}>
            <div className="mb-4">
                <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold text-lg`}>Evaluation Overview</h3>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Submissions evaluation status</p>
            </div>

            {/* Circle chart */}
            <div className="flex flex-col items-center py-2">
                <div className="relative">
                    <svg width={size} height={size} className="transform -rotate-90">
                        {/* Background track */}
                        <circle cx={size/2} cy={size/2} r={radius} fill="none"
                            stroke={isDarkMode ? "#374151" : "#e2e8f0"}
                            strokeWidth={strokeWidth} />
                        {/* Evaluated segment (blue) */}
                        <circle cx={size/2} cy={size/2} r={radius} fill="none"
                            stroke="#3b82f6" strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - evaluatedLen}
                            className="transition-all duration-500 ease-out" />
                        {/* Pending segment (amber) */}
                        <circle cx={size/2} cy={size/2} r={radius} fill="none"
                            stroke="#f59e0b" strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={`${pendingLen} ${circumference - pendingLen}`}
                            strokeDashoffset={-evaluatedLen}
                            className="transition-all duration-500 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{total}</span>
                        <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs uppercase tracking-wide`}>Total</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className={`flex justify-center gap-8 mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Pending</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold`}>{pending}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Evaluated</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold`}>{evaluated}</span>
                </div>
            </div>
        </div>
    );
}

// ── Card 2: Security Status ───────────────────────────────────────────────────
function SecurityStatusCard({ keyStatus }) {
    const { isDarkMode } = useTheme();
    const { generated = false, uploaded = false } = keyStatus || {};

    const items = [
        { icon: "key",    title: "RSA Key Pair",  subtitle: "Local generation verified",    verified: generated },
        { icon: "public", title: "Public Key",    subtitle: "Synced with server",            verified: uploaded },
        { icon: "lock",   title: "Encryption",    subtitle: "AES-256 Enabled",               verified: generated && uploaded },
    ];

    return (
        <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} rounded-xl p-6 border`}>
            <div className="mb-6">
                <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold text-lg`}>Security Status</h3>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Cryptographic key compliance</p>
            </div>

            <div className="space-y-5">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
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

            <Link to="/instructor/keys"
                className="w-full mt-6 flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors group">
                Manage Keys
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
        </div>
    );
}

// ── Card 3: Pending Publications ──────────────────────────────────────────────
function PendingPublicationsCard({ unpublishedExams }) {
    const { isDarkMode } = useTheme();
    const exams = unpublishedExams || [];

    return (
        <div className={`${isDarkMode ? 'bg-[#1a2332] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} rounded-xl p-6 border`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold text-lg`}>Pending Publication</h3>
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Exams not yet published</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    exams.length > 0
                        ? "bg-amber-500/20 text-amber-400"
                        : isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                }`}>
                    <span className="material-symbols-outlined text-xl">
                        {exams.length > 0 ? "pending" : "check_circle"}
                    </span>
                </div>
            </div>

            {exams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <span className="material-symbols-outlined text-4xl text-emerald-400">task_alt</span>
                    <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} font-medium text-sm`}>All exams published!</p>
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs text-center`}>No exams are pending publication.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {exams.map((exam, i) => (
                        <div key={exam.exam_id || i}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                                isDarkMode ? 'bg-slate-800/60' : 'bg-slate-50'
                            }`}>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></div>
                                <p className={`${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-sm font-medium truncate`}>
                                    {exam.title || "Untitled Exam"}
                                </p>
                            </div>
                            <span className={`text-xs flex-shrink-0 ml-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {exam.created_at
                                    ? new Date(exam.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                    : "—"}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <Link to="/instructor/publish"
                className="w-full mt-6 flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors group">
                Go to Publish
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
        </div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function StatsCards({ submissionStats, keyStatus, unpublishedExams }) {
    return (
        <section aria-label="Instructor Dashboard Stats" className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <EvaluationOverviewCard submissionStats={submissionStats} />
            <SecurityStatusCard     keyStatus={keyStatus} />
            <PendingPublicationsCard unpublishedExams={unpublishedExams} />
        </section>
    );
}
