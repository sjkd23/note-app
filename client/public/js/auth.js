/**
 * auth.js
 * Common auth helper functions (checkAuth, logout) and constants for Auth API URL.
 */

const AUTH_API_URL = CONFIG.API_URL + "/api/auth";

/**
 * Checks if the user is currently authenticated by verifying the token in localStorage.
 * @returns {object|null} The token payload if valid, or null if invalid/expired.
 */
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }

    try {
        // Decode token payload
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
            console.warn("Token expired. Logging out...");
            logout();
            return null;
        }

        return payload; 
    } catch (error) {
        console.error("Invalid token format");
        logout(); 
        return null;
    }
}

/**
 * Logs the user out by removing tokens and returning to login page.
 */
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "login.html";
    console.log("User logged out.");
}
