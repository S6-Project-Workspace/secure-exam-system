import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getRole } from "./app/auth/authHelpers";

/**
 * A wrapper component for protected routes.
 * It checks if the user is authenticated and if they have the required role.
 * 
 * @param {string} allowedRole - The role allowed to access this route ("student" or "instructor")
 */
const ProtectedRoute = ({ allowedRole }) => {
    const isAuth = isAuthenticated();
    const role = getRole();

    if (!isAuth) {
        // Not authenticated, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && role !== allowedRole) {
        // Role mismatch, redirect to respective dashboard
        const redirectPath = role === "instructor" ? "/instructor/publish" : "/student/dashboard";
        return <Navigate to={redirectPath} replace />;
    }

    // Authenticated and role matches, render the matched child route
    return <Outlet />;
};

export default ProtectedRoute;
