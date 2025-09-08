
const registerUrl = "https://eirtqyx21c.execute-api.eu-north-1.amazonaws.com/dev/register";
const loginUrl = "https://wx1x4tenll.execute-api.eu-north-1.amazonaws.com/dev/login";

// Elements
const loginBtn = document.getElementById("login-btn") as HTMLButtonElement;
const registerBtn = document.getElementById("register-btn") as HTMLButtonElement;
const logoutBtn = document.getElementById("logout-btn") as HTMLButtonElement;

const loginMsg = document.getElementById("login-msg") as HTMLParagraphElement;
const registerMsg = document.getElementById("register-msg") as HTMLParagraphElement;
const welcomeMsg = document.getElementById("welcome-msg") as HTMLParagraphElement;

const tabs = document.querySelector(".tabs") as HTMLDivElement;
const contents = document.querySelectorAll<HTMLElement>(".tab-content");
const tabButtons = document.querySelectorAll<HTMLButtonElement>(".tab-btn");

// Tab switching logic
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // remove active from all
    tabButtons.forEach((b) => b.classList.remove("active"));
    contents.forEach((c) => c.classList.remove("active"));

    // activate clicked tab + its content
    btn.classList.add("active");
    const tabId = btn.getAttribute("data-tab")!;
    document.getElementById(tabId)!.classList.add("active");
  });
});

// Show dashboard
function showDashboard(email: string): void {
  tabs.style.display = "none"; // hide tabs
  contents.forEach((c) => c.classList.remove("active"));
  document.getElementById("dashboard")!.classList.add("active");
  welcomeMsg.textContent = `Hello, ${email}`;
}

// Show login/register
function showAuth(): void {
  tabs.style.display = "flex"; // show tabs again
  contents.forEach((c) => c.classList.remove("active"));
  document.getElementById("login")!.classList.add("active");
  tabButtons.forEach((b) => b.classList.remove("active"));
  tabButtons[0].classList.add("active"); // set Login active
}

// Register
registerBtn.addEventListener("click", async () => {
  const email = (document.getElementById("register-username") as HTMLInputElement).value;
  const password = (document.getElementById("register-password") as HTMLInputElement).value;

  try {
    const res = await fetch(registerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data: { message: string } = await res.json();
    registerMsg.textContent = data.message;
    registerMsg.style.color = res.ok ? "lightgreen" : "red";
  } catch {
    registerMsg.textContent = "Error connecting to server.";
    registerMsg.style.color = "red";
  }
});

// Login
loginBtn.addEventListener("click", async () => {
  const email = (document.getElementById("login-username") as HTMLInputElement).value;
  const password = (document.getElementById("login-password") as HTMLInputElement).value;

  try {
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data: { message: string; token?: string } = await res.json();
    loginMsg.textContent = data.message;

    if (res.ok && data.token) {
      loginMsg.style.color = "lightgreen";
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      showDashboard(email);
    } else {
      loginMsg.style.color = "red";
    }
  } catch {
    loginMsg.textContent = "Error connecting to server.";
    loginMsg.style.color = "red";
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  showAuth();
});

// Auto-login if token exists
window.onload = () => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");
  if (token && email) {
    showDashboard(email);
  }
};
