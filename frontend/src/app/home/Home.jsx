import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/95 backdrop-blur-sm px-4 lg:px-10 py-4">
        <div className="layout-container flex max-w-[1200px] mx-auto items-center justify-between whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl font-light">lock</span>
            </div>
            <h2 className="text-[#0d121b] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">SecureExam</h2>
          </div>
          <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
            <div className="flex gap-4 items-center">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 group"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {/* Sun Icon */}
                <span
                  className={`material-symbols-outlined text-xl absolute transition-all duration-300 ${isDarkMode
                    ? 'opacity-0 rotate-90 scale-0'
                    : 'opacity-100 rotate-0 scale-100 text-amber-500'
                    }`}
                >
                  light_mode
                </span>
                {/* Moon Icon */}
                <span
                  className={`material-symbols-outlined text-xl absolute transition-all duration-300 ${isDarkMode
                    ? 'opacity-100 rotate-0 scale-100 text-blue-400'
                    : 'opacity-0 -rotate-90 scale-0'
                    }`}
                >
                  dark_mode
                </span>
              </button>
              <Link to="/login" className="flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 bg-transparent text-[#0d121b] dark:text-white text-sm font-semibold hover:text-primary transition-colors">
                <span>Sign In</span>
              </Link>
              <Link to="/signup" className="flex cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-dark transition-colors">
                <span>Get Started</span>
              </Link>
            </div>
          </div>
          <div className="md:hidden text-[#0d121b] dark:text-white">
            <span className="material-symbols-outlined">menu</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center pt-16 pb-12 px-4 lg:px-10">
          <div className="max-w-[1000px] text-center flex flex-col items-center gap-8">
            <h1 className="text-[#111827] dark:text-white text-5xl md:text-6xl lg:text-[4rem] font-bold leading-[1.3] tracking-tight">
              Enterprise-Grade Secure <br className="hidden md:block" /> Online Examinations
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl font-normal leading-[1.8] max-w-[700px] mx-auto">
              Cryptography-aware examination platform with real-time integrity monitoring, secure authentication, and comprehensive audit trails for educational institutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Link to="/signup" className="group flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary text-slate-900 dark:text-white text-base font-bold transition-colors hover:bg-primary-dark shadow-md">
                <span>Start Free Trial</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <button className="flex items-center justify-center rounded-lg h-12 px-8 bg-white border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-base font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span>View Demo</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="w-full max-w-[1200px] px-4 lg:px-10 py-12 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="size-12 flex items-center justify-start text-primary">
                <span className="material-symbols-outlined text-5xl font-light">lock_open</span>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-[#111827] dark:text-white text-xl font-bold">End-to-End Encrypted</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  All exam data encrypted with military-grade cryptography ensuring complete data privacy.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="size-12 flex items-center justify-start text-primary">
                <span className="material-symbols-outlined text-5xl font-light">analytics</span>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-[#111827] dark:text-white text-xl font-bold">Real-Time Monitoring</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Live integrity verification, suspicious activity detection, and comprehensive audit logging.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="size-12 flex items-center justify-start text-primary">
                <span className="material-symbols-outlined text-5xl font-light">group</span>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-[#111827] dark:text-white text-xl font-bold">Role-Based Access</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Granular permission controls for students, instructors, and administrators with activity tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="w-full bg-white dark:bg-slate-900 py-16 lg:py-24 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-10">
            <div className="text-center mb-16">
              <h2 className="text-[#0d121b] dark:text-white text-3xl md:text-4xl font-bold leading-tight tracking-[-0.033em] mb-4">Steps to use</h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg">Streamline your examination process in three simple steps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="flex flex-col items-center text-center gap-6 relative z-10">
                <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="material-symbols-outlined text-3xl">app_registration</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[#0d121b] dark:text-white text-xl font-bold">1. Sign Up &amp; Configure</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                    Register your institution, invite faculty, and set up your customized exam environment and security parameters.
                  </p>
                </div>
              </div>
              <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-slate-200 dark:bg-slate-700 z-0 w-2/3 mx-auto"></div>
              <div className="flex flex-col items-center text-center gap-6 relative z-10">
                <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-primary text-primary flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-3xl">edit_document</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[#0d121b] dark:text-white text-xl font-bold">2. Create Assessment</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                    Build questions, define proctoring rules, assign roles, and schedule the exam for your students.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-6 relative z-10">
                <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="material-symbols-outlined text-3xl">checklist</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[#0d121b] dark:text-white text-xl font-bold">3. Monitor &amp; Grade</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                    Watch real-time proctoring feeds, get automated integrity reports, and release graded results instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>


      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] py-12">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#0d121b] dark:text-white">
              <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
              <span className="font-bold text-lg">SecureExam</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              The leading platform for secure, AI-powered online assessments.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#0d121b] dark:text-white">Product</h4>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">Features</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">Security</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">Integrations</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">Pricing</a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#0d121b] dark:text-white">Resources</h4>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">Documentation</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">API Reference</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">Community</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">Blog</a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#0d121b] dark:text-white">Company</h4>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">About</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">Careers</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">Legal</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors" href="#">Contact</a>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 lg:px-10 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">© 2024 SecureExam Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a className="text-slate-400 hover:text-primary" href="#"><span className="material-symbols-outlined text-lg">public</span></a>
            <a className="text-slate-400 hover:text-primary" href="#"><span className="material-symbols-outlined text-lg">mail</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
