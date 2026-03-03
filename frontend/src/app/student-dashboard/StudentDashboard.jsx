import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { getToken, clearSession, authFetch } from "../auth/authHelpers";
import { useTheme } from "../../context/ThemeContext";

// Dashboard Components
import DashboardHeaderNew from "./components/DashboardHeaderNew";
import ExamOverviewCard from "./components/ExamOverviewCard";
import SecurityStatusCard from "./components/SecurityStatusCard";
import PendingExamsCard from "./components/PendingExamsCard";
import IdentityManagement from "./components/IdentityManagement";
import AvailableExams from "./components/AvailableExams";
import DashboardFooter from "./components/DashboardFooter";

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "Student", id: "" });
    const [keyStatus, setKeyStatus] = useState({ generated: false, uploaded: false });
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [stats, setStats] = useState({ upcoming: 0, attempted: 0, totalExams: 0 });
    const [performance, setPerformance] = useState({ average: 0, trend: 0, subjects: [] });
    const [loading, setLoading] = useState(true);

    // Initial load and auth check
    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/login");
            return;
        }

        // --- STEP 4 AUTH TEST ---
        const testAuth = async () => {
            try {
                const res = await authFetch(`${API_BASE_URL}/auth/me`);
                const data = await res.json();

                setUser({ name: "Student", id: data.user?.sub || "" });
            } catch (err) {
                console.error("Auth test failed:", err);
            }
        };

        // Fetch data
        const fetchData = async () => {
            try {
                const [examsRes, resultsRes] = await Promise.all([
                    authFetch(`${API_BASE_URL}/exams/me`),
                    authFetch(`${API_BASE_URL}/results/me`)
                ]);

                const examsData = await examsRes.json();
                const resultsData = await resultsRes.json();

                setExams(examsData.exams || []);
                setResults(resultsData.results || []);

                // Stats calculation
                const attemptedCount = resultsData.results?.length || 0;
                const totalCount = examsData.exams?.length || 0;
                setStats({
                    upcoming: Math.max(0, totalCount - attemptedCount),
                    attempted: attemptedCount,
                    totalExams: totalCount
                });

                // Performance calculation
                if (resultsData.results?.length > 0) {
                    const marks = resultsData.results.map(r => r.marks);
                    const avg = marks.reduce((a, b) => a + b, 0) / marks.length;
                    const trendValue = marks.length > 1 ? marks[0] - marks[marks.length - 1] : 0;
                    setPerformance({
                        average: avg.toFixed(1),
                        trend: trendValue.toFixed(1)
                    });
                }
            } catch (err) {
                console.error("Fetch data failed:", err);
            }
        };

        testAuth();
        fetchData();

        // Check keys
        const hasPrivateKey = !!localStorage.getItem("student_private_key");
        const hasSignKey = !!localStorage.getItem("student_sign_private_key");
        setKeyStatus({ generated: hasPrivateKey && hasSignKey, uploaded: hasPrivateKey && hasSignKey });

        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        clearSession();
        navigate("/login");
    };

    const { isDarkMode } = useTheme();

    const generateAndUploadKeys = async () => {
        try {
            setKeyStatus({ generated: false, uploaded: false });

            // Generate pairs
            const oaepPair = await window.crypto.subtle.generateKey(
                { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
                true, ["encrypt", "decrypt"]
            );
            const pssPair = await window.crypto.subtle.generateKey(
                { name: "RSA-PSS", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
                true, ["sign", "verify"]
            );

            // Export private
            const pkcs8_oaep = await window.crypto.subtle.exportKey("pkcs8", oaepPair.privateKey);
            const pkcs8_pss = await window.crypto.subtle.exportKey("pkcs8", pssPair.privateKey);

            const bufferToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
            localStorage.setItem("student_private_key", bufferToBase64(pkcs8_oaep));
            localStorage.setItem("student_sign_private_key", bufferToBase64(pkcs8_pss));

            // Export public as PEM
            const exportPem = async (key) => {
                const spki = await window.crypto.subtle.exportKey("spki", key);
                const b64 = bufferToBase64(spki);
                return `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join("\n")}\n-----END PUBLIC KEY-----`;
            };

            const combinedPub = JSON.stringify({
                oaep: await exportPem(oaepPair.publicKey),
                pss: await exportPem(pssPair.publicKey)
            });

            // Upload
            const res = await authFetch(`${API_BASE_URL}/keys/upload?public_key=${encodeURIComponent(combinedPub)}`, {
                method: "POST",
            });

            if (res.ok) {
                setKeyStatus({ generated: true, uploaded: true });
            } else {
                throw new Error("Upload failed");
            }
        } catch (err) {
            setKeyStatus({ generated: false, uploaded: false });
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
                <div className={`animate-spin material-symbols-outlined text-4xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>progress_activity</div>
            </div>
        );
    }

    // Calculate stats for the new dashboard
    const pendingCount = Math.max(0, (exams?.length || 0) - (results?.length || 0));
    const completedCount = results?.length || 0;
    const totalCount = exams?.length || 0;

    return (
        <div className={`${isDarkMode ? 'bg-[#0f172a] text-slate-300' : 'bg-slate-50 text-slate-700'} min-h-screen flex flex-col font-body transition-colors duration-300`}>
            <DashboardHeaderNew name={user.name} id={user.id} onLogout={handleLogout} />

            <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Dashboard Overview Header */}
                <div id="dashboard" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dashboard Overview</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-emerald-400 text-sm">System Integrity Check: Passed</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-[#1a2332] border-slate-700 text-slate-300 hover:bg-[#1e293b]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'} border rounded-lg transition-colors text-sm`}>
                            <span className="material-symbols-outlined text-lg">description</span>
                            Audit Log
                        </button>
                        <Link
                            to="/student/keygen"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors text-sm font-medium"
                        >
                            <span className="material-symbols-outlined text-lg">key</span>
                            Manage Keys
                        </Link>
                    </div>
                </div>

                {/* Main Three-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <ExamOverviewCard
                        stats={{
                            totalExams: totalCount,
                            pending: pendingCount,
                            completed: completedCount
                        }}
                    />
                    <SecurityStatusCard keyStatus={keyStatus} />
                    <PendingExamsCard exams={exams} results={results} />
                </div>

                {/* Identity Management Section */}
                <section id="settings" className="mb-8">
                    <IdentityManagement keyStatus={keyStatus} onGenerateKeys={generateAndUploadKeys} />
                </section>

                {/* Available Exams Section */}
                <section id="exams" className="mb-8">
                    <AvailableExams exams={exams} results={results} />
                </section>
            </main>

            <DashboardFooter />
        </div>
    );
}
