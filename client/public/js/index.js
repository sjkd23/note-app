/**
 * index.js
 * Basic home page logic: if user is authenticated, show relevant buttons/links.
 * If not, prompt them to log in or register. Also handles the hamburger menu.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Grab elements from the DOM
    const loginBtn    = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const logoutBtn   = document.getElementById("logout-btn");
    const myNotesBtn  = document.getElementById("my-notes-btn");
    const welcomeMsg  = document.getElementById("welcome-msg");
    const notYouMsg   = document.getElementById("not-you-msg");
    const menuToggle  = document.getElementById("menu-toggle");
    const homeNav     = document.getElementById("home-nav");

    // Check if user is authenticated
    if (checkAuth()) {
        // If authenticated, hide login/register and show logout/notes
        loginBtn.style.display = "none";
        registerBtn.style.display = "none";
        logoutBtn.style.display = "block";
        myNotesBtn.style.display = "block";

        // Show welcome message
        welcomeMsg.style.display = "block";
        notYouMsg.style.display = "block";
        welcomeMsg.innerHTML = `Welcome, ${localStorage.getItem("username")}!`;
    } else {
        // If not authenticated, show login/register, hide logout/notes
        loginBtn.style.display = "block";
        registerBtn.style.display = "block";
        loginBtn.addEventListener("click", goToLogin);
        registerBtn.addEventListener("click", goToRegister);

        logoutBtn.style.display = "none";
        myNotesBtn.style.display = "none";
        welcomeMsg.style.display = "none";
    }

    // Handle logout
    logoutBtn.addEventListener("click", logout);

    // Hamburger menu (for small screens). Toggles the nav’s "active" class
    menuToggle.addEventListener("click", () => {
        notYouMsg.style.display = "none"; 
        homeNav.classList.toggle("active");
    });
});

/**
 * Navigate to login page
 */
function goToLogin() {
    window.location.href = "login.html";
}

/**
 * Navigate to register page
 */
function goToRegister() {
    window.location.href = "register.html";
}

/**
 * Logout the user, remove tokens from local storage
 */
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "login.html";
}
