import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

export default function Signup() {
    const navigate = useNavigate();
    const [role, setRole] = useState("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: role
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Registration failed");
            }

            navigate("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Panel - Dark */}
            <div className="hidden lg:flex lg:w-[45%] bg-black text-white flex-col justify-between p-10 relative overflow-hidden">
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-neutral-800 opacity-90"></div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Back to Home */}
                    <Link
                        to="/"
                        className="inline-flex items-center mr-6gap-2 text-slate-400 hover:text-white transition-colors mb-12 text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                       
                    </Link>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-8">
                        <span className="material-symbols-outlined text-base text-purple-200">shield</span>
                        <span className="text-xs font-semibold tracking-wider text-purple-200">SECURE REGISTRATION</span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Join the Secure<br />
                        <span className="text-primary">Exam Platform.</span>
                    </h1>

                    {/* Description */}
                    <p className="text-purple-200 text-base leading-relaxed max-w-md">
                        Create your account to access enterprise-grade examination tools. Your credentials are protected with industry-leading security standards.
                    </p>
                </div>

                {/* Bottom Security Badges */}
                <div className="relative z-10 space-y-4 pt-8 border-t border-white/10">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-emerald-400 text-xl">verified_user</span>
                        <div>
                            <p className="text-sm font-semibold text-white">SECURE CONNECTION</p>
                            <p className="text-xs text-purple-300">Your session is TLS 1.3 encrypted.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-purple-300 text-xl">key</span>
                        <div>
                            <p className="text-sm font-semibold text-white">PASSWORD PROTECTION</p>
                            <p className="text-xs text-purple-300">Argon2 hashing for maximum security.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-[55%] bg-white dark:bg-[#121212] flex items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    {/* Mobile Back Button */}
                    <Link
                        to="/"
                        className="lg:hidden inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Home
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#0d121b] dark:text-white mb-2">
                            Create Account
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Register for secure platform access.
                        </p>
                    </div>

                    {/* Role Selector */}
                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                            Select Role
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setRole("student")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all border-2 ${role === "student"
                                    ? "bg-primary/5 border-primary text-primary"
                                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">school</span>
                                Student
                                {role === "student" && (
                                    <span className="material-symbols-outlined text-base ml-auto">check_circle</span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("instructor")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all border-2 ${role === "instructor"
                                    ? "bg-primary/5 border-primary text-primary"
                                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">menu_book</span>
                                Instructor
                                {role === "instructor" && (
                                    <span className="material-symbols-outlined text-base ml-auto">check_circle</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                    mail
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@university.edu"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                    lock
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? "visibility" : "visibility_off"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                    lock
                                </span>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showConfirmPassword ? "visibility" : "visibility_off"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        {/* Signup Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-base shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <span className="material-symbols-outlined text-lg">person_add</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                        <span className="text-slate-400 text-xs uppercase tracking-wider">Existing User</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
