const DRIVER_SESSION_KEY = "vit-bus-driver-session";
const ROLE_STORAGE_KEY = "vit-bus-dashboard-role";
const DEMO_DRIVER_ID = "DRV001";
const DEMO_DRIVER_PASSWORD = "driver123";

const driverLoginForm = document.querySelector("#driver-login-form");
const driverLoginStatus = document.querySelector("#driver-login-status");

if (driverLoginForm) {
  driverLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(driverLoginForm);
    const driverId = String(formData.get("driverId") || "").trim().toUpperCase();
    const password = String(formData.get("password") || "").trim();

    if (!driverId || !password) {
      setDriverStatus("Enter driver ID and password.");
      return;
    }

    try {
      const payload = await apiRequest("/driver-login", {
        method: "POST",
        body: { driverId, password },
      });

      window.localStorage.setItem(DRIVER_SESSION_KEY, JSON.stringify(payload.session));
      window.localStorage.setItem(ROLE_STORAGE_KEY, "driver");
      window.location.href = "./driver.html";
    } catch (error) {
      if (driverId === DEMO_DRIVER_ID && password === DEMO_DRIVER_PASSWORD) {
        window.localStorage.setItem(
          DRIVER_SESSION_KEY,
          JSON.stringify({
            driverId,
            name: "Campus Driver 1",
            loggedInAt: new Date().toISOString(),
            mode: "local",
          })
        );
        window.localStorage.setItem(ROLE_STORAGE_KEY, "driver");
        window.location.href = "./driver.html";
        return;
      }

      setDriverStatus("The online backend is unavailable. Use the demo driver login shown on this page.");
    }
  });
}

function setDriverStatus(message) {
  if (driverLoginStatus) {
    driverLoginStatus.textContent = message;
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
