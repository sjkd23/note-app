/**
 * register.js
 * Handles user registration form, calls backend /auth/register endpoint.
 */
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Gather user input
        const username = document.getElementById("register-username").value.trim();
        const email    = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();

        // Simple check on username length
        if (username.length > 15 || username.length < 3) {
            alert("Username must be between 3 and 15 characters long.");
            return;
        }

        // Attempt to register
        const success = await register(username, email, password);
        if (success) {
            // If registration OK, go to login page
            window.location.href = "login.html";
        }
    });
});

/**
 * register function that calls the backend
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns {boolean} true if success, false if error
 */
async function register(username, email, password) {
    try {
        const response = await fetch(`${AUTH_API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            // If server responded with error, show it
            alert(data.error || "Registration failed. Please try again.");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error during registration:", error);
        alert("An unexpected error occurred. Please try again.");
        return false;
    }
}
