import React from "react";

export default function RecentExams({ exams }) {
    const defaultExams = [
        {
            id: 1,
            title: "Advanced Cryptography",
            code: "CS-402",
            term: "Fall 2023",
            status: "published",
            submissions: 42,
            total: 45,
            resultStatus: "pending"
        },
        {
            id: 2,
            title: "Network Security Principles",
            code: "CS-305",
            term: "Fall 2023",
            status: "draft",
            submissions: 0,
            total: 0,
            resultStatus: null
        },
        {
            id: 3,
            title: "Database Management",
            code: "DB-201",
            term: "Fall 2023",
            status: "closed",
            submissions: 120,
            total: 120,
            resultStatus: "grading"
        },
        {
            id: 4,
            title: "Data Structures I",
            code: "CS-101",
            term: "Summer 2023",
            status: "closed",
            submissions: 85,
            total: 85,
            resultStatus: "published"
        }
    ];

    const displayExams = exams?.length > 0 ? exams : defaultExams;

    const getStatusBadge = (status) => {
        switch (status) {
            case "published":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                        Published
                    </span>
                );
            case "draft":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Draft
                    </span>
                );
            case "closed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Closed
                    </span>
                );
            default:
                return null;
        }
    };

    const getResultBadge = (resultStatus) => {
        switch (resultStatus) {
            case "pending":
                return <span className="text-slate-500 italic">Pending Evaluation</span>;
            case "grading":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                        Grading
                    </span>
                );
            case "published":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Published
                    </span>
                );
            default:
                return <span className="text-slate-400">-</span>;
        }
    };

    const getActionButton = (status) => {
        switch (status) {
            case "published":
                return <button className="text-indigo-600 hover:text-blue-900 font-medium text-sm transition-colors">Monitor</button>;
            case "draft":
                return <button className="text-indigo-600 hover:text-blue-900 font-medium text-sm transition-colors">Edit</button>;
            case "closed":
                return <button className="text-indigo-600 hover:text-blue-900 font-medium text-sm transition-colors">Evaluate</button>;
            default:
                return <button className="text-slate-500 hover:text-blue-900 font-medium text-sm transition-colors">View</button>;
        }
    };

    return (
        <section aria-label="Recent Exams" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800">Recent Exams Overview</h2>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">Filter</button>
                    <button className="px-3 py-1.5 text-xs font-medium text-blue-900 bg-blue-50 border border-transparent rounded hover:bg-blue-100 transition-colors">View All</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4">Exam Title / Course Code</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Submissions</th>
                            <th className="px-6 py-4">Result Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {displayExams.map((exam) => (
                            <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-800">{exam.title}</span>
                                        <span className="text-xs text-slate-500">{exam.code} • {exam.term}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{getStatusBadge(exam.status)}</td>
                                <td className="px-6 py-4 text-slate-700">
                                    {exam.submissions > 0 ? (
                                        <><span className="font-mono font-medium">{exam.submissions}</span> / {exam.total}</>
                                    ) : (
                                        <span className="font-mono text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">{getResultBadge(exam.resultStatus)}</td>
                                <td className="px-6 py-4 text-right">{getActionButton(exam.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
