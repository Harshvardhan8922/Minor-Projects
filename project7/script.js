// ===========================
//  TaskMate - To-Do List App
//  script.js
// ===========================

// ── App State ──
let tasks = [
  { id: 1, text: "Buy groceries from the market", priority: "medium", done: false },
  { id: 2, text: "Complete the project report", priority: "high", done: false },
  { id: 3, text: "Call mom and wish her happy birthday", priority: "high", done: false },
  { id: 4, text: "Go for a 30-minute walk", priority: "low", done: true }
];

let nextId = 5;
let currentFilter = "all";
let currentPriority = "low";
let searchQuery = "";

// ── Grab Elements ──
const taskInput    = document.getElementById("task-input");
const addBtn       = document.getElementById("add-btn");
const taskList     = document.getElementById("task-list");
const clearBtn     = document.getElementById("clear-btn");
const searchInput  = document.getElementById("search-input");
const toast        = document.getElementById("toast");
const datetimeEl   = document.getElementById("datetime");

// Stats
const totalCount   = document.getElementById("total-count");
const activeCount  = document.getElementById("active-count");
const doneCount    = document.getElementById("done-count");
const footerCount  = document.getElementById("footer-count");

// ───────────────────────────
//  DATE & TIME
// ───────────────────────────
function updateDateTime() {
  const now = new Date();
  const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
  const dateStr = now.toLocaleDateString("en-IN", options);
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  datetimeEl.textContent = dateStr + "  |  " + timeStr;
}

// Update every second
updateDateTime();
setInterval(updateDateTime, 1000);

// ───────────────────────────
//  PRIORITY BUTTONS
// ───────────────────────────
const priorityBtns = document.querySelectorAll(".priority-btn");

priorityBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    // Remove active from all
    priorityBtns.forEach(function (b) {
      b.classList.remove("active");
    });
    // Set active on clicked one
    btn.classList.add("active");
    currentPriority = btn.dataset.priority;
  });
});

// ───────────────────────────
//  FILTER BUTTONS
// ───────────────────────────
const filterBtns = document.querySelectorAll(".filter-btn");

filterBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    filterBtns.forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ───────────────────────────
//  SEARCH
// ───────────────────────────
searchInput.addEventListener("input", function () {
  searchQuery = searchInput.value.toLowerCase().trim();
  renderTasks();
});

// ───────────────────────────
//  ADD TASK
// ───────────────────────────
addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

function addTask() {
  var text = taskInput.value.trim();

  // Check if input is empty
  if (text === "") {
    showToast("Please type a task first!");
    taskInput.focus();
    return;
  }

  // Create a new task object
  var newTask = {
    id: nextId,
    text: text,
    priority: currentPriority,
    done: false
  };

  nextId++;

  // Add to beginning of tasks array
  tasks.unshift(newTask);

  // Clear input
  taskInput.value = "";
  taskInput.focus();

  // Re-render
  renderTasks();

  showToast("Task added successfully!");
}

// ───────────────────────────
//  DELETE TASK
// ───────────────────────────
function deleteTask(id) {
  // Filter out the task with this id
  tasks = tasks.filter(function (t) {
    return t.id !== id;
  });

  renderTasks();
  showToast("Task deleted.");
}

// ───────────────────────────
//  TOGGLE DONE
// ───────────────────────────
function toggleDone(id) {
  // Find the task and flip done value
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].done = !tasks[i].done;
      break;
    }
  }

  renderTasks();
}

// ───────────────────────────
//  CLEAR COMPLETED
// ───────────────────────────
clearBtn.addEventListener("click", function () {
  var completed = tasks.filter(function (t) { return t.done; });

  if (completed.length === 0) {
    showToast("No completed tasks to clear.");
    return;
  }

  tasks = tasks.filter(function (t) {
    return !t.done;
  });

  renderTasks();
  showToast("Completed tasks cleared!");
});

// ───────────────────────────
//  ESCAPE HTML (Safety)
// ───────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ───────────────────────────
//  GET BADGE CLASS
// ───────────────────────────
function getBadgeClass(priority) {
  if (priority === "high")   return "badge-high";
  if (priority === "medium") return "badge-medium";
  return "badge-low";
}

// ───────────────────────────
//  UPDATE STATS
// ───────────────────────────
function updateStats() {
  var total  = tasks.length;
  var done   = tasks.filter(function (t) { return t.done; }).length;
  var active = total - done;

  totalCount.textContent  = total;
  activeCount.textContent = active;
  doneCount.textContent   = done;
  footerCount.textContent = active + " task" + (active !== 1 ? "s" : "") + " remaining";
}

// ───────────────────────────
//  RENDER TASKS
// ───────────────────────────
function renderTasks() {
  // Update stats
  updateStats();

  // Step 1: Filter by tab
  var filtered = tasks.filter(function (t) {
    if (currentFilter === "done")   return t.done;
    if (currentFilter === "active") return !t.done;
    return true; // "all"
  });

  // Step 2: Filter by search
  if (searchQuery !== "") {
    filtered = filtered.filter(function (t) {
      return t.text.toLowerCase().indexOf(searchQuery) !== -1;
    });
  }

  // Step 3: Build HTML
  if (filtered.length === 0) {
    taskList.innerHTML =
      '<div class="empty-state">' +
        '<span class="empty-icon">📋</span>' +
        "<p>No tasks found here!</p>" +
      "</div>";
    return;
  }

  var html = "";

  for (var i = 0; i < filtered.length; i++) {
    var t = filtered[i];
    var badgeClass = getBadgeClass(t.priority);
    var capitalPriority = t.priority.charAt(0).toUpperCase() + t.priority.slice(1);

    html +=
      '<div class="task-card ' + (t.done ? "done" : "") + '">' +
        '<input' +
          ' type="checkbox"' +
          ' class="task-checkbox"' +
          (t.done ? " checked" : "") +
          ' onchange="toggleDone(' + t.id + ')"' +
        "/>" +
        '<div class="task-body">' +
          '<span class="task-text">' + escapeHtml(t.text) + "</span>" +
          '<span class="priority-badge ' + badgeClass + '">' + capitalPriority + " Priority</span>" +
        "</div>" +
        '<button class="del-btn" onclick="deleteTask(' + t.id + ')" title="Delete Task">&#x2715;</button>' +
      "</div>";
  }

  taskList.innerHTML = html;
}

// ───────────────────────────
//  TOAST NOTIFICATION
// ───────────────────────────
var toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  // Clear any existing timer
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  // Hide after 2.5 seconds
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2500);
}

// ───────────────────────────
//  FIRST RENDER
// ───────────────────────────
renderTasks();
