// Detect page
const isDashboard = window.location.pathname.includes("dashboard");

if (!isDashboard) {
  // -------- Login/Register logic --------
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
        `http://127.0.0.1:5000/api/v1/auth/${isLogin ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isLogin ? { username, password } : { username, password, email })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error");

      if (isLogin) {
        localStorage.setItem("token", data.access_token);
        window.location.href = "dashboard.html";
      } else {
        alert("Registered successfully! Please login.");
        toggleLink.click(); // switch to login
      }
    } catch (err) {
      errorMsg.textContent = err.message;
    }
  });
} else {
  // -------- Dashboard logic --------
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
  }

  const tasksContainer = document.getElementById("tasks-container");
  const taskForm = document.getElementById("task-form");
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  async function fetchTasks() {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/v1/tasks/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tasks = await res.json();
      tasksContainer.innerHTML = "";
      tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.innerHTML = `
          <div>
            <h3>${task.title}</h3>
            <p>${task.description || ""}</p>
          </div>
          <button data-id="${task.id}">Delete</button>
        `;
        card.querySelector("button").addEventListener("click", () => deleteTask(task.id));
        tasksContainer.appendChild(card);
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await fetch(`http://127.0.0.1:5000/api/v1/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTasks();
  }

  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-desc").value;

    if (!title.trim()) return;

    await fetch("http://127.0.0.1:5000/api/v1/tasks/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description })
    });

    taskForm.reset();
    fetchTasks();
  });

  fetchTasks();
}

