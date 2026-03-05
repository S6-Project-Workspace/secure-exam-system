import React, { useMemo } from "react";
import { useTheme } from "../../../context/ThemeContext";

/**
 * PerformanceGraph
 * Props:
 *   results  – array from /results/me  ({ exam_id, marks, evaluated_at, ... })
 *   exams    – array from /exams/me    ({ exam_id, title, ... })
 */
export default function PerformanceGraph({ results = [], exams = [] }) {
    const { isDarkMode } = useTheme();

    // Build a title lookup: exam_id → title
    const examTitleMap = useMemo(() => {
        const map = {};
        exams.forEach(e => { if (e.exam_id) map[e.exam_id] = e.title || "Exam"; });
        return map;
    }, [exams]);

    // Sort results by evaluated_at ascending so the graph reads left→right chronologically
    const sorted = useMemo(() => {
        return [...results]
            .filter(r => r.marks != null)
            .sort((a, b) => {
                const da = a.evaluated_at ? new Date(a.evaluated_at) : 0;
                const db = b.evaluated_at ? new Date(b.evaluated_at) : 0;
                return da - db;
            });
    }, [results]);

    // Derive stats
    const percentages = sorted.map(r => Math.min(100, Math.max(0, Number(r.marks))));
    const avg = percentages.length
        ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
        : null;
    const latest = percentages.length ? percentages[percentages.length - 1] : null;
    const trend = percentages.length > 1 ? latest - percentages[0] : null;
    const best = percentages.length ? Math.max(...percentages) : null;

    // SVG chart dimensions
    const W = 500;
    const H = 130;
    const PAD_X = 10;
    const PAD_Y = 12;
    const chartW = W - PAD_X * 2;
    const chartH = H - PAD_Y * 2;

    const points = useMemo(() => {
        if (percentages.length === 0) return [];
        if (percentages.length === 1) {
            // Single point — center it
            return [{ x: W / 2, y: PAD_Y + chartH * (1 - percentages[0] / 100) }];
        }
        return percentages.map((p, i) => ({
            x: PAD_X + (i / (percentages.length - 1)) * chartW,
            y: PAD_Y + chartH * (1 - p / 100),
        }));
    }, [percentages]);

    // Build smooth polyline path
    const buildPath = (pts) => {
        if (pts.length === 0) return "";
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const cpX = (pts[i - 1].x + pts[i].x) / 2;
            d += ` C ${cpX} ${pts[i - 1].y} ${cpX} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
        }
        return d;
    };

    const linePath = buildPath(points);
    // Area fill: close the path to the bottom
    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`
        : "";

    const gradeColor = (pct) => {
        if (pct == null) return isDarkMode ? "#94a3b8" : "#64748b";
        if (pct >= 80) return "#10b981";
        if (pct >= 60) return "#6366f1";
        return "#f59e0b";
    };

    const gradientId = "perf-grad";
    const lineColor = gradeColor(avg);

    const cardBg = isDarkMode ? "bg-[#1a2332] border-slate-700/50" : "bg-white border-slate-200";
    const mutedText = isDarkMode ? "text-slate-400" : "text-slate-500";
    const headingText = isDarkMode ? "text-white" : "text-slate-900";
    const subText = isDarkMode ? "text-slate-300" : "text-slate-700";

    if (results.length === 0) {
        return (
            <section className={`rounded-2xl border p-6 ${cardBg}`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl ${isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                        <span className="material-symbols-outlined text-indigo-500 text-xl">show_chart</span>
                    </div>
                    <div>
                        <h3 className={`font-bold text-base ${headingText}`}>Performance Graph</h3>
                        <p className={`text-xs ${mutedText}`}>Marks % across all exams</p>
                    </div>
                </div>
                <div className={`flex flex-col items-center justify-center py-10 gap-2 ${mutedText}`}>
                    <span className="material-symbols-outlined text-4xl opacity-30">bar_chart</span>
                    <p className="text-sm">No results published yet.</p>
                    <p className="text-xs opacity-70">Your graph will appear once your instructor publishes your results.</p>
                </div>
            </section>
        );
    }

    return (
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                        <span className="material-symbols-outlined text-indigo-500 text-xl">show_chart</span>
                    </div>
                    <div>
                        <h3 className={`font-bold text-base ${headingText}`}>Performance Graph</h3>
                        <p className={`text-xs ${mutedText}`}>Marks % across {sorted.length} exam{sorted.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>

                {/* Stat pills */}
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    {avg !== null && (
                        <span className={`px-3 py-1 rounded-full ${isDarkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
                            Avg <span style={{ color: lineColor }}>{avg}%</span>
                        </span>
                    )}
                    {best !== null && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                            Best {best}%
                        </span>
                    )}
                    {trend !== null && (
                        <span className={`px-3 py-1 rounded-full flex items-center gap-0.5 ${trend >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400"}`}>
                            <span className="material-symbols-outlined text-xs">{trend >= 0 ? "trending_up" : "trending_down"}</span>
                            {trend >= 0 ? "+" : ""}{trend}%
                        </span>
                    )}
                </div>
            </div>

            {/* SVG Chart */}
            <div className="relative w-full overflow-x-auto">
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    preserveAspectRatio="none"
                    className="w-full"
                    style={{ height: "130px" }}
                    aria-label="Performance line chart"
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal guide lines at 25%, 50%, 75%, 100% */}
                    {[25, 50, 75, 100].map(pct => {
                        const y = PAD_Y + chartH * (1 - pct / 100);
                        return (
                            <g key={pct}>
                                <line
                                    x1={PAD_X} y1={y} x2={W - PAD_X} y2={y}
                                    stroke={isDarkMode ? "#334155" : "#e2e8f0"}
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={PAD_X}
                                    y={y - 3}
                                    fontSize="8"
                                    fill={isDarkMode ? "#475569" : "#94a3b8"}
                                    fontFamily="system-ui, sans-serif"
                                >
                                    {pct}%
                                </text>
                            </g>
                        );
                    })}

                    {/* Area fill */}
                    {areaPath && (
                        <path d={areaPath} fill={`url(#${gradientId})`} />
                    )}

                    {/* Line */}
                    {linePath && (
                        <path
                            d={linePath}
                            fill="none"
                            stroke={lineColor}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Data points */}
                    {points.map((pt, i) => (
                        <g key={i}>
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="5"
                                fill={isDarkMode ? "#1a2332" : "#fff"}
                                stroke={lineColor}
                                strokeWidth="2"
                            />
                        </g>
                    ))}
                </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 px-1">
                {sorted.map((r, i) => (
                    <div key={i} className="flex flex-col items-center" style={{ flex: "1", minWidth: 0 }}>
                        <span
                            className={`text-[10px] truncate max-w-[56px] text-center font-medium ${mutedText}`}
                            title={examTitleMap[r.exam_id] || r.exam_id}
                        >
                            {examTitleMap[r.exam_id]
                                ? examTitleMap[r.exam_id].length > 8
                                    ? examTitleMap[r.exam_id].slice(0, 8) + "…"
                                    : examTitleMap[r.exam_id]
                                : `E${i + 1}`}
                        </span>
                        <span
                            className="text-[11px] font-bold mt-0.5"
                            style={{ color: gradeColor(percentages[i]) }}
                        >
                            {percentages[i]}%
                        </span>
                    </div>
                ))}
            </div>

            {/* Per-exam row list (if more than 1 result) */}
            {sorted.length > 1 && (
                <div className={`mt-5 divide-y ${isDarkMode ? "divide-slate-700/50" : "divide-slate-100"}`}>
                    {sorted.map((r, i) => {
                        const pct = percentages[i];
                        const title = examTitleMap[r.exam_id] || `Exam ${i + 1}`;
                        const dateStr = r.evaluated_at
                            ? new Date(r.evaluated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                            : "—";
                        return (
                            <div key={i} className="flex items-center gap-3 py-2.5">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ backgroundColor: gradeColor(pct) + "22", color: gradeColor(pct) }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${subText}`}>{title}</p>
                                    <p className={`text-xs ${mutedText}`}>{dateStr}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span
                                        className="font-bold text-sm"
                                        style={{ color: gradeColor(pct) }}
                                    >
                                        {pct}%
                                    </span>
                                    <div className="w-20 h-1.5 mt-1 rounded-full overflow-hidden"
                                        style={{ backgroundColor: isDarkMode ? "#334155" : "#e2e8f0" }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, backgroundColor: gradeColor(pct) }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
