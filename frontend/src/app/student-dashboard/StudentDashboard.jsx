import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { getToken, clearSession, authFetch } from "../auth/authHelpers";

// Dashboard Components
import DashboardHeader from "./components/DashboardHeader";
import WelcomeBanner from "./components/WelcomeBanner";
import StatsCards from "./components/StatsCards";
import PerformanceAnalytics from "./components/PerformanceAnalytics";
import IdentityManagement from "./components/IdentityManagement";
import AvailableExams from "./components/AvailableExams";
import SystemHealth from "./components/SystemHealth";
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
                console.log("Auth Check (Profile):", data);
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
            const res = await authFetch(`${API_BASE_URL}/keys/upload`, {
                method: "POST",
                body: JSON.stringify({ public_key: combinedPub })
            });

            if (res.ok) {
                setKeyStatus({ generated: true, uploaded: true });
            } else {
                throw new Error("Upload failed");
            }
        } catch (err) {
            console.error("Key gen failed:", err);
            alert("Key generation failed.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark">
                <div className="animate-spin material-symbols-outlined text-4xl text-blue-900 dark:text-blue-400">progress_activity</div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-background-dark min-h-screen flex flex-col font-body text-slate-500 dark:text-slate-300 transition-colors duration-300">
            <DashboardHeader name={user.name} id={user.id} onLogout={handleLogout} />

            <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
                <WelcomeBanner name={user.name} />
                <StatsCards stats={stats} keyStatus={keyStatus} />
                <PerformanceAnalytics performance={performance} stats={stats} results={results} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <IdentityManagement keyStatus={keyStatus} onGenerateKeys={generateAndUploadKeys} />
                        <AvailableExams exams={exams} results={results} />
                    </div>
                    <div className="space-y-6">
                        <SystemHealth keyStatus={keyStatus} />
                        <div className="bg-gradient-to-b from-blue-950 to-blue-900 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
                            <h3 className="text-lg font-bold mb-3 relative z-10">Exam Guidelines</h3>
                            <ul className="space-y-3 text-sm text-blue-100 relative z-10">
                                <li className="flex gap-2 items-start"><span className="material-symbols-outlined text-sm mt-0.5">info</span>Ensure well-lit room.</li>
                                <li className="flex gap-2 items-start"><span className="material-symbols-outlined text-sm mt-0.5">info</span>Do not switch tabs.</li>
                                <li className="flex gap-2 items-start"><span className="material-symbols-outlined text-sm mt-0.5">info</span>Keep ID card ready.</li>
                            </ul>
                            <button className="mt-4 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2 rounded-lg text-sm transition-colors">Read Full Policy</button>
                        </div>
                    </div>
                </div>
            </main>

            <DashboardFooter />
        </div>
    );
}
