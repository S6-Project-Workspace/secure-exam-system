import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { getToken, clearSession, authFetch } from "../auth/authHelpers";
import { useTheme } from "../../context/ThemeContext";

// Dashboard Components
import InstructorHeader from "./components/InstructorHeader";
import StatsCards from "./components/StatsCards";
import QuickActions from "./components/QuickActions";
import ExamOverview from "./components/ExamOverview";
import DashboardFooter from "./components/DashboardFooter";
import IdentityManagement from "./components/IdentityManagement";

export default function InstructorDashboard() {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [user, setUser] = useState({ name: "Instructor", id: "" });
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyStatus, setKeyStatus] = useState({ generated: false, uploaded: false });
    // Stats for the new cards
    const [submissionStats, setSubmissionStats] = useState({ total: 0, evaluated: 0, pending: 0 });
    const [unpublishedExams, setUnpublishedExams] = useState([]);

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
                    const allExams = examsData.exams || [];
                    setExams(allExams);

                    // Fetch stats from the new endpoint
                    const statsRes = await authFetch(`${API_BASE_URL}/instructor/stats`);
                    if (statsRes.ok) {
                        const statsData = await statsRes.json();
                        setSubmissionStats({
                            total: statsData.total_submissions || 0,
                            evaluated: statsData.evaluated_count || 0,
                            pending: statsData.pending_evaluation || 0,
                        });
                        setUnpublishedExams(statsData.unpublished_exams || []);
                    }
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
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
                <div className={`animate-spin material-symbols-outlined text-4xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>progress_activity</div>
            </div>
        );
    }

    return (
        <div className={`${isDarkMode ? 'bg-[#0f172a] text-slate-300' : 'bg-slate-50 text-slate-700'} min-h-screen flex flex-col font-body transition-colors duration-300`}>
            <InstructorHeader name={user.name} onLogout={handleLogout} />

            <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
                <StatsCards
                    submissionStats={submissionStats}
                    keyStatus={keyStatus}
                    unpublishedExams={unpublishedExams}
                />
                <IdentityManagement keyStatus={keyStatus} />
                <QuickActions />
                <ExamOverview exams={exams} />
            </main>

            <DashboardFooter />
        </div>
    );
}
