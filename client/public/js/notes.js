/**
 * notes.js
 * Manages the notes page:
 *  - Handling new note creation
 *  - Loading existing notes
 *  - Saving, deleting, cloning notes
 *  - Toggling the header and hamburger menu
 */

const NOTES_API_URL = "http://localhost:5000/api/notes"; 
let activeNoteId = null; // Currently opened note _id

document.addEventListener("DOMContentLoaded", () => {
  // If not authenticated, redirect to login
  if (!checkAuth()) {
    window.location.href = "login.html";
    return;
  }

  // Setup event listeners for main buttons
  document.getElementById("home-btn").addEventListener("click", goHome);
  document.getElementById("new-note-btn").addEventListener("click", createNewNote);
  document.getElementById("logout-btn").addEventListener("click", logout);
  document.getElementById("save-note-btn").addEventListener("click", saveCurrentNote);
  document.getElementById("delete-note-btn").addEventListener("click", deleteCurrentNote);
  document.getElementById("clone-note-btn").addEventListener("click", cloneCurrentNote);
  document.getElementById("view-all-notes-btn").addEventListener("click", showNotesPopup);
  document.getElementById("close-popup-btn").addEventListener("click", closeNotesPopup);

  // Hamburger menu toggle for small screens
  const menuToggle = document.getElementById("menu-toggle");
  const notesNav   = document.getElementById("notes-nav");
  menuToggle.addEventListener("click", () => {
    notesNav.classList.toggle("active");
  });

  // Hide/Show header arrow logic
  const header        = document.querySelector("header");
  const downArrowBtn  = document.getElementById("header-hide-btn"); // "▲" arrow
  const upArrowBtn    = document.getElementById("header-show-btn"); // "▼" arrow

  // Collapse the header (▲ hides it)
  downArrowBtn.addEventListener("click", () => {
    header.classList.add("collapsed");
    downArrowBtn.style.display = "none";
    upArrowBtn.style.display   = "inline-block";
  });

  // Expand the header (▼ shows it)
  upArrowBtn.addEventListener("click", () => {
    header.classList.remove("collapsed");
    downArrowBtn.style.display = "inline-block";
    upArrowBtn.style.display   = "none";
  });

  // Handle placeholder logic for note title
  const noteTitle       = document.getElementById("note-title");
  const placeholderText = "Untitled Note";

  // If the noteTitle is empty, show placeholder
  if (!noteTitle.textContent.trim()) {
    noteTitle.textContent = placeholderText;
  }

  // If user leaves title blank, revert to placeholder
  noteTitle.addEventListener("blur", function () {
    if (!this.textContent.trim()) {
      this.textContent = placeholderText;
    }
  });

  // Clicking noteTitle selects all text
  noteTitle.addEventListener("click", () => {
    document.execCommand("selectAll", false, null);
  });

  // Pressing Enter in title moves focus to the note-editor
  noteTitle.addEventListener("keypress", (e) => {
    if (noteTitle.textContent === placeholderText) {
      noteTitle.textContent = "";
    }
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("note-editor").focus();
    }
  });

  // Create a new blank note on initial load
  createNewNote();
});

/**
 * Go back to home page
 */
function goHome() {
  window.location.href = "index.html";
}

/**
 * Creates a fresh blank note in the UI (does not save to server yet)
 */
function createNewNote() {
  // Clear the editor & set title
  document.getElementById("note-editor").value = "";
  document.getElementById("note-title").textContent = "Untitled Note";
  document.getElementById("delete-note-btn").style.display = "none";
  activeNoteId = null;

  // Clear the selected categories
  const selectedTagsContainer = document.getElementById("selected-tags");
  selectedTagsContainer.innerHTML = "";
  selectedCategories = []; // from categories.js

  document.getElementById("clone-note-btn").style.display = "none";
}

/**
 * Load all notes for the user, then populate the notes popup
 */
async function loadNotes() {
  try {
    const response = await fetch(NOTES_API_URL, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!response.ok) throw new Error("Failed to load notes");

    const data = await response.json();
    const notesContainer = document.getElementById("notes-container");
    notesContainer.innerHTML = "";

    if (data.notes.length === 0) {
      // If no notes exist, show a message
      const noNotesMessage = document.createElement("p");
      noNotesMessage.textContent = "No notes yet!";
      noNotesMessage.style.fontSize = "18px";
      noNotesMessage.style.color = "gray";
      noNotesMessage.style.textAlign = "center";
      notesContainer.appendChild(noNotesMessage);
      return;
    }

    // For each note, create a "card" with title & preview
    data.notes.forEach(note => {
      const noteCard = document.createElement("div");
      noteCard.classList.add("note-card");

      const noteTitleEl = document.createElement("h3");
      noteTitleEl.textContent = note.title || "Untitled Note";

      const notePreview = document.createElement("p");
      notePreview.textContent = 
        note.content.length > 100
          ? note.content.slice(0, 100) + "..."
          : note.content;

      noteCard.appendChild(noteTitleEl);
      noteCard.appendChild(notePreview);

      // Clicking on a note in the popup -> open that note
      noteCard.addEventListener("click", () => {
        openNote(note._id);
        closeNotesPopup();
      });

      notesContainer.appendChild(noteCard);
    });
  } catch (error) {
    console.error("Error loading notes:", error);
  }
}

/**
 * Show the notes popup
 */
function showNotesPopup() {
  loadNotes();
  const notesPopup = document.getElementById("notes-popup");
  notesPopup.style.display = "block";
}

/**
 * Close the notes popup
 */
function closeNotesPopup() {
  const notesPopup = document.getElementById("notes-popup");
  notesPopup.style.display = "none";
}

/**
 * Open a specific note by ID (fetch it from the server and display in editor)
 * @param {string} noteId 
 */
async function openNote(noteId) {
  try {
    const response = await fetch(`${NOTES_API_URL}/${noteId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!response.ok) throw new Error("Failed to load note");

    const { note } = await response.json();

    // Fill editor with existing note data
    document.getElementById("note-editor").value = note.content;
    document.getElementById("note-title").textContent = note.title || "Untitled Note";
    document.getElementById("delete-note-btn").style.display = "block";
    document.getElementById("clone-note-btn").style.display = "block";

    activeNoteId = note._id;

    // Update categories
    selectedCategories = note.categories || [];
    displayExistingTags(selectedCategories);
  } catch (error) {
    console.error("Error opening note:", error);
  }
}

/**
 * Save the current note to the server 
 * (Create new if no activeNoteId, otherwise update existing)
 */
async function saveCurrentNote() {
  const content   = document.getElementById("note-editor").value;
  const noteTitle = document.getElementById("note-title").textContent;

  // Disallow saving empty note
  if (!content.trim()) {
    alert("Cannot save an empty note!");
    return;
  }

  // If no activeNoteId, create a new note
  if (!activeNoteId) {
    try {
      const response = await fetch(NOTES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: noteTitle,
          content,
          categories: selectedCategories
        })
      });
      if (!response.ok) throw new Error("Failed to create note");

      const { note } = await response.json();
      activeNoteId = note._id;

      // If the server adjusted the title, show the final version
      if (noteTitle !== note.title) {
        document.getElementById("note-title").textContent = note.title;
      }

      document.getElementById("delete-note-btn").style.display = "block";
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Failed to create note.");
    }
  } else {
    // Update existing note
    try {
      const response = await fetch(`${NOTES_API_URL}/${activeNoteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: noteTitle,
          content,
          categories: selectedCategories
        })
      });
      if (!response.ok) throw new Error("Failed to update note");

      const { updatedNote } = await response.json();
      if (noteTitle !== updatedNote.title) {
        document.getElementById("note-title").textContent = updatedNote.title;
      }
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note.");
    }
  }

  // Ensure clone button is visible now that note is saved
  document.getElementById("clone-note-btn").style.display = "block";

  // Refresh categories to see updated note counts
  await loadCategories();
}

/**
 * Delete the currently active note
 */
async function deleteCurrentNote() {
  if (!activeNoteId) return;
  if (!confirm("Are you sure you want to delete this note?")) {
    return;
  }

  try {
    const response = await fetch(`${NOTES_API_URL}/${activeNoteId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!response.ok) throw new Error("Failed to delete note");

    // After deletion, show blank new note
    createNewNote();
  } catch (error) {
    console.error("Error deleting note:", error);
    alert("Failed to delete note.");
  }
}

/**
 * Clone the currently active note, including categories
 */
async function cloneCurrentNote() {
  if (!activeNoteId) {
    alert("No note selected to clone.");
    return;
  }

  // First, save the current note (so all changes are up to date)
  await saveCurrentNote();

  // Gather info from editor
  const originalTitle   = document.getElementById("note-title").textContent;
  const originalContent = document.getElementById("note-editor").value;
  const originalCategories = [...selectedCategories];

  try {
    // Create new note with same title, content, and categories
    const response = await fetch(NOTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        title: originalTitle,
        content: originalContent,
        categories: originalCategories
      })
    });

    if (!response.ok) throw new Error("Failed to create cloned note");

    const { note } = await response.json();

    // Open the newly created cloned note in the editor
    openNote(note._id);
    alert("Note cloned successfully!");
  } catch (error) {
    console.error("Error cloning note:", error);
    alert("Failed to clone note.");
  }
}
