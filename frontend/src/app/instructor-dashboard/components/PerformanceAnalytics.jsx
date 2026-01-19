import React from "react";

export default function PerformanceAnalytics() {
    return (
        <section aria-label="Performance Analytics">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-slate-500">monitoring</span>
                <h2 className="text-xl font-bold text-slate-800">Performance Analytics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Class Performance Trends Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Class Performance Trends</h3>
                            <p className="text-xs text-slate-500 mt-1">Average scores across all exams (Last 6 Months)</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>Avg. Score
                            </span>
                            <select className="text-xs border-slate-200 rounded-md bg-transparent text-slate-500 py-1 pl-2 pr-6 focus:ring-indigo-600 focus:border-indigo-600">
                                <option>Last 6 Months</option>
                                <option>Academic Year</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-grow w-full relative h-48 sm:h-56">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-300 pointer-events-none">
                            <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
                            <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
                            <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
                            <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
                        </div>

                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                            <path className="fill-indigo-50 stroke-none opacity-50" d="M0 40 L0 25 L20 28 L40 15 L60 18 L80 8 L100 12 L100 40 Z"></path>
                            <path className="stroke-indigo-600 stroke-[0.5]" d="M0 25 L20 28 L40 15 L60 18 L80 8 L100 12" fill="none" vectorEffect="non-scaling-stroke"></path>
                            <circle className="fill-white stroke-indigo-600 stroke-[0.5]" cx="0" cy="25" r="1"></circle>
                            <circle className="fill-white stroke-indigo-600 stroke-[0.5]" cx="20" cy="28" r="1"></circle>
                            <circle className="fill-white stroke-indigo-600 stroke-[0.5]" cx="40" cy="15" r="1"></circle>
                            <circle className="fill-white stroke-indigo-600 stroke-[0.5]" cx="60" cy="18" r="1"></circle>
                            <circle className="fill-white stroke-indigo-600 stroke-[0.5]" cx="80" cy="8" r="1"></circle>
                            <circle className="fill-white stroke-indigo-600 stroke-[0.5]" cx="100" cy="12" r="1"></circle>
                        </svg>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 mt-2 px-0">
                        <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                    </div>
                </div>

                {/* Right Column - Grade Distribution + Trouble Spots */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Grade Distribution */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Grade Distribution</h3>
                            <p className="text-xs text-slate-500">Most Recent Exam: CS-402</p>
                        </div>

                        <div className="h-40 flex items-end justify-between gap-2 text-xs font-medium text-slate-500">
                            <div className="flex flex-col items-center gap-1 w-full group cursor-pointer">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-[10px] font-bold text-emerald-500">12</span>
                                <div className="w-full bg-emerald-500 rounded-t-sm hover:opacity-90 transition-opacity" style={{ height: "60%" }}></div>
                                <span>A</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 w-full group cursor-pointer">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-[10px] font-bold text-teal-500">24</span>
                                <div className="w-full bg-teal-500 rounded-t-sm hover:opacity-90 transition-opacity" style={{ height: "80%" }}></div>
                                <span>B</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 w-full group cursor-pointer">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-[10px] font-bold text-blue-500">15</span>
                                <div className="w-full bg-blue-500 rounded-t-sm hover:opacity-90 transition-opacity" style={{ height: "45%" }}></div>
                                <span>C</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 w-full group cursor-pointer">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-[10px] font-bold text-amber-500">8</span>
                                <div className="w-full bg-amber-500 rounded-t-sm hover:opacity-90 transition-opacity" style={{ height: "25%" }}></div>
                                <span>D</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 w-full group cursor-pointer">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-[10px] font-bold text-red-500">3</span>
                                <div className="w-full bg-red-500 rounded-t-sm hover:opacity-90 transition-opacity" style={{ height: "10%" }}></div>
                                <span>F</span>
                            </div>
                        </div>
                    </div>

                    {/* Trouble Spots */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex-grow">
                        <div className="flex items-center gap-2 mb-4 text-red-500">
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                            <h3 className="text-base font-bold text-slate-800">Trouble Spots</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-slate-700">RSA Key Generation</span>
                                    <span className="font-bold text-red-500">68% Incorrect</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "68%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-slate-700">Elliptic Curve Logic</span>
                                    <span className="font-bold text-amber-500">45% Incorrect</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "45%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-slate-700">Digital Signatures</span>
                                    <span className="font-bold text-amber-500">32% Incorrect</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "32%" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
