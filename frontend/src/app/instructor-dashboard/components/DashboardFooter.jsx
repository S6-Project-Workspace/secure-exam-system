import React from "react";

export default function DashboardFooter() {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-auto py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">© 2024 SecureExam University Portal. All rights reserved.</p>
                <div className="flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <a className="hover:text-blue-900 dark:hover:text-blue-400 transition-colors" href="#">Privacy Policy</a>
                    <a className="hover:text-blue-900 dark:hover:text-blue-400 transition-colors" href="#">Help Desk</a>
                    <a className="hover:text-blue-900 dark:hover:text-blue-400 transition-colors" href="#">System Requirements</a>
                </div>
            </div>
        </footer>
    );
}
