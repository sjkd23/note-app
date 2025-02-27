/**
 * login.js
 * Handles the login form submission and calls the backend /auth/login endpoint.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Grab the login form
    const loginForm = document.getElementById("login-form");

    // Handle form submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Extract user input
        const email    = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Attempt login
        const success = await login(email, password);
        if (success) {
            // If login OK, go to notes
            window.location.href = "notes.html";
        } else {
            alert("Login failed. Please check your credentials.");
        }
    });
});

/**
 * Send login request to the auth API
 * @param {string} email 
 * @param {string} password 
 * @returns {boolean} true if login succeeded, false otherwise
 */
async function login(email, password) {
    try {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        // Parse the JSON response
        const data = await response.json();

        if (!response.ok) {
            // e.g. 401 or 404 from server
            return false;
        }

        // On success, store token + username in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        return true;
    } catch (error) {
        console.error("Error during login:", error);
        alert("An unexpected error occurred. Please try again.");
        return false;
    }
}
