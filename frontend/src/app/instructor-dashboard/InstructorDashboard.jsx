import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { getToken, clearSession, authFetch } from "../auth/authHelpers";

// Dashboard Components
import DashboardHeader from "./components/DashboardHeader";
import StatsCards from "./components/StatsCards";
import PerformanceAnalytics from "./components/PerformanceAnalytics";
import QuickActions from "./components/QuickActions";
import ExamOverview from "./components/ExamOverview";
import SecurityFooter from "./components/SecurityFooter";
import DashboardFooter from "./components/DashboardFooter";
import IdentityManagement from "./components/IdentityManagement";

export default function InstructorDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "Instructor", id: "" });
    const [stats, setStats] = useState({
        activeExams: 3,
        submissions: 142,
        resultsPublished: 12
    });
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyStatus, setKeyStatus] = useState({ generated: false, uploaded: false });

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            try {
                // Get user profile
                const profileRes = await authFetch(`${API_BASE_URL}/auth/me`);
                const profileData = await profileRes.json();
                setUser({ name: "Instructor", id: profileData.user?.sub || "" });

                // Fetch instructor's exams
                const examsRes = await authFetch(`${API_BASE_URL}/exams/instructor`);
                if (examsRes.ok) {
                    const examsData = await examsRes.json();
                    setExams(examsData.exams || []);

                    // Calculate stats
                    const activeCount = examsData.exams?.filter(e => e.status === "published").length || 0;
                    setStats(prev => ({ ...prev, activeExams: activeCount }));
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        // Check for existing keys in localStorage
        const hasOaepKey = localStorage.getItem("instructor_oaep_private_key");
        const hasPssKey = localStorage.getItem("instructor_pss_private_key");
        const hasLegacyKey = localStorage.getItem("instructor_private_key");
        const keysGenerated = !!(hasOaepKey && hasPssKey) || !!hasLegacyKey;
        const keysUploaded = localStorage.getItem("instructor_keys_uploaded") === "true";
        setKeyStatus({ generated: keysGenerated, uploaded: keysUploaded });

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        clearSession();
        navigate("/login");
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
            <DashboardHeader name={user.name} onLogout={handleLogout} />

            <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
                <StatsCards stats={stats} />
                <IdentityManagement keyStatus={keyStatus} />
                <PerformanceAnalytics />
                <QuickActions />
                <ExamOverview exams={exams} />
                <SecurityFooter />
            </main>

            <DashboardFooter />
        </div>
    );
}
