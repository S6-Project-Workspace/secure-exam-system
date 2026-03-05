import React, { useMemo } from "react";
import { useTheme } from "../../../context/ThemeContext";

/**
 * PerformanceGraph
 * Props:
 *   results  – array from /results/me  ({ exam_id, marks, total_questions, evaluated_at })
 *   exams    – array from /exams/me    ({ exam_id, title, question_count })
 *
 * Percentage = (marks / totalQ) * 100
 * totalQ priority: result.total_questions → exam.question_count → null (show as-is)
 */
export default function PerformanceGraph({ results = [], exams = [] }) {
    const { isDarkMode } = useTheme();

    // exam_id → title and question_count
    const examMap = useMemo(() => {
        const map = {};
        exams.forEach(e => {
            if (e.exam_id) map[e.exam_id] = { title: e.title || "Exam", question_count: e.question_count || 0 };
        });
        return map;
    }, [exams]);

    // Sort results oldest → newest AND deduplicate by exam_id (keep latest)
    const sorted = useMemo(() => {
        // First, group by exam_id and keep the most recent result
        const latestResults = new Map();
        [...results]
            .filter(r => r.marks != null)
            .forEach(r => {
                const existing = latestResults.get(r.exam_id);
                if (!existing) {
                    latestResults.set(r.exam_id, r);
                } else {
                    const existingDate = existing.evaluated_at ? new Date(existing.evaluated_at) : 0;
                    const newDate = r.evaluated_at ? new Date(r.evaluated_at) : 0;
                    if (newDate > existingDate) {
                        latestResults.set(r.exam_id, r);
                    }
                }
            });

        // Then, sort the unique results chronologically (oldest to newest for the graph left-to-right)
        return Array.from(latestResults.values())
            .sort((a, b) => {
                const da = a.evaluated_at ? new Date(a.evaluated_at) : 0;
                const db = b.evaluated_at ? new Date(b.evaluated_at) : 0;
                return da - db;
            });
    }, [results]);

    // Compute percentage: (marks / totalQ) * 100
    const computedData = sorted.map(r => {
        // Try total_questions from result (backend enriched), then from exams endpoint
        const tq = (r.total_questions && r.total_questions > 0)
            ? r.total_questions
            : (examMap[r.exam_id]?.question_count > 0 ? examMap[r.exam_id].question_count : null);

        const score = Number(r.marks);
        const pct = tq ? Math.min(100, Math.round((score / tq) * 100)) : score;

        return {
            pct,
            rawMarks: score,
            totalQ: tq,
            label: tq ? `${score} / ${tq}` : `${score} marks`,
        };
    });

    const percentages = computedData.map(d => d.pct);

    const avg = percentages.length
        ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
        : null;
    const best = percentages.length ? Math.max(...percentages) : null;
    const latest = percentages.length ? percentages[percentages.length - 1] : null;
    const trend = percentages.length > 1 ? latest - percentages[0] : null;

    // SVG dimensions
    const W = 500, H = 140, PX = 32, PY = 16;
    const cW = W - PX * 2, cH = H - PY * 2;

    const points = useMemo(() => {
        if (percentages.length === 0) return [];
        if (percentages.length === 1) return [{ x: W / 2, y: PY + cH * (1 - percentages[0] / 100) }];
        return percentages.map((p, i) => ({
            x: PX + (i / (percentages.length - 1)) * cW,
            y: PY + cH * (1 - p / 100),
        }));
    }, [percentages]);

    const buildPath = pts => {
        if (!pts.length) return "";
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const cx = (pts[i - 1].x + pts[i].x) / 2;
            d += ` C ${cx} ${pts[i - 1].y} ${cx} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
        }
        return d;
    };

    const linePath = buildPath(points);
    const areaPath = points.length ? `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z` : "";

    const gradeColor = pct => {
        if (pct == null) return "#94a3b8";
        if (pct >= 80) return "#10b981";
        if (pct >= 60) return "#6366f1";
        return "#f59e0b";
    };

    const lineColor = gradeColor(avg);
    const dark = isDarkMode;
    const card = dark ? "bg-[#1a2332] border-slate-700/50" : "bg-white border-slate-200";
    const muted = dark ? "text-slate-400" : "text-slate-500";
    const heading = dark ? "text-white" : "text-slate-900";
    const sub = dark ? "text-slate-300" : "text-slate-700";
    const gridLine = dark ? "#334155" : "#e2e8f0";
    const gridText = dark ? "#475569" : "#94a3b8";
    const dotBg = dark ? "#1a2332" : "#ffffff";

    // ── No results state ────────────────────────────────────────────────────
    if (!sorted.length) {
        return (
            <div className="w-full lg:w-1/2">
                <section className={`rounded-2xl border p-6 ${card}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-xl ${dark ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                            <span className="material-symbols-outlined text-indigo-500 text-xl">show_chart</span>
                        </div>
                        <div>
                            <h3 className={`font-bold text-base ${heading}`}>Performance</h3>
                            <p className={`text-xs ${muted}`}>Score % across exams</p>
                        </div>
                    </div>
                    <div className={`flex flex-col items-center justify-center py-10 gap-2 ${muted}`}>
                        <span className="material-symbols-outlined text-4xl opacity-30">bar_chart</span>
                        <p className="text-sm font-medium">No results yet</p>
                        <p className="text-xs opacity-60">Graph appears once your instructor publishes results.</p>
                    </div>
                </section>
            </div>
        );
    }

    // ── Main graph ──────────────────────────────────────────────────────────
    return (
        <div className="w-full lg:w-1/2">
            <section className={`rounded-2xl border p-6 ${card}`}>

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${dark ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                            <span className="material-symbols-outlined text-indigo-500 text-xl">show_chart</span>
                        </div>
                        <div>
                            <h3 className={`font-bold text-base ${heading}`}>Performance</h3>
                            <p className={`text-xs ${muted}`}>{sorted.length} exam{sorted.length !== 1 ? "s" : ""}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        {avg !== null && (
                            <span className={`px-3 py-1 rounded-full ${dark ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
                                Avg <span style={{ color: lineColor }}>{avg}%</span>
                            </span>
                        )}
                        {best !== null && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                                Best {best}%
                            </span>
                        )}
                        {trend !== null && (
                            <span className={`px-3 py-1 rounded-full flex items-center gap-0.5
                                ${trend >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400"}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                                    {trend >= 0 ? "trending_up" : "trending_down"}
                                </span>
                                {trend >= 0 ? "+" : ""}{trend}%
                            </span>
                        )}
                    </div>
                </div>

                {/* ── SVG Line Chart ── */}
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }} aria-label="Performance chart">
                    <defs>
                        <linearGradient id="pg-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(pct => {
                        const y = PY + cH * (1 - pct / 100);
                        return (
                            <g key={pct}>
                                <line x1={PX} y1={y} x2={W - PX} y2={y}
                                    stroke={gridLine} strokeWidth="1" strokeDasharray={pct === 0 ? "0" : "4 4"} />
                                <text x={PX - 4} y={y + 3.5} fontSize="9" textAnchor="end"
                                    fill={gridText} fontFamily="system-ui,sans-serif">
                                    {pct}%
                                </text>
                            </g>
                        );
                    })}

                    {/* Area fill */}
                    {areaPath && <path d={areaPath} fill="url(#pg-fill)" />}

                    {/* Line */}
                    {linePath && (
                        <path d={linePath} fill="none" stroke={lineColor}
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    )}

                    {/* Dots */}
                    {points.map((pt, i) => (
                        <circle key={i} cx={pt.x} cy={pt.y} r="5"
                            fill={dotBg} stroke={gradeColor(percentages[i])} strokeWidth="2.5" />
                    ))}
                </svg>

                {/* ── X-axis labels ── */}
                <div className="flex mt-1" style={{ paddingLeft: PX, paddingRight: PX }}>
                    {sorted.map((r, i) => {
                        const title = examMap[r.exam_id]?.title || `E${i + 1}`;
                        return (
                            <div key={i} className="flex flex-col items-center" style={{ flex: 1, minWidth: 0 }}>
                                <span className={`text-[9px] truncate max-w-[52px] text-center ${muted}`}
                                    title={title}>
                                    {title.length > 8 ? title.slice(0, 8) + "…" : title}
                                </span>
                                <span className="text-[11px] font-bold" style={{ color: gradeColor(percentages[i]) }}>
                                    {percentages[i]}%
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* ── Per-exam breakdown ── */}
                <div className={`mt-4 divide-y ${dark ? "divide-slate-700/40" : "divide-slate-100"}`}>
                    {sorted.map((r, i) => {
                        const pct = percentages[i];
                        const { label } = computedData[i];
                        const title = examMap[r.exam_id]?.title || `Exam ${i + 1}`;
                        const dateStr = r.evaluated_at
                            ? new Date(r.evaluated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                            : "—";
                        return (
                            <div key={i} className="flex items-center gap-3 py-2.5">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ background: gradeColor(pct) + "22", color: gradeColor(pct) }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${sub}`}>{title}</p>
                                    <p className={`text-xs ${muted}`}>{label} · {dateStr}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className="font-bold text-sm" style={{ color: gradeColor(pct) }}>{pct}%</span>
                                    <div className="w-20 h-1.5 mt-1 rounded-full overflow-hidden"
                                        style={{ background: dark ? "#334155" : "#e2e8f0" }}>
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, background: gradeColor(pct) }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </section>
        </div>
    );
}
