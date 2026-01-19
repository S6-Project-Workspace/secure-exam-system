/**
 * Auth Helpers for session management
 */

export const setSession = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
};

export const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Clear cryptographic keys as well for security
    localStorage.removeItem("student_private_key");
    localStorage.removeItem("student_sign_private_key");
};

export const getToken = () => {
    return localStorage.getItem("token");
};

export const getRole = () => {
    return localStorage.getItem("role");
};

export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        return !isExpired;
    } catch (e) {
        return false;
    }
};

/**
 * Perform a fetch with the Authorization header automatically included
 */
export const authFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
        ...options.headers,
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Token expired or invalid
        clearSession();
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
    }

    return response;
};
