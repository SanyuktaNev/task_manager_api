
const API_BASE = "http://127.0.0.1:5000/api/v1";
const isDashboard = window.location.pathname.includes("dashboard");


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

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;

    try {
      const res = await fetch(
        `${API_BASE}/auth/${isLogin ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 🔐 cookie support
          body: JSON.stringify(
            isLogin
              ? { username, password }
              : { username, password, email }
          ),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error");

      if (isLogin) {
        window.location.href = "dashboard.html";
      } else {
        alert("Registered successfully! Please login.");
        toggleLink.click();
      }
    } catch (err) {
      errorMsg.textContent = err.message;
    }
  });
}


else {
  const tasksContainer = document.getElementById("tasks-container");
  const taskForm = document.getElementById("task-form");
  const logoutBtn = document.getElementById("logout-btn");
  const roleBadge = document.getElementById("role-badge");

  
async function loadUserInfo() {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/v1/auth/me", {
        credentials: "include" 
      });
      const data = await res.json();
      const roleBadge = document.getElementById("role-badge");
      roleBadge.textContent = data.role.toUpperCase();
      window.userRole = data.role; 
    } catch (err) {
      console.error(err);
      window.location.href = "index.html";
    }
  }
  
  async function fetchTasks() {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/v1/tasks/", {
        credentials: "include" 
      });
      const tasks = await res.json();
  
      const container = document.getElementById("tasks-container");
      container.innerHTML = "";
  
      tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.innerHTML = `
          <div>
            <h3>${task.title}</h3>
            <p>${task.description || ""}</p>
            <p class="owner">Owner: ${task.user_id}${window.userRole==="admin"?" (Admin)":""}</p>
          </div>
          ${window.userRole==="admin" || task.user_id==task.user_id ? `<button data-id="${task.id}">Delete</button>` : ""}
        `;
        const btn = card.querySelector("button");
        if (btn) btn.addEventListener("click", () => deleteTask(task.id));
        container.appendChild(card);
      });
    } catch (err) {
      console.error(err);
    }
  }
  
  async function deleteTask(id) {
    if (!confirm("Are you sure?")) return;
    await fetch(`http://127.0.0.1:5000/api/v1/tasks/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    fetchTasks();
  }
  
  async function initDashboard() {
    await loadUserInfo();
    fetchTasks();
  
    document.getElementById("logout-btn").addEventListener("click", async () => {
      await fetch("http://127.0.0.1:5000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      window.location.href = "index.html";
    });
  
    document.getElementById("task-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("task-title").value;
      const desc = document.getElementById("task-desc").value;
  
      if (!title.trim()) return;
  
      await fetch("http://127.0.0.1:5000/api/v1/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description: desc })
      });
  
      document.getElementById("task-form").reset();
      fetchTasks();
    });
  }
  
  initDashboard();
}  