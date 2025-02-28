/**
 * categories.js
 * Manages creating, listing, and deleting categories (tags).
 */

const CATEGORIES_API_URL = CONFIG.API_URL + "/api/notes/categories";

// This array stores category IDs selected for the current note
let selectedCategories = [];

document.addEventListener("DOMContentLoaded", async () => {
    if (!checkAuth()) {
        window.location.href = "login.html";
        return;
    }

    // Grab elements
    const categoryInput      = document.getElementById("add-category");
    const confirmCategoryBtn = document.getElementById("confirm-category-btn");
    const categorySelect     = document.getElementById("category-select");
    const placeholderText    = "Add Tag";

    // Placeholder logic
    if (!categoryInput.textContent.trim()) {
        categoryInput.textContent = placeholderText;
    }
    categoryInput.addEventListener("click", () => {
        document.execCommand("selectAll", false, null);
    });
    categoryInput.addEventListener("blur", () => {
        if (!categoryInput.textContent.trim()) {
            categoryInput.textContent = placeholderText;
            confirmCategoryBtn.style.display = "none";
        }
    });

    // If user starts typing a new category, show confirm
    categoryInput.addEventListener("input", () => {
        confirmCategoryBtn.style.display = "block";
    });

    // Confirm category button click
    confirmCategoryBtn.addEventListener("click", async () => {
        await addCategory();
        await loadCategories();
        confirmCategoryBtn.style.display = "none";
    });

    // Press Enter to confirm category
    categoryInput.addEventListener("keypress", async (e) => {
        if (categoryInput.textContent === placeholderText) {
            categoryInput.textContent = "";
        }
        if (e.key === "Enter") {
            e.preventDefault();
            await addCategory();
            await loadCategories();
            confirmCategoryBtn.style.display = "none";
        }
    });

    // Refresh categories when the user opens the dropdown
    categorySelect.addEventListener("focus", async () => {
        await loadCategories();
    });

    // When user picks a category from the dropdown, add it to the current note
    categorySelect.addEventListener("change", function () {
        const categoryId = categorySelect.value;
        if (!categoryId) return;

        // The text might look like "Work (3)", so parse out "Work"
        const optionText   = categorySelect.options[categorySelect.selectedIndex].text;
        const bracketIndex = optionText.lastIndexOf("(");
        const categoryName = bracketIndex > 0
            ? optionText.slice(0, bracketIndex).trim()
            : optionText;

        // If not already selected, select it
        if (!selectedCategories.includes(categoryId)) {
            selectedCategories.push(categoryId);
            displayTagChip(categoryId, categoryName);
        }
        categorySelect.value = "";
    });

    // Manage categories button
    const manageCategoriesBtn = document.getElementById("manage-categories-btn");
    manageCategoriesBtn.addEventListener("click", openManageCategoriesPopup);

    // Close manage categories popup
    const closeManageCategoriesPopupBtn = document.getElementById("close-manage-categories-popup");
    closeManageCategoriesPopupBtn.addEventListener("click", closeManageCategoriesPopup);

    // Finally, load categories on page load
    await loadCategories();
});

/**
 * Loads categories from server and populates the dropdown
 */
async function loadCategories() {
    try {
        const response = await fetch(CATEGORIES_API_URL, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (!response.ok) {
            throw new Error("Failed to load categories");
        }

        const { categories } = await response.json();
        const categorySelect = document.getElementById("category-select");
        categorySelect.innerHTML = `<option value="">Add Tags</option>`;

        // For each category, create <option> in the dropdown
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat._id;
            option.textContent = `${cat.name} (${cat.noteCount})`;
            categorySelect.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading tags:", err);
    }
}

/**
 * Create a new category by sending request to server
 */
async function addCategory() {
    const categoryInput = document.getElementById("add-category");
    const newCategoryName = categoryInput.textContent.trim();

    // Basic validations
    if (!newCategoryName || newCategoryName === "Add Tag") {
        alert("Please type a valid tag name.");
        return;
    }
    if (newCategoryName.length >= 24) {
        alert("Tag name must be less than 24 characters.");
        categoryInput.textContent = "Add Tag";
        return;
    }

    try {
        const response = await fetch(CATEGORIES_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ name: newCategoryName })
        });

        const responseData = await response.json();
        if (!response.ok) {
            alert(responseData.error || "Failed to add tag");
            return;
        }

        const { category } = responseData;

        // Reset input
        categoryInput.textContent = "Add Tag";

        // If it's not already selected for this note, add it
        if (!selectedCategories.includes(category._id)) {
            selectedCategories.push(category._id);
            displayTagChip(category._id, category.name);
        }
    } catch (err) {
        console.error("Error creating tag:", err);
        alert("Failed to create tag. Please try again.");
    }
}

/**
 * Display a "tag chip" under the note
 * @param {string} categoryId 
 * @param {string} categoryName 
 */
function displayTagChip(categoryId, categoryName) {
    const selectedTagsContainer = document.getElementById("selected-tags");

    // If chip is already displayed, skip
    if (selectedTagsContainer.querySelector(`.tag[data-id="${categoryId}"]`)) {
        return;
    }

    // Create a span for the tag
    const chip = document.createElement("span");
    chip.classList.add("tag");
    chip.dataset.id = categoryId;
    chip.textContent = categoryName;

    // Create a remove button
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-tag");
    removeBtn.textContent = "x";
    removeBtn.onclick = () => {
        // Remove from selectedCategories and from UI
        selectedCategories = selectedCategories.filter(id => id !== categoryId);
        chip.remove();
    };

    chip.appendChild(removeBtn);
    selectedTagsContainer.appendChild(chip);
}

/**
 * After opening a note, show existing categories as chips
 * @param {Array<string>} categoryIds 
 */
function displayExistingTags(categoryIds) {
    const selectedTagsContainer = document.getElementById("selected-tags");
    selectedTagsContainer.innerHTML = "";
    selectedCategories = categoryIds.slice(); // Copy

    categoryIds.forEach(async (catId) => {
        try {
            const catRes = await fetch(`${CATEGORIES_API_URL}/${catId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (!catRes.ok) return;
            const { category } = await catRes.json();
            if (!category) return;

            // Create the chip in the UI
            displayTagChip(catId, category.name);
        } catch (error) {
            console.error("Failed to load tag name:", error);
        }
    });
}

/**
 * Opens the Manage Categories popup, listing all categories with note counts.
 */
async function openManageCategoriesPopup() {
    try {
        const response = await fetch(CATEGORIES_API_URL, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (!response.ok) throw new Error("Failed to fetch categories");

        const { categories } = await response.json();

        // Grab the popup + the list container
        const popup = document.getElementById("manage-categories-popup");
        const list  = document.getElementById("manage-categories-list");
        list.innerHTML = ""; // Clear old items

        // For each category, display it with a Delete button
        categories.forEach(cat => {
            const li = document.createElement("li");
            li.textContent = `${cat.name} (${cat.noteCount || 0})`;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.style.marginLeft = "1rem";

            // Hook up the delete function
            deleteBtn.addEventListener("click", () => {
                deleteCategory(cat._id, li);
            });

            li.appendChild(deleteBtn);
            list.appendChild(li);
        });

        // Show the popup
        popup.style.display = "block";
    } catch (error) {
        console.error("Error loading categories:", error);
        alert("Could not load categories. Please try again.");
    }
}

/**
 * Closes the Manage Categories popup
 */
function closeManageCategoriesPopup() {
    const popup = document.getElementById("manage-categories-popup");
    popup.style.display = "none";
}

/**
 * Delete the given category from server, remove from UI
 * @param {string} categoryId 
 * @param {HTMLElement} liElement 
 */
async function deleteCategory(categoryId, liElement) {
    const confirmDelete = confirm("Are you sure you want to delete this tag?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${CATEGORIES_API_URL}/${categoryId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (!response.ok) throw new Error("Failed to delete tag");

        // Remove from popup list
        liElement.remove();

        // Remove from selected categories
        selectedCategories = selectedCategories.filter(id => id !== categoryId);

        // Remove the chip from the UI if present
        const tagElement = document.querySelector(`.tag[data-id="${categoryId}"]`);
        if (tagElement) {
            tagElement.remove();
        }
    } catch (error) {
        console.error("Error deleting tag:", error);
        alert("Failed to delete tag.");
    }
}
