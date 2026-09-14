const STUDENT_SESSION_KEY = "vit-bus-student-session";
const ROLE_STORAGE_KEY = "vit-bus-dashboard-role";
const LOCAL_STUDENT_ACCOUNTS_KEY = "vit-bus-local-student-accounts";

const signupForm = document.querySelector("#student-signup-form");
const signupStatus = document.querySelector("#signup-status");

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const regno = String(formData.get("regno") || "").trim().toUpperCase();
    const password = String(formData.get("password") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();

    if (!regno || !password || !confirmPassword) {
      setSignupStatus("Enter registration number and both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setSignupStatus("Passwords do not match.");
      return;
    }

    try {
      await apiRequest("/student-signup", {
        method: "POST",
        body: { regno, password },
      });

      const loginPayload = await apiRequest("/student-login", {
        method: "POST",
        body: { regno, password },
      });

      window.localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(loginPayload.session));
      window.localStorage.setItem(ROLE_STORAGE_KEY, "student");
      window.location.href = "./student.html";
    } catch (error) {
      if (isStaticHosting() || error.message.includes("Backend server not running")) {
        createLocalAccount(regno, password);
        window.localStorage.setItem(
          STUDENT_SESSION_KEY,
          JSON.stringify({
            regno,
            loggedInAt: new Date().toISOString(),
            mode: "local",
          })
        );
        window.localStorage.setItem(ROLE_STORAGE_KEY, "student");
        window.location.href = "./student.html";
        return;
      }

      setSignupStatus(error.message);
    }
  });
}

function isStaticHosting() {
  return window.location.hostname.endsWith("github.io") || window.location.protocol === "file:";
}

function setSignupStatus(message) {
  if (signupStatus) {
    signupStatus.textContent = message;
  }
}

function createLocalAccount(regno, password) {
  const accounts = loadLocalAccounts();
  accounts[regno] = {
    password,
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(LOCAL_STUDENT_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function loadLocalAccounts() {
  try {
    const stored = window.localStorage.getItem(LOCAL_STUDENT_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
}

async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };
  const requestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestInit.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(`./api${path}`, requestInit);
  } catch (error) {
    throw new Error("Backend server not running. Start server.py and open the app from that server URL.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}
