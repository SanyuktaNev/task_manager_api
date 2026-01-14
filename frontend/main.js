// -------------------- CONFIG --------------------
const API_BASE = "http://localhost:5000/api/v1";  // ← CHANGED from 127.0.0.1 to localhost
const isDashboard = window.location.pathname.includes("dashboard");

// -------------------- AUTH (LOGIN / REGISTER) --------------------
if (!isDashboard) {
  const formTitle = document.getElementById("form-title");
  const authForm = document.getElementById("auth-form");
  const toggleLink = document.getElementById("toggle-link");
  const errorMsg = document.getElementById("error-msg");
  const emailInput = document.getElementById("email");
  const submitBtn = document.getElementById("submit-btn");

  let isLogin = true;

  toggleLink.addEventListener("click", () => {
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? "Login" : "Register";
    submitBtn.textContent = isLogin ? "Login" : "Register";
    emailInput.style.display = isLogin ? "none" : "block";
    errorMsg.textContent = "";
  });

  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!username || !password || (!isLogin && !email)) {
      errorMsg.textContent = "Please fill all required fields.";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Good - keeps cookies
        body: JSON.stringify(
          isLogin
            ? { username, password }
            : { username, password, email }
        )
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error");

      if (isLogin) {
        // redirect to dashboard
        window.location.href = "dashboard.html";
      } else {
        alert("Registered successfully! Please login.");
        toggleLink.click(); // switch to login
      }
    } catch (err) {
      errorMsg.textContent = err.message;
    }
  });
}

// -------------------- DASHBOARD --------------------
else {
  const tasksContainer = document.getElementById("tasks-container");
  const taskForm = document.getElementById("task-form");
  const logoutBtn = document.getElementById("logout-btn");
  const roleBadge = document.getElementById("role-badge");

  window.userRole = "user"; // default
  window.userId = null; // ← ADDED to store user ID

  // Load current user info
  async function loadUserInfo() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      const data = await res.json();
      window.userRole = data.role || "user";
      window.userId = data.user_id; // ← ADDED to store user ID
      roleBadge.textContent = window.userRole.toUpperCase();
    } catch (err) {
      console.error(err);
      window.location.href = "index.html"; // redirect if not logged in
    }
  }

  // Fetch tasks
  async function fetchTasks() {
    try {
      const res = await fetch(`${API_BASE}/tasks/`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const tasks = await res.json();
      tasksContainer.innerHTML = "";

      tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.innerHTML = `
          <div>
            <h3>${task.title}</h3>
            <p>${task.description || ""}</p>
            <p class="owner">Owner: ${task.user_id}${window.userRole === "admin" ? " (Admin)" : ""}</p>
          </div>
          ${
            window.userRole === "admin" || task.user_id == window.userId
              ? `<button data-id="${task.id}">Delete</button>` 
              : ""
          }
        `;
        const btn = card.querySelector("button");
        if (btn) btn.addEventListener("click", () => deleteTask(task.id));
        tasksContainer.appendChild(card);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Delete task
  async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete task");
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Error deleting task");
    }
  }

  // Logout
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
    }
  });

  // Create new task
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("task-title").value.trim();
    const desc = document.getElementById("task-desc").value.trim();
    if (!title) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description: desc })
      });
      if (!res.ok) throw new Error("Failed to add task");
      taskForm.reset();
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  });

  // Initialize dashboard
  async function initDashboard() {
    await loadUserInfo();
    fetchTasks();
  }

  initDashboard();
}