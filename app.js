const STORAGE_KEY = "vit-bus-dashboard-state";
const ROLE_STORAGE_KEY = "vit-bus-dashboard-role";
const STUDENT_SESSION_KEY = "vit-bus-student-session";
const DRIVER_SESSION_KEY = "vit-bus-driver-session";
const NOTIFICATION_FILTER_KEY = "vit-bus-notification-filter";
const LOCAL_STUDENT_ACCOUNTS_KEY = "vit-bus-local-student-accounts";
const LOCAL_STUDENT_PAYMENTS_PREFIX = "vit-bus-local-student-payments:";
const STATE_VERSION = 3;
const FARE_PER_RIDE = 20;
const DEFAULT_SPEED_KMH = 18;
const SENSOR_REFRESH_INTERVAL_MS = 10000;
const TRANSPORT_POLL_INTERVAL_MS = 5000;
const STUDENT_PROFILE_POLL_INTERVAL_MS = 15000;
const APP_CONFIG = normalizeConfig(globalThis.VIT_APP_CONFIG || {});

function createEmptyPayments() {
  return {
    totalDue: 0,
    rideCount: 0,
    history: [],
  };
}

const stopCatalog = {
  "VIT Campus": {
    query: "Vellore Institute of Technology, Vellore, Tamil Nadu",
    lat: 12.9692,
    lng: 79.1559,
  },
  "Main Gate": {
    query: "VIT Main Gate, Vellore, Tamil Nadu",
    lat: 12.9688,
    lng: 79.1537,
  },
  SMV: {
    query: "SMV, VIT University, Vellore, Tamil Nadu",
    lat: 12.9699,
    lng: 79.1556,
  },
  "Tunnel H Block": {
    query: "H Block Tunnel, VIT University, Vellore, Tamil Nadu",
    lat: 12.9707,
    lng: 79.1565,
  },
  "One Food World": {
    query: "Food World, VIT University, Vellore, Tamil Nadu",
    lat: 12.9714,
    lng: 79.1572,
  },
  Enzo: {
    query: "Enzo, VIT University, Vellore, Tamil Nadu",
    lat: 12.9717,
    lng: 79.1579,
  },
  "K Block": {
    query: "K Block, VIT University, Vellore, Tamil Nadu",
    lat: 12.9721,
    lng: 79.1586,
  },
  "L Block": {
    query: "L Block, VIT University, Vellore, Tamil Nadu",
    lat: 12.9724,
    lng: 79.1590,
  },
  "R/M Block": {
    query: "R Block Hostel, VIT University, Vellore, Tamil Nadu",
    lat: 12.9728,
    lng: 79.1596,
  },
  "N Block": {
    query: "N Block Hostel, VIT University, Vellore, Tamil Nadu",
    lat: 12.9718,
    lng: 79.1591,
  },
  "Health Center": {
    query: "Health Center, VIT University, Vellore, Tamil Nadu",
    lat: 12.9684,
    lng: 79.1546,
  },
  "Anna Audi": {
    query: "Anna Auditorium, VIT University, Vellore, Tamil Nadu",
    lat: 12.9692,
    lng: 79.1552,
  },
  "G/H Ladies Block": {
    query: "G Block Ladies Hostel, VIT University, Vellore, Tamil Nadu",
    lat: 12.9706,
    lng: 79.1568,
  },
  TT: {
    query: "TT Block, VIT University, Vellore, Tamil Nadu",
    lat: 12.9715,
    lng: 79.1605,
  },
  SJT: {
    query: "SJT Block, VIT University, Vellore, Tamil Nadu",
    lat: 12.9711,
    lng: 79.1571,
  },
  PRP: {
    query: "PRP Block, VIT University, Vellore, Tamil Nadu",
    lat: 12.9694,
    lng: 79.1572,
  },
  MGB: {
    query: "MGB, VIT University, Vellore, Tamil Nadu",
    lat: 12.9689,
    lng: 79.1582,
  },
};

const defaultState = {
  version: STATE_VERSION,
  buses: [
    createBus({
      id: "VIT-MH",
      code: "Mens Loop",
      shuttleNumber: "MH-01",
      routeName: "Men's Hostel Shuttle",
      driver: "Rahul Nair",
      status: "On Time",
      etaMinutes: 5,
      nextStop: "Tunnel H Block",
      totalSeats: 40,
      availableSeats: 27,
      note: "Main Gate to Men's Hostel loop via SMV, tunnel, food court, Enzo, and hostel blocks.",
      routePath: ["Main Gate", "SMV", "Tunnel H Block", "One Food World", "Enzo", "K Block", "L Block", "R/M Block", "N Block"],
      currentLocationLabel: "SMV",
      currentLat: stopCatalog.SMV.lat,
      currentLng: stopCatalog.SMV.lng,
      sensorProvider: "Demo",
      etaProvider: "Schedule",
      updatedAt: isoNow(-8),
    }),
    createBus({
      id: "VIT-MH-02",
      code: "Mens Loop B",
      shuttleNumber: "MH-02",
      routeName: "Men's Hostel Shuttle",
      driver: "Ajay Kumar",
      status: "In Transit",
      etaMinutes: 8,
      nextStop: "Enzo",
      totalSeats: 40,
      availableSeats: 19,
      note: "Second men's hostel shuttle currently between One Food World and Enzo.",
      routePath: ["Main Gate", "SMV", "Tunnel H Block", "One Food World", "Enzo", "K Block", "L Block", "R/M Block", "N Block"],
      currentLocationLabel: "One Food World",
      currentLat: stopCatalog["One Food World"].lat,
      currentLng: stopCatalog["One Food World"].lng,
      sensorProvider: "Demo",
      etaProvider: "Schedule",
      updatedAt: isoNow(-6),
    }),
    createBus({
      id: "VIT-MH-03",
      code: "Mens Loop C",
      shuttleNumber: "MH-03",
      routeName: "Men's Hostel Shuttle",
      driver: "Kishore Raj",
      status: "On Time",
      etaMinutes: 11,
      nextStop: "R/M Block",
      totalSeats: 40,
      availableSeats: 24,
      note: "Third men's hostel shuttle is covering the hostel-side end of the loop.",
      routePath: ["Main Gate", "SMV", "Tunnel H Block", "One Food World", "Enzo", "K Block", "L Block", "R/M Block", "N Block"],
      currentLocationLabel: "L Block",
      currentLat: stopCatalog["L Block"].lat,
      currentLng: stopCatalog["L Block"].lng,
      sensorProvider: "Demo",
      etaProvider: "Schedule",
      updatedAt: isoNow(-3),
    }),
    createBus({
      id: "VIT-LA",
      code: "Ladies Acad",
      shuttleNumber: "LH-01",
      routeName: "Ladies Hostel Shuttle",
      driver: "Priya Menon",
      status: "Boarding",
      etaMinutes: 7,
      nextStop: "Health Center",
      totalSeats: 40,
      availableSeats: 31,
      note: "Main Gate to ladies hostel and academic loop via Health Center, Anna Audi, SMV, G/H Ladies, TT, SJT, PRP, and MGB.",
      routePath: ["Main Gate", "Health Center", "Anna Audi", "SMV", "G/H Ladies Block", "TT", "SJT", "PRP", "MGB", "Main Gate"],
      currentLocationLabel: "Health Center",
      currentLat: stopCatalog["Health Center"].lat,
      currentLng: stopCatalog["Health Center"].lng,
      sensorProvider: "Demo",
      etaProvider: "Schedule",
      updatedAt: isoNow(-4),
    }),
    createBus({
      id: "VIT-LA-02",
      code: "Ladies Loop B",
      shuttleNumber: "LH-02",
      routeName: "Ladies Hostel Shuttle",
      driver: "Meena Joseph",
      status: "On Time",
      etaMinutes: 9,
      nextStop: "SJT",
      totalSeats: 40,
      availableSeats: 22,
      note: "Second ladies hostel shuttle is moving through the TT and SJT stretch.",
      routePath: ["Main Gate", "Health Center", "Anna Audi", "SMV", "G/H Ladies Block", "TT", "SJT", "PRP", "MGB", "Main Gate"],
      currentLocationLabel: "TT",
      currentLat: stopCatalog.TT.lat,
      currentLng: stopCatalog.TT.lng,
      sensorProvider: "Demo",
      etaProvider: "Schedule",
      updatedAt: isoNow(-5),
    }),
    createBus({
      id: "VIT-LA-03",
      code: "Ladies Loop C",
      shuttleNumber: "LH-03",
      routeName: "Ladies Hostel Shuttle",
      driver: "Divya S",
      status: "Boarding",
      etaMinutes: 12,
      nextStop: "MGB",
      totalSeats: 40,
      availableSeats: 28,
      note: "Third ladies hostel shuttle is near PRP and MGB before returning to Main Gate.",
      routePath: ["Main Gate", "Health Center", "Anna Audi", "SMV", "G/H Ladies Block", "TT", "SJT", "PRP", "MGB", "Main Gate"],
      currentLocationLabel: "PRP",
      currentLat: stopCatalog.PRP.lat,
      currentLng: stopCatalog.PRP.lng,
      sensorProvider: "Demo",
      etaProvider: "Schedule",
      updatedAt: isoNow(-2),
    }),
  ],
  notifications: [],
  payments: createEmptyPayments(),
};

defaultState.notifications = [
  notificationFactory(
    "VIT-LA",
    "Boarding Update",
    "Ladies Hostel Shuttle is boarding at Main Gate before leaving for Health Center."
  ),
  notificationFactory(
    "VIT-MH",
    "Arrival Notice",
    "Men's Hostel Shuttle is passing SMV and will reach Tunnel H Block in approximately 5 minutes."
  ),
];

let state = loadState();
let selectedBusId = state.buses[0]?.id ?? null;
let currentRole = loadRole();
let studentSession = loadStudentSession();
let driverSession = loadDriverSession();
let studentPayments = createEmptyPayments();
let deferredInstallPrompt = null;
let liveTrackingWatchId = null;
let googleMapsReady = false;
let directionsService = null;
let toastTimeoutId;
let sensorRefreshInFlight = false;
let transportPollingInFlight = false;
let studentProfilePollingInFlight = false;
let transportSyncInFlight = false;
let pendingTransportSync = false;
let studentPosition = null;
let nearestBusInsight = null;
let studentLocationInFlight = false;
let dismissedNotificationIds = loadDismissedNotificationIds();
let backendAvailable = true;
const pageMode = document.body.dataset.page || "landing";

const refs = {
  statGrid: document.querySelector("#stat-grid"),
  routeList: document.querySelector("#route-list"),
  shuttleOptions: document.querySelector("#shuttle-options"),
  notificationList: document.querySelector("#notification-list"),
  mapTitle: document.querySelector("#map-title"),
  campusMapFrame: document.querySelector("#campus-map-frame"),
  mapInsights: document.querySelector("#map-insights"),
  mapFocusList: document.querySelector("#map-focus-list"),
  mapSourceNote: document.querySelector("#map-source-note"),
  mapOpenLink: document.querySelector("#map-open-link"),
  roleTitle: document.querySelector("#role-title"),
  roleDescription: document.querySelector("#role-description"),
  roleButtons: [...document.querySelectorAll("[data-role-choice]")],
  studentLoginForm: document.querySelector("#student-login-form"),
  studentLogout: document.querySelector("#student-logout"),
  studentLoginStatus: document.querySelector("#student-login-status"),
  integrationBanner: document.querySelector("#integration-banner"),
  installApp: document.querySelector("#install-app"),
  installHeading: document.querySelector("#install-heading"),
  installStatus: document.querySelector("#install-status"),
  platformGuide: document.querySelector("#platform-guide"),
  boardTitle: document.querySelector("#board-title"),
  boardContent: document.querySelector("#board-content"),
  driverForm: document.querySelector("#driver-form"),
  routeSelect: document.querySelector("#route-select"),
  shuttleNumberInput: document.querySelector("#shuttle-number-input"),
  locationOutput: document.querySelector("#location-output"),
  etaOutput: document.querySelector("#eta-output"),
  capacityOutput: document.querySelector("#capacity-output"),
  driverSummary: document.querySelector("#driver-summary"),
  driverLocationStatus: document.querySelector("#driver-location-status"),
  driverLocationMeta: document.querySelector("#driver-location-meta"),
  driverEtaStatus: document.querySelector("#driver-eta-status"),
  driverEtaMeta: document.querySelector("#driver-eta-meta"),
  driverSeatStatus: document.querySelector("#driver-seat-status"),
  driverSeatMeta: document.querySelector("#driver-seat-meta"),
  startTracking: document.querySelector("#start-tracking"),
  refreshSensor: document.querySelector("#refresh-sensor"),
  paymentTotal: document.querySelector("#payment-total"),
  paymentMeta: document.querySelector("#payment-meta"),
  paymentBus: document.querySelector("#payment-bus"),
  paymentHistory: document.querySelector("#payment-history"),
  boardShuttle: document.querySelector("#board-shuttle"),
  resetPayment: document.querySelector("#reset-payment"),
  clearNotifications: document.querySelector("#clear-notifications"),
  resetDemo: document.querySelector("#reset-demo"),
  routeCardTemplate: document.querySelector("#route-card-template"),
  liveClock: document.querySelector("#live-clock"),
};

bootstrap();

async function bootstrap() {
  if (!applyPageMode()) {
    return;
  }
  await initializeGoogleIntegrations();
  registerServiceWorker();
  bindInstallPrompt();
  bindEvents();
  await refreshBackendStatus();
  await hydrateRemoteTransportState({ render: false, silent: true });
  await restoreStudentSession();
  renderDriverOptions();
  syncFormToSelectedBus();
  renderAll();
  updateClock();
  window.setInterval(updateClock, 1000);
  window.setInterval(tickEtas, 60000);
  startSensorAutoRefresh();
  startTransportPolling();
  startStudentProfilePolling();
}

function bindEvents() {
  refs.roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (pageMode === "landing" && button.dataset.roleChoice === "driver") {
        currentRole = "driver";
        persistRole();
        window.location.href = "./driver-login.html";
        return;
      }

      currentRole = button.dataset.roleChoice;
      persistRole();
      renderAll();
      showToast(currentRole === "driver" ? "Driver mode enabled." : "Student mode enabled.");
    });
  });

  refs.studentLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(refs.studentLoginForm);
    const regno = String(formData.get("regno")).trim();
    const password = String(formData.get("password")).trim();

    if (!regno || !password) {
      refs.studentLoginStatus.textContent = "Enter registration number and password.";
      return;
    }

    if (!backendAvailable) {
      const localLogin = loginLocalStudent(regno, password);
      refs.studentLoginStatus.textContent = localLogin.message;
      showToast(localLogin.message);
      if (!localLogin.ok) {
        return;
      }

      refs.studentLoginForm.reset();
      renderAll();
      if (pageMode === "landing") {
        window.location.href = "./student.html";
      }
      return;
    }

    try {
      const payload = await apiRequest("/student-login", {
        method: "POST",
        body: { regno, password },
      });

      studentSession = payload.session;
      studentPayments = normalizePayments(payload.payments);
      currentRole = "student";
      persistRole();
      persistStudentSession();
      refs.studentLoginForm.reset();
      renderAll();
      showToast("Student login successful.");
      if (pageMode === "landing") {
        window.location.href = "./student.html";
      }
    } catch (error) {
      refs.studentLoginStatus.textContent = error.message;
      showToast(error.message);
    }
  });

  refs.studentLogout.addEventListener("click", async () => {
    try {
      await apiRequest("/student-logout", { method: "POST" });
    } catch (error) {
      // Ignore logout errors and clear the local session anyway.
    }

    studentSession = null;
    studentPayments = createEmptyPayments();
    persistStudentSession();
    currentRole = "student";
    persistRole();
    renderAll();
    showToast("Student logged out.");
    if (pageMode === "student") {
      window.location.href = "./index.html";
    }
  });

  refs.installApp.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      showToast(getInstallExperience().fallbackToast);
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    renderInstallButton();
  });

  refs.driverForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(refs.driverForm);
    const busId = String(formData.get("routeId"));
    const shuttleNumber = String(formData.get("shuttleNumber")).trim();

    const targetBus = getBus(busId);
    if (!targetBus) {
      return;
    }

    const etaResult = await computeEtaForBus(targetBus, targetBus.nextStop);
    const sensorResult = await refreshSensorCapacity(busId, { silent: true });

    state.buses = state.buses.map((bus) => {
      if (bus.id !== busId) {
        return bus;
      }

      return {
        ...bus,
        shuttleNumber: shuttleNumber || bus.shuttleNumber,
        etaMinutes: etaResult.etaMinutes,
        etaProvider: etaResult.provider,
        availableSeats: sensorResult.availableSeats ?? bus.availableSeats,
        totalSeats: sensorResult.totalSeats ?? bus.totalSeats,
        sensorProvider: sensorResult.provider ?? bus.sensorProvider,
        updatedAt: new Date().toISOString(),
      };
    });

    selectedBusId = busId;
    prependNotification(buildDriverNotification(busId, shuttleNumber || targetBus.shuttleNumber, etaResult.etaMinutes));
    persistState();
    scheduleTransportSync();
    renderAll();
    showToast("Driver details saved.");
  });

  refs.routeSelect.addEventListener("change", async () => {
    selectedBusId = refs.routeSelect.value;
    syncFormToSelectedBus();
    await hydrateSelectedBus();
    renderAll();
  });

  refs.startTracking.addEventListener("click", async () => {
    if (liveTrackingWatchId !== null) {
      stopLiveTracking();
      showToast("Live tracking stopped.");
      return;
    }

    await startLiveTracking();
  });

  refs.refreshSensor.addEventListener("click", async () => {
    const result = await refreshSensorCapacity(selectedBusId, { remoteSync: true });
    if (result.availableSeats != null) {
      showToast("Seat sensor refreshed.");
    }
  });

  refs.boardShuttle.addEventListener("click", async () => {
    await boardSelectedBus();
  });

  refs.resetPayment.addEventListener("click", async () => {
    if (!isStudentAuthenticated()) {
      showToast("Student login required.");
      return;
    }

    if (!studentSession?.token) {
      studentPayments = createEmptyPayments();
      persistStudentPayments();
      renderStudentPayments();
      showToast("Student money reset in local mode.");
      return;
    }

    try {
      const payload = await apiRequest("/student/reset-payments", { method: "POST" });
      studentPayments = normalizePayments(payload.payments);
      renderStudentPayments();
      showToast("Student money reset.");
    } catch (error) {
      showToast(error.message);
    }
  });

  refs.clearNotifications.addEventListener("click", () => {
    dismissedNotificationIds = state.notifications.map((notification) => notification.id);
    persistDismissedNotificationIds();
    renderNotifications();
    showToast("Notifications cleared.");
  });

  refs.resetDemo.addEventListener("click", () => {
    state = cloneData(defaultState);
    selectedBusId = state.buses[0]?.id ?? null;
    persistState();
    scheduleTransportSync();
    renderDriverOptions();
    syncFormToSelectedBus();
    renderAll();
    showToast("Demo data reset.");
  });
}

function applyPageMode() {
  if (pageMode === "student") {
    currentRole = "student";
    persistRole();
    if (!isStudentAuthenticated()) {
      window.location.replace("./index.html");
      return false;
    }
    return true;
  }

  if (pageMode === "driver") {
    currentRole = "driver";
    persistRole();
    if (!driverSession?.driverId) {
      window.location.replace("./driver-login.html");
      return false;
    }
  }

  return true;
}

function renderAll() {
  renderRoleUI();
  applyRoleView();
  renderInstallButton();
  renderIntegrationBanner();
  renderStats();
  renderShuttleOptions();
  renderRoutes();
  renderMap();
  renderMapInsights();
  renderBoard();
  renderNotifications();
  renderDriverOptions();
  syncFormToSelectedBus();
  renderDriverSummary();
  renderStudentPayments();
  renderDriverTelemetry();
}

function renderRoleUI() {
  refs.roleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.roleChoice === currentRole);
  });

  if (currentRole === "driver") {
    refs.roleTitle.textContent = "Driver app mode";
    refs.roleDescription.textContent =
      "Choose the route you are driving, enter the shuttle number, and share live location.";
    refs.studentLogout.classList.toggle("is-hidden", !studentSession);
    refs.studentLoginStatus.textContent = driverSession?.driverId
      ? `Driver session active for ${driverSession.driverId}.`
      : "Drivers must log in before the driver dashboard opens.";
    return;
  }

  refs.roleTitle.textContent = studentSession ? "Student app mode" : "Student login required";
  refs.roleDescription.textContent = studentSession
    ? "Choose either the Men's Hostel Shuttle or the Ladies Hostel Shuttle and track where it is and when it will arrive."
    : "Students must log in before the shuttle tracking screens open. Drivers can enter directly using the driver button.";
  refs.studentLogout.classList.toggle("is-hidden", !studentSession);
  refs.studentLoginStatus.textContent = studentSession
    ? `Logged in as ${studentSession.regno}.`
    : backendAvailable
      ? "Login is required before the student shuttle screens open."
      : "Shared backend offline. You can still use local student mode from this device.";
}

function applyRoleView() {
  document.querySelectorAll("[data-role]").forEach((section) => {
    const shouldShow =
      section.dataset.role === currentRole &&
      (currentRole !== "student" || studentSession !== null);
    section.classList.toggle("is-hidden", !shouldShow);
  });
}

function renderInstallButton() {
  const installExperience = getInstallExperience();
  refs.installHeading.textContent = installExperience.heading;
  refs.installStatus.textContent = installExperience.status;
  refs.platformGuide.textContent = installExperience.guide;
  refs.installApp.textContent = installExperience.buttonLabel;
  refs.installApp.classList.toggle("is-hidden", installExperience.hideButton);
  refs.installApp.disabled = installExperience.buttonDisabled;
}

function renderIntegrationBanner() {
  const cards = [
    {
      title: "Backend connection",
      body: backendAvailable
        ? "Shared transport API is connected. Student login and live shared updates are available."
        : "Shared backend is unavailable. The app is running in local mode on this device until server.py is started.",
    },
    {
      title: "Google map view",
      body: "Real Google map embed is active for campus and stop focus.",
    },
    {
      title: "Google route ETA",
      body: APP_CONFIG.googleMapsApiKey || APP_CONFIG.routesProxyEndpoint
        ? "Google route calculation is configured. Auto ETA will use Google first."
        : "Google route calculation is not configured yet. Auto ETA falls back to local distance estimation.",
    },
    {
      title: "Bus seat sensor",
      body: APP_CONFIG.capacitySensorEndpoint
        ? "Seat availability reads from the configured shuttle sensor endpoint."
        : "Seat availability is using demo sensor values until a bus sensor endpoint is connected.",
    },
  ];

  refs.integrationBanner.innerHTML = cards
    .map(
      (card) => `
        <article class="integration-card">
          <strong>${escapeHtml(card.title)}</strong>
          <p class="empty-copy">${escapeHtml(card.body)}</p>
        </article>
      `
    )
    .join("");
}

function renderStats() {
  const nextArrival = [...state.buses].sort((left, right) => left.etaMinutes - right.etaMinutes)[0];
  const freeSeats = state.buses.reduce((count, bus) => count + bus.availableSeats, 0);
  const liveTracked = state.buses.filter((bus) => bus.currentLat != null && bus.currentLng != null).length;

  const stats = [
    { label: "Active buses", value: state.buses.length },
    { label: "Live tracked", value: liveTracked },
    { label: "Open seats", value: freeSeats },
    { label: "Next arrival", value: `${nextArrival.etaMinutes} min` },
  ];

  refs.statGrid.innerHTML = stats
    .map(
      (stat) => `
        <article class="stat-card">
          <span class="meta-label">${stat.label}</span>
          <strong>${stat.value}</strong>
        </article>
      `
    )
    .join("");
}

function renderRoutes() {
  if (!refs.routeList) {
    return;
  }

  refs.routeList.innerHTML = "";
  const buses = [...getVisibleBuses()].sort((left, right) => left.etaMinutes - right.etaMinutes);

  if (!buses.length) {
    refs.routeList.innerHTML = `<p class="empty-copy">No shuttle routes are available.</p>`;
    return;
  }

  buses.forEach((bus) => {
    const fragment = refs.routeCardTemplate.content.cloneNode(true);
    const button = fragment.querySelector(".route-card-button");
    const statusPill = fragment.querySelector(".status-pill");

    fragment.querySelector(".route-code").textContent = bus.shuttleNumber || bus.code;
    fragment.querySelector(".route-name").textContent = bus.routeName;
    fragment.querySelector(".eta-value").textContent = `${bus.etaMinutes} min`;
    fragment.querySelector(".next-stop-value").textContent = bus.nextStop;
    fragment.querySelector(".capacity-value").textContent = `${bus.availableSeats} left`;
    fragment.querySelector(".route-note").textContent = `Shuttle is at ${bus.currentLocationLabel}. ${bus.note}`;

    statusPill.textContent = bus.status;
    statusPill.classList.add(statusClass(bus.status));
    if (bus.id === selectedBusId) {
      button.classList.add("active");
    }

    button.addEventListener("click", async () => {
      selectedBusId = bus.id;
      syncFormToSelectedBus();
      await hydrateSelectedBus();
      renderAll();
    });

    refs.routeList.appendChild(fragment);
  });
}

function renderShuttleOptions() {
  const selectedRouteName = getSelectedRouteName();

  refs.shuttleOptions.innerHTML = getRouteChoices()
    .map((route) => {
      const active = route.routeName === selectedRouteName;
      return `
        <button type="button" class="shuttle-option ${active ? "active" : ""}" data-route-select="${escapeHtml(route.routeName)}">
          <span class="section-label">Route option</span>
          <strong>${escapeHtml(route.routeName)}</strong>
          <p class="empty-copy">${route.busCount} active buses · nearest arrival ${route.nextEtaMinutes} min.</p>
        </button>
      `;
    })
    .join("");

  refs.shuttleOptions.querySelectorAll("[data-route-select]").forEach((button) => {
    button.addEventListener("click", async () => {
      const targetBus = pickBestBusForRoute(button.dataset.routeSelect);
      if (!targetBus) {
        return;
      }

      selectedBusId = targetBus.id;
      syncFormToSelectedBus();
      await hydrateSelectedBus();
      renderAll();
    });
  });
}

function renderBoard() {
  const bus = getBus(selectedBusId);

  if (!bus) {
    refs.boardTitle.textContent = "Choose a shuttle";
    refs.boardContent.innerHTML = '<p class="empty-copy">No shuttle is currently selected.</p>';
    return;
  }

  refs.boardTitle.textContent = `${bus.routeName} · ${bus.id}`;
  refs.boardContent.innerHTML = `
    <div class="board-group">
      <div class="board-statline">
        <span>Current shuttle location</span>
        <strong>${escapeHtml(bus.currentLocationLabel)}</strong>
      </div>
      <div class="board-statline">
        <span>Estimated arrival</span>
        <strong>${bus.etaMinutes} min</strong>
      </div>
      <div class="board-statline">
        <span>Available seats</span>
        <strong>${bus.availableSeats} / ${bus.totalSeats}</strong>
      </div>
      <div class="board-statline">
        <span>ETA provider</span>
        <strong>${escapeHtml(bus.etaProvider)}</strong>
      </div>
    </div>

    <div class="board-group">
      <p class="section-label">Route path</p>
      <div class="board-stack">
        ${bus.routePath
          .map(
            (stop) => `
              <div class="stop-line">
                <span class="stop-dot ${stop === bus.nextStop ? "current" : ""}"></span>
                <span>${escapeHtml(stop)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    </div>

    <div class="board-group">
      <p class="section-label">Operational note</p>
      <p class="empty-copy">${escapeHtml(bus.note)}</p>
    </div>
  `;
}

function renderStudentPayments() {
  const bus = getBus(selectedBusId);
  refs.paymentTotal.textContent = `Rs ${studentPayments.totalDue}`;
  refs.paymentMeta.textContent =
    studentPayments.rideCount > 0
      ? `${studentPayments.rideCount} shuttle entries recorded.`
      : "No rides recorded yet.";
  refs.paymentBus.textContent = bus ? `${bus.id} · ${bus.routeName}` : "Choose a shuttle";
  refs.boardShuttle.disabled = !isStudentAuthenticated() || !bus || bus.availableSeats <= 0;

  if (!studentPayments.history.length) {
    refs.paymentHistory.innerHTML = '<p class="empty-copy">Board a shuttle to start your payment history.</p>';
    return;
  }

  refs.paymentHistory.innerHTML = studentPayments.history
    .slice(0, 5)
    .map(
      (entry) => `
        <article class="notification-card">
          <strong>${escapeHtml(entry.busId)} · ${escapeHtml(entry.routeName)}</strong>
          <p class="empty-copy">Fare added: Rs ${entry.amount}</p>
          <div class="notification-meta">
            <span>${formatTimestamp(entry.createdAt)}</span>
            <span>${escapeHtml(entry.location)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderDriverSummary() {
  const bus = getBus(selectedBusId);

  if (!bus) {
    refs.driverSummary.innerHTML = '<p class="empty-copy">Select a bus to publish driver updates.</p>';
    return;
  }

  refs.driverSummary.innerHTML = `
    <p class="section-label">Assigned bus</p>
    <h3>${escapeHtml(bus.shuttleNumber || bus.id)} · ${escapeHtml(bus.routeName)}</h3>
    <p class="empty-copy">
      Live shuttle location: ${escapeHtml(bus.currentLocationLabel)}. The next stop is
      ${escapeHtml(bus.nextStop)}, auto ETA is ${bus.etaMinutes} minutes, and the latest
      seat feed shows ${bus.availableSeats} of ${bus.totalSeats} seats available.
    </p>
  `;
}

function renderDriverTelemetry() {
  const bus = getBus(selectedBusId);

  refs.driverLocationStatus.textContent = bus?.currentLat != null
    ? `${bus.currentLat.toFixed(5)}, ${bus.currentLng.toFixed(5)}`
    : "Location not started";
  refs.driverLocationMeta.textContent = bus?.currentLat != null
    ? `Tracking ${bus.shuttleNumber || bus.id} from device GPS. Current shuttle position is synced to the driver phone.`
    : "Start live tracking to use device GPS as the shuttle location.";

  refs.driverEtaStatus.textContent = bus ? `${bus.etaMinutes} min` : "Waiting for route data";
  refs.driverEtaMeta.textContent = bus
    ? `Auto ETA provider: ${bus.etaProvider}. No manual ETA entry is required.`
    : "Select a shuttle to calculate ETA.";

  refs.driverSeatStatus.textContent = bus
    ? `${bus.availableSeats} / ${bus.totalSeats} seats open`
    : "Sensor offline";
  refs.driverSeatMeta.textContent = bus
    ? `Seat provider: ${bus.sensorProvider}. Capacity is no longer entered manually.`
    : "Select a shuttle to view seat availability.";

  refs.startTracking.textContent = liveTrackingWatchId === null ? "Start Live Tracking" : "Stop Live Tracking";
}

function renderMap() {
  const bus = getBus(selectedBusId);

  if (!bus) {
    refs.mapTitle.textContent = "Live campus map";
    refs.campusMapFrame.src = buildMapEmbedUrl(stopCatalog["VIT Campus"].query);
    refs.mapOpenLink.href = buildGoogleMapsUrl(stopCatalog["VIT Campus"].query);
    refs.mapSourceNote.textContent = "Real map centered on VIT Vellore campus.";
    renderMapFocusChips(null);
    return;
  }

  const focusQuery = bus.currentLat != null && bus.currentLng != null
    ? `${bus.currentLat},${bus.currentLng}`
    : getStopConfig(bus.nextStop).query;

  refs.mapTitle.textContent = `${bus.routeName} live map`;
  refs.campusMapFrame.src = buildMapEmbedUrl(focusQuery);
  refs.mapOpenLink.href = buildGoogleMapsUrl(focusQuery);
  refs.mapSourceNote.textContent =
    bus.currentLat != null && bus.currentLng != null
      ? `Map focused on the live driver GPS position for ${bus.id}.`
      : `Map focused on ${bus.nextStop} because live driver GPS is not active.`;

  renderMapFocusChips(bus);
}

function renderMapInsights() {
  const visibleBuses = getVisibleBuses();
  const selectedBus = getBus(selectedBusId);
  const routeCount = new Set(state.buses.map((bus) => bus.routeName)).size;
  const nextArrival = [...state.buses].sort((left, right) => left.etaMinutes - right.etaMinutes)[0];
  const locationStatus = studentPosition
    ? `${studentPosition.lat.toFixed(5)}, ${studentPosition.lng.toFixed(5)}`
    : "Location not shared";
  const nearestBusMarkup = nearestBusInsight
    ? `
        <strong>${escapeHtml(nearestBusInsight.shuttleNumber)} · ${nearestBusInsight.etaMinutes} min</strong>
        <p class="empty-copy">
          ${escapeHtml(nearestBusInsight.routeName)} is ${formatDistance(nearestBusInsight.distanceKm)} away near
          ${escapeHtml(nearestBusInsight.locationLabel)}.
        </p>
        <p class="empty-copy emphasis-copy">ETA from bus to you uses ${escapeHtml(nearestBusInsight.provider)}.</p>
      `
    : `
        <strong>${studentPosition ? "Finding nearest bus" : "Waiting for location access"}</strong>
        <p class="empty-copy">
          ${studentPosition
            ? "Checking all active buses using their live GPS or seeded stop position."
            : "Use your current location so the app can tell you which active bus is closest to where you are standing."}
        </p>
      `;

  refs.mapInsights.innerHTML = `
    <div class="insight-grid">
      <article class="insight-card">
        <span class="meta-label">Route loops</span>
        <strong>${routeCount}</strong>
        <p class="empty-copy">Students still choose between the two route loops, while the app tracks every active bus on each loop.</p>
      </article>
      <article class="insight-card">
        <span class="meta-label">Active buses on this loop</span>
        <strong>${visibleBuses.length}</strong>
        <p class="empty-copy">${selectedBus ? `${escapeHtml(selectedBus.routeName)} currently has ${visibleBuses.length} active buses running.` : "Select a route loop to inspect the active buses on it."}</p>
      </article>
      <article class="insight-card">
        <span class="meta-label">Next arrival</span>
        <strong>${escapeHtml(nextArrival.routeName)} · ${nextArrival.etaMinutes} min</strong>
        <p class="empty-copy">Earliest ETA across the active transport board.</p>
      </article>
      <article class="insight-card">
        <span class="meta-label">Your current spot</span>
        <strong>${escapeHtml(locationStatus)}</strong>
        <p class="empty-copy">${studentPosition ? `Last refreshed ${formatTimestamp(studentPosition.updatedAt)}.` : "Location access is only used to measure the nearest bus to you."}</p>
        <button type="button" class="ghost-button location-action" id="student-location-trigger">
          ${studentPosition ? "Refresh My Location" : "Use My Current Location"}
        </button>
      </article>
      <article class="insight-card emphasis-card">
        <span class="meta-label">Nearest bus to you</span>
        ${nearestBusMarkup}
        <p class="empty-copy">${selectedBus ? `Fare on entry stays Rs ${FARE_PER_RIDE} for ${selectedBus.routeName}.` : "Select a route loop to inspect shuttle movement."}</p>
      </article>
    </div>
  `;

  const locationTrigger = document.querySelector("#student-location-trigger");
  if (locationTrigger) {
    locationTrigger.addEventListener("click", () => {
      void refreshStudentLocation();
    });
  }
}

function renderMapFocusChips(selectedBus) {
  const focusTargets = [{ id: "__campus__", label: "VIT Campus", query: stopCatalog["VIT Campus"].query }];
  const uniqueStops = new Set();

  if (studentPosition) {
    focusTargets.push({
      id: "__student__",
      label: "My Location",
      query: `${studentPosition.lat},${studentPosition.lng}`,
    });
  }

  state.buses.forEach((bus) => {
    bus.routePath.forEach((stop) => uniqueStops.add(stop));
  });

  [...uniqueStops].forEach((stop) => {
    focusTargets.push({
      id: stop,
      label: stop,
      query: getStopConfig(stop).query,
    });
  });

  refs.mapFocusList.innerHTML = focusTargets
    .map((target) => {
      const active = target.label === (selectedBus?.nextStop ?? "VIT Campus");
      return `
        <button type="button" class="map-focus-chip ${active ? "active" : ""}" data-focus-id="${escapeHtml(target.id)}" data-focus-query="${escapeHtml(target.query)}" data-focus-label="${escapeHtml(target.label)}">
          ${escapeHtml(target.label)}
        </button>
      `;
    })
    .join("");

  refs.mapFocusList.querySelectorAll(".map-focus-chip").forEach((button) => {
    button.addEventListener("click", () => {
      const targetLabel = button.dataset.focusLabel;
      const focusQuery = button.dataset.focusQuery;
      refs.campusMapFrame.src = buildMapEmbedUrl(focusQuery);
      refs.mapOpenLink.href = buildGoogleMapsUrl(focusQuery);
      refs.mapTitle.textContent = `Map focused on ${targetLabel}`;
      refs.mapSourceNote.textContent =
        button.dataset.focusId === "__student__"
          ? "Real map manually focused on your current location."
          : `Real map manually focused on ${targetLabel}.`;
      refs.mapFocusList.querySelectorAll(".map-focus-chip").forEach((chip) => {
        chip.classList.toggle("active", chip === button);
      });
    });
  });
}

function getSelectedRouteName() {
  return getBus(selectedBusId)?.routeName ?? state.buses[0]?.routeName ?? null;
}

function getRouteChoices() {
  const routeMap = new Map();

  state.buses.forEach((bus) => {
    const current = routeMap.get(bus.routeName);
    if (!current) {
      routeMap.set(bus.routeName, {
        routeName: bus.routeName,
        busCount: 1,
        nextEtaMinutes: bus.etaMinutes,
        representativeBusId: bus.id,
      });
      return;
    }

    current.busCount += 1;
    if (bus.etaMinutes < current.nextEtaMinutes) {
      current.nextEtaMinutes = bus.etaMinutes;
      current.representativeBusId = bus.id;
    }
  });

  return [...routeMap.values()];
}

function pickBestBusForRoute(routeName) {
  return [...state.buses]
    .filter((bus) => bus.routeName === routeName)
    .sort((left, right) => left.etaMinutes - right.etaMinutes)[0] ?? null;
}

function renderNotifications() {
  refs.notificationList.innerHTML = "";

  const visibleNotifications = state.notifications.filter(
    (notification) => !dismissedNotificationIds.includes(notification.id)
  );

  if (!visibleNotifications.length) {
    refs.notificationList.innerHTML = '<p class="empty-copy">No notifications right now.</p>';
    return;
  }

  visibleNotifications.forEach((notification) => {
    const bus = getBus(notification.busId);
    const card = document.createElement("article");
    card.className = "notification-card";
    card.innerHTML = `
      <strong>${escapeHtml(notification.title)}</strong>
      <p class="empty-copy">${escapeHtml(notification.message)}</p>
      <div class="notification-meta">
        <span>${escapeHtml(bus ? `${bus.routeName} · ${bus.shuttleNumber || notification.busId}` : notification.busId)}</span>
        <span>${formatTimestamp(notification.createdAt)}</span>
      </div>
    `;
    refs.notificationList.appendChild(card);
  });
}

function renderDriverOptions() {
  refs.routeSelect.innerHTML = state.buses
    .map(
      (bus) =>
        `<option value="${bus.id}" ${selectedBusId === bus.id ? "selected" : ""}>${bus.routeName}</option>`
    )
    .join("");
}

function syncFormToSelectedBus() {
  const bus = getBus(selectedBusId);
  if (!bus) {
    return;
  }

  refs.routeSelect.value = bus.id;
  refs.shuttleNumberInput.value = bus.shuttleNumber || "";
  refs.locationOutput.value = bus.currentLocationLabel;
  refs.etaOutput.value = `${bus.etaMinutes} min (${bus.etaProvider})`;
  refs.capacityOutput.value = `${bus.availableSeats} / ${bus.totalSeats} seats free`;
}

function getVisibleBuses() {
  const selectedRouteName = getSelectedRouteName();
  return selectedRouteName
    ? state.buses.filter((bus) => bus.routeName === selectedRouteName)
    : state.buses;
}

function tickEtas() {
  state.buses = state.buses.map((bus) => {
    if (bus.currentLat != null && bus.currentLng != null) {
      return bus;
    }

    if (bus.status === "Maintenance") {
      return bus;
    }

    const etaMinutes = Math.max(0, bus.etaMinutes - 1);
    const nextStatus = etaMinutes === 0 ? "Boarding" : bus.status;

    return {
      ...bus,
      etaMinutes,
      status: nextStatus,
    };
  });

  renderAll();
}

async function boardSelectedBus() {
  const bus = getBus(selectedBusId);
  if (!bus) {
    showToast("Select a shuttle first.");
    return;
  }

  if (!isStudentAuthenticated()) {
    showToast("Student login required.");
    return;
  }

  if (bus.availableSeats <= 0) {
    showToast("No seats are available on this shuttle.");
    return;
  }

  if (!studentSession?.token) {
    studentPayments.totalDue += FARE_PER_RIDE;
    studentPayments.rideCount += 1;
    studentPayments.history.unshift({
      id: safeId(),
      busId: bus.id,
      routeName: bus.routeName,
      amount: FARE_PER_RIDE,
      location: bus.currentLocationLabel,
      createdAt: new Date().toISOString(),
    });
    studentPayments.history = studentPayments.history.slice(0, 10);
    persistStudentPayments();

    state.buses = state.buses.map((entry) =>
      entry.id === bus.id
        ? {
            ...entry,
            availableSeats: Math.max(0, entry.availableSeats - 1),
            sensorProvider: "Local passenger count",
          }
        : entry
    );
    prependNotification(
      notificationFactory(bus.id, "Boarding Charge", `Rs ${FARE_PER_RIDE} added for entering ${bus.routeName}.`)
    );
    persistState();
    renderAll();
    showToast(`Rs ${FARE_PER_RIDE} added to your shuttle fare.`);
    return;
  }

  try {
    const payload = await apiRequest("/student/board", {
      method: "POST",
      body: { busId: bus.id },
    });

    applyTransportState(payload.state);
    studentPayments = normalizePayments(payload.payments);
    renderAll();
    showToast(`Rs ${FARE_PER_RIDE} added to your shuttle fare.`);
  } catch (error) {
    showToast(error.message);
  }
}

async function refreshStudentLocation() {
  if (!navigator.geolocation) {
    showToast("Geolocation is not available on this device.");
    return;
  }

  if (studentLocationInFlight) {
    return;
  }

  studentLocationInFlight = true;
  nearestBusInsight = null;
  renderMapInsights();

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 12000,
      });
    });

    studentPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracyMeters: Math.round(position.coords.accuracy || 0),
      updatedAt: new Date().toISOString(),
    };

    renderMap();
    await refreshNearestBusInsight();
    renderAll();
    showToast("Student location updated.");
  } catch (error) {
    renderMapInsights();
    showToast(error.message || "Unable to fetch your current location.");
  } finally {
    studentLocationInFlight = false;
  }
}

async function refreshNearestBusInsight() {
  if (!studentPosition) {
    nearestBusInsight = null;
    return null;
  }

  const candidates = await Promise.all(
    state.buses.map(async (bus) => {
      const busPoint = getBusTrackingPoint(bus);
      if (!busPoint) {
        return null;
      }

      const distanceKm = haversineDistance(studentPosition.lat, studentPosition.lng, busPoint.lat, busPoint.lng);
      let etaMinutes = estimateFallbackEta(busPoint.lat, busPoint.lng, studentPosition.lat, studentPosition.lng);
      let provider = "Local distance";

      if (googleMapsReady && directionsService) {
        const googleEta = await computeGoogleDirectionsEta(
          { lat: busPoint.lat, lng: busPoint.lng },
          { lat: studentPosition.lat, lng: studentPosition.lng }
        );

        if (googleEta != null) {
          etaMinutes = googleEta;
          provider = "Google Maps JS";
        }
      }

      return {
        busId: bus.id,
        shuttleNumber: bus.shuttleNumber || bus.id,
        routeName: bus.routeName,
        etaMinutes,
        provider,
        distanceKm,
        locationLabel: busPoint.label,
      };
    })
  );

  nearestBusInsight = candidates
    .filter(Boolean)
    .sort((left, right) => left.distanceKm - right.distanceKm || left.etaMinutes - right.etaMinutes)[0] ?? null;

  return nearestBusInsight;
}

async function startLiveTracking() {
  if (!navigator.geolocation) {
    showToast("Geolocation is not available on this device.");
    return;
  }

  if (!getBus(selectedBusId)) {
    showToast("Select the shuttle you are driving first.");
    return;
  }

  liveTrackingWatchId = navigator.geolocation.watchPosition(
    async (position) => {
      await updateDriverLocation(selectedBusId, position.coords.latitude, position.coords.longitude);
      renderAll();
    },
    (error) => {
      refs.driverLocationStatus.textContent = "Location failed";
      refs.driverLocationMeta.textContent = error.message;
      stopLiveTracking();
      showToast("Unable to start live location tracking.");
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    }
  );

  renderDriverTelemetry();
  showToast("Live driver tracking started.");
}

function stopLiveTracking() {
  if (liveTrackingWatchId !== null) {
    navigator.geolocation.clearWatch(liveTrackingWatchId);
    liveTrackingWatchId = null;
    renderDriverTelemetry();
  }
}

async function updateDriverLocation(busId, latitude, longitude) {
  const bus = getBus(busId);
  if (!bus) {
    return;
  }

  const etaResult = await computeEtaForBus(
    {
      ...bus,
      currentLat: latitude,
      currentLng: longitude,
    },
    bus.nextStop
  );

  state.buses = state.buses.map((entry) => {
    if (entry.id !== busId) {
      return entry;
    }

    return {
      ...entry,
      currentLat: latitude,
      currentLng: longitude,
      currentLocationLabel: `Live GPS ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      etaMinutes: etaResult.etaMinutes,
      etaProvider: etaResult.provider,
      updatedAt: new Date().toISOString(),
    };
  });

  persistState();
  scheduleTransportSync();
  if (studentPosition) {
    await refreshNearestBusInsight();
  }
}

async function hydrateSelectedBus() {
  const bus = getBus(selectedBusId);
  if (!bus) {
    return;
  }

  const [etaResult, sensorResult] = await Promise.all([
    computeEtaForBus(bus, bus.nextStop),
    refreshSensorCapacity(bus.id, { silent: true }),
  ]);

  state.buses = state.buses.map((entry) =>
    entry.id === bus.id
      ? {
          ...entry,
          etaMinutes: etaResult.etaMinutes,
          etaProvider: etaResult.provider,
          availableSeats: sensorResult.availableSeats ?? entry.availableSeats,
          totalSeats: sensorResult.totalSeats ?? entry.totalSeats,
          sensorProvider: sensorResult.provider ?? entry.sensorProvider,
        }
      : entry
  );
}

function startSensorAutoRefresh() {
  window.setInterval(() => {
    void autoRefreshSelectedBusSensor();
  }, SENSOR_REFRESH_INTERVAL_MS);
}

async function autoRefreshSelectedBusSensor() {
  if (currentRole !== "driver") {
    return;
  }

  if (sensorRefreshInFlight) {
    return;
  }

  const bus = getBus(selectedBusId);
  if (!bus) {
    return;
  }

  sensorRefreshInFlight = true;

  try {
    const beforeSnapshot = `${bus.availableSeats}:${bus.totalSeats}:${bus.sensorProvider || ""}`;
    await refreshSensorCapacity(bus.id, { silent: true, remoteSync: true });
    const refreshedBus = getBus(bus.id);

    if (!refreshedBus) {
      return;
    }

    const afterSnapshot = `${refreshedBus.availableSeats}:${refreshedBus.totalSeats}:${refreshedBus.sensorProvider || ""}`;
    if (beforeSnapshot !== afterSnapshot) {
      renderAll();
    }
  } finally {
    sensorRefreshInFlight = false;
  }
}

async function computeEtaForBus(bus, nextStop) {
  const destination = getStopConfig(nextStop);

  if (bus.currentLat != null && bus.currentLng != null) {
    if (APP_CONFIG.routesProxyEndpoint) {
      try {
        const response = await fetch(APP_CONFIG.routesProxyEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: { lat: bus.currentLat, lng: bus.currentLng },
            destination,
            busId: bus.id,
          }),
        });

        if (response.ok) {
          const payload = await response.json();
          if (Number.isFinite(payload.etaMinutes)) {
            return {
              etaMinutes: Math.max(0, Math.round(payload.etaMinutes)),
              provider: "Google Routes API",
            };
          }
        }
      } catch (error) {
        // Fall through to the client-side providers.
      }
    }

    if (googleMapsReady && directionsService && destination.lat != null && destination.lng != null) {
      const etaMinutes = await computeGoogleDirectionsEta(
        { lat: bus.currentLat, lng: bus.currentLng },
        { lat: destination.lat, lng: destination.lng }
      );

      if (etaMinutes != null) {
        return {
          etaMinutes,
          provider: "Google Maps JS",
        };
      }
    }

    if (destination.lat != null && destination.lng != null) {
      return {
        etaMinutes: estimateFallbackEta(bus.currentLat, bus.currentLng, destination.lat, destination.lng),
        provider: "Local fallback",
      };
    }
  }

  return {
    etaMinutes: bus.etaMinutes,
    provider: bus.etaProvider || "Schedule",
  };
}

async function refreshSensorCapacity(busId, options = {}) {
  const bus = getBus(busId);
  if (!bus) {
    return {};
  }

  if (APP_CONFIG.capacitySensorEndpoint) {
    try {
      const response = await fetch(
        `${APP_CONFIG.capacitySensorEndpoint}?busId=${encodeURIComponent(busId)}`
      );
      if (response.ok) {
        const payload = await response.json();
        const availableSeats = Number(payload.availableSeats);
        const totalSeats = Number(payload.totalSeats);

        if (Number.isFinite(availableSeats) && Number.isFinite(totalSeats)) {
          state.buses = state.buses.map((entry) =>
            entry.id === busId
              ? {
                  ...entry,
                  availableSeats,
                  totalSeats,
                  sensorProvider: "Bus sensor",
                }
              : entry
          );
          persistState();
          if (options.remoteSync) {
            scheduleTransportSync();
          }
          if (!options.silent) {
            renderAll();
          }
          return {
            availableSeats,
            totalSeats,
            provider: "Bus sensor",
          };
        }
      }
    } catch (error) {
      // Fall through to demo mode.
    }
  }

  return {
    availableSeats: bus.availableSeats,
    totalSeats: bus.totalSeats,
    provider: "Demo sensor",
  };
}

function buildDriverNotification(busId, shuttleNumber, etaMinutes) {
  const bus = getBus(busId);
  return notificationFactory(
    busId,
    "Driver Update",
    `${shuttleNumber} is assigned to ${bus ? bus.routeName : "the selected shuttle"}. Auto ETA is ${etaMinutes} minutes.`
  );
}

function prependNotification(notification) {
  state.notifications = [notification, ...state.notifications].slice(0, 10);
}

function persistState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(extractTransportState(state)));
  } catch (error) {
    return;
  }
}

function loadState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return cloneData(defaultState);
    }

    const parsed = JSON.parse(stored);
    if (parsed.version !== STATE_VERSION) {
      return cloneData(defaultState);
    }

    return normalizeTransportState(parsed);
  } catch (error) {
    return cloneData(defaultState);
  }
}

function persistRole() {
  try {
    window.localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
  } catch (error) {
    return;
  }
}

function loadRole() {
  try {
    const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
    return storedRole === "driver" ? "driver" : "student";
  } catch (error) {
    return "student";
  }
}

function persistStudentSession() {
  try {
    if (!studentSession) {
      window.localStorage.removeItem(STUDENT_SESSION_KEY);
      return;
    }

    window.localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(studentSession));
  } catch (error) {
    return;
  }
}

function loadStudentSession() {
  try {
    const stored = window.localStorage.getItem(STUDENT_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function persistDriverSession() {
  try {
    if (!driverSession) {
      window.localStorage.removeItem(DRIVER_SESSION_KEY);
      return;
    }

    window.localStorage.setItem(DRIVER_SESSION_KEY, JSON.stringify(driverSession));
  } catch (error) {
    return;
  }
}

function loadDriverSession() {
  try {
    const stored = window.localStorage.getItem(DRIVER_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function persistStudentPayments() {
  if (!studentSession?.regno) {
    return;
  }

  try {
    window.localStorage.setItem(
      `${LOCAL_STUDENT_PAYMENTS_PREFIX}${String(studentSession.regno).trim().toUpperCase()}`,
      JSON.stringify(studentPayments)
    );
  } catch (error) {
    return;
  }
}

function loadStudentPayments(regno) {
  if (!regno) {
    return createEmptyPayments();
  }

  try {
    const stored = window.localStorage.getItem(
      `${LOCAL_STUDENT_PAYMENTS_PREFIX}${String(regno).trim().toUpperCase()}`
    );
    return stored ? normalizePayments(JSON.parse(stored)) : createEmptyPayments();
  } catch (error) {
    return createEmptyPayments();
  }
}

function loadLocalStudentAccounts() {
  try {
    const stored = window.localStorage.getItem(LOCAL_STUDENT_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
}

function isStudentAuthenticated() {
  return Boolean(studentSession?.regno);
}

function loginLocalStudent(regno, password) {
  const accounts = loadLocalStudentAccounts();
  const account = accounts[String(regno).trim().toUpperCase()];

  if (!account || account.password !== password) {
    return {
      ok: false,
      message: "Shared backend is offline. Use a local account created from the sign up page.",
    };
  }

  studentSession = {
    regno: String(regno).trim().toUpperCase(),
    loggedInAt: new Date().toISOString(),
    mode: "local",
  };
  studentPayments = loadStudentPayments(studentSession.regno);
  currentRole = "student";
  persistRole();
  persistStudentSession();

  return {
    ok: true,
    message: "Logged in using local mode on this device.",
  };
}

function persistDismissedNotificationIds() {
  try {
    window.localStorage.setItem(NOTIFICATION_FILTER_KEY, JSON.stringify(dismissedNotificationIds));
  } catch (error) {
    return;
  }
}

function loadDismissedNotificationIds() {
  try {
    const stored = window.localStorage.getItem(NOTIFICATION_FILTER_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

function startTransportPolling() {
  window.setInterval(() => {
    void pollTransportState();
  }, TRANSPORT_POLL_INTERVAL_MS);
}

async function pollTransportState() {
  if (transportPollingInFlight) {
    return;
  }

  transportPollingInFlight = true;
  try {
    await hydrateRemoteTransportState({ silent: true });
  } finally {
    transportPollingInFlight = false;
  }
}

function startStudentProfilePolling() {
  window.setInterval(() => {
    void pollStudentProfile();
  }, STUDENT_PROFILE_POLL_INTERVAL_MS);
}

async function pollStudentProfile() {
  if (!studentSession?.token || studentProfilePollingInFlight) {
    return;
  }

  studentProfilePollingInFlight = true;
  try {
    await restoreStudentSession();
    renderStudentPayments();
  } finally {
    studentProfilePollingInFlight = false;
  }
}

async function hydrateRemoteTransportState(options = {}) {
  try {
    const payload = await apiRequest("/transport-state");
    backendAvailable = true;
    const previousSnapshot = JSON.stringify(extractTransportState(state));
    applyTransportState(payload.state);
    const nextSnapshot = JSON.stringify(extractTransportState(state));
    if (options.render !== false && previousSnapshot !== nextSnapshot) {
      renderAll();
    }
    return true;
  } catch (error) {
    backendAvailable = false;
    return false;
  }
}

async function restoreStudentSession() {
  if (!studentSession) {
    studentPayments = createEmptyPayments();
    return false;
  }

  if (!studentSession.token) {
    studentPayments = loadStudentPayments(studentSession.regno);
    return true;
  }

  try {
    const payload = await apiRequest("/student-profile", {
      token: studentSession.token,
    });
    backendAvailable = true;
    studentSession = {
      ...studentSession,
      regno: payload.student.regno,
      loggedInAt: payload.student.loggedInAt || studentSession.loggedInAt,
    };
    studentPayments = normalizePayments(payload.payments);
    persistStudentSession();
    return true;
  } catch (error) {
    studentSession = null;
    studentPayments = createEmptyPayments();
    persistStudentSession();
    return false;
  }
}

async function refreshBackendStatus() {
  try {
    await apiRequest("/health");
    backendAvailable = true;
  } catch (error) {
    backendAvailable = false;
  }
}

function scheduleTransportSync() {
  if (transportSyncInFlight) {
    pendingTransportSync = true;
    return;
  }

  transportSyncInFlight = true;
  void flushTransportSync();
}

async function flushTransportSync() {
  try {
    do {
      pendingTransportSync = false;
      await syncTransportStateToServer();
    } while (pendingTransportSync);
  } finally {
    transportSyncInFlight = false;
  }
}

async function syncTransportStateToServer() {
  try {
    const payload = await apiRequest("/transport-state", {
      method: "PUT",
      body: { state: extractTransportState(state) },
    });
    applyTransportState(payload.state);
  } catch (error) {
    return;
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.register("./sw.js").catch(() => {
    return;
  });
}

function bindInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    renderInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    renderInstallButton();
  });
}

function getInstallExperience() {
  const ua = navigator.userAgent || "";
  const isTouchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || isTouchMac;
  const isAndroid = /Android/i.test(ua);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  if (isStandalone) {
    return {
      heading: "App installed",
      status: "The VIT shuttle app is already added to this device home screen.",
      guide: "Open it directly from the home screen for the full app-style experience.",
      buttonLabel: "Installed",
      buttonDisabled: true,
      hideButton: false,
      fallbackToast: "This app is already installed on the device.",
    };
  }

  if (isIOS) {
    return {
      heading: "Install on iPhone",
      status: "iPhone does not use a pop-up install prompt for this app.",
      guide: "Open this page in Safari, tap Share, then choose Add to Home Screen.",
      buttonLabel: "Use Safari Install",
      buttonDisabled: true,
      hideButton: false,
      fallbackToast: "On iPhone, open Safari and use Share > Add to Home Screen.",
    };
  }

  if (isAndroid) {
    return {
      heading: "Install on Android",
      status: deferredInstallPrompt
        ? "This device can install the app directly from the browser."
        : "If the install button is unavailable, open this page in Chrome and use Install app or Add to Home screen.",
      guide: deferredInstallPrompt
        ? "Tap Install App to add the shuttle tracker to the Android home screen."
        : "Chrome provides the best install flow for Android users.",
      buttonLabel: "Install App",
      buttonDisabled: deferredInstallPrompt === null,
      hideButton: false,
      fallbackToast: "Open this page in Chrome and use Install app or Add to Home screen.",
    };
  }

  return {
    heading: "Install on mobile",
    status: deferredInstallPrompt
      ? "This browser can install the app directly."
      : "Use Android Chrome or iPhone Safari for the best install experience.",
    guide: "Android supports one-tap install. On iPhone, use Safari Share > Add to Home Screen.",
    buttonLabel: "Install App",
    buttonDisabled: deferredInstallPrompt === null,
    hideButton: false,
    fallbackToast: "Use Android Chrome or iPhone Safari to install this app on mobile.",
  };
}

async function initializeGoogleIntegrations() {
  if (!APP_CONFIG.googleMapsApiKey) {
    return;
  }

  try {
    await loadScript(
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(APP_CONFIG.googleMapsApiKey)}&libraries=places`
    );
    googleMapsReady = Boolean(globalThis.google?.maps);
    if (googleMapsReady) {
      directionsService = new google.maps.DirectionsService();
    }
  } catch (error) {
    googleMapsReady = false;
  }
}

async function computeGoogleDirectionsEta(origin, destination) {
  try {
    const result = await new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK") {
            resolve(response);
            return;
          }
          reject(new Error(String(status)));
        }
      );
    });

    const seconds = result.routes?.[0]?.legs?.[0]?.duration?.value;
    if (Number.isFinite(seconds)) {
      return Math.max(1, Math.round(seconds / 60));
    }
  } catch (error) {
    return null;
  }

  return null;
}

function estimateFallbackEta(originLat, originLng, destinationLat, destinationLng) {
  const distanceKm = haversineDistance(originLat, originLng, destinationLat, destinationLng);
  return Math.max(1, Math.round((distanceKm / DEFAULT_SPEED_KMH) * 60));
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function getBus(busId) {
  return state.buses.find((bus) => bus.id === busId) ?? null;
}

function getStopConfig(stopName) {
  return stopCatalog[stopName] ?? {
    query: `${stopName}, VIT Vellore, Tamil Nadu`,
    lat: null,
    lng: null,
  };
}

function getBusTrackingPoint(bus) {
  if (bus.currentLat != null && bus.currentLng != null) {
    return {
      lat: Number(bus.currentLat),
      lng: Number(bus.currentLng),
      label: bus.currentLocationLabel || "Live GPS position",
    };
  }

  const fallbackStop = getStopConfig(bus.currentLocationLabel || bus.nextStop);
  if (fallbackStop.lat == null || fallbackStop.lng == null) {
    return null;
  }

  return {
    lat: fallbackStop.lat,
    lng: fallbackStop.lng,
    label: bus.currentLocationLabel || bus.nextStop,
  };
}

function formatDistance(distanceKm) {
  if (!Number.isFinite(distanceKm)) {
    return "an unknown distance";
  }

  if (distanceKm < 1) {
    return `${Math.max(1, Math.round(distanceKm * 1000))} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

function createBus(overrides) {
  return {
    id: "",
    code: "",
    shuttleNumber: "",
    routeName: "",
    driver: "",
    status: "On Time",
    etaMinutes: 0,
    etaProvider: "Schedule",
    nextStop: "Main Gate",
    totalSeats: 40,
    availableSeats: 40,
    note: "",
    routePath: [],
    currentLocationLabel: "VIT Campus",
    currentLat: null,
    currentLng: null,
    sensorProvider: "Demo",
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function normalizeState(value) {
  const base = cloneData(defaultState);
  return {
    ...base,
    ...value,
    version: STATE_VERSION,
    buses: Array.isArray(value.buses)
      ? value.buses.map((bus, index) => createBus({ ...base.buses[index % base.buses.length], ...bus }))
      : base.buses,
    notifications: Array.isArray(value.notifications) ? value.notifications : base.notifications,
    payments: {
      ...base.payments,
      ...(value.payments || {}),
      history: Array.isArray(value.payments?.history) ? value.payments.history : base.payments.history,
    },
  };
}

function normalizeTransportState(value) {
  return normalizeState({
    ...value,
    payments: createEmptyPayments(),
  });
}

function normalizePayments(value) {
  const base = createEmptyPayments();
  return {
    ...base,
    ...(value || {}),
    totalDue: Number(value?.totalDue) || 0,
    rideCount: Number(value?.rideCount) || 0,
    history: Array.isArray(value?.history) ? value.history : [],
  };
}

function extractTransportState(value) {
  return {
    version: STATE_VERSION,
    buses: value.buses,
    notifications: value.notifications,
  };
}

function applyTransportState(nextState) {
  state = normalizeTransportState(nextState);
  if (!getBus(selectedBusId)) {
    selectedBusId = state.buses[0]?.id ?? null;
  }

  const activeNotificationIds = new Set(state.notifications.map((notification) => notification.id));
  dismissedNotificationIds = dismissedNotificationIds.filter((notificationId) =>
    activeNotificationIds.has(notificationId)
  );
  persistDismissedNotificationIds();
  persistState();
}

function normalizeConfig(config) {
  return {
    googleMapsApiKey: String(config.googleMapsApiKey || "").trim(),
    routesProxyEndpoint: String(config.routesProxyEndpoint || "").trim(),
    capacitySensorEndpoint: String(config.capacitySensorEndpoint || "").trim(),
  };
}

function notificationFactory(busId, title, message) {
  return {
    id: `${busId}-${safeId()}`,
    busId,
    title,
    message,
    createdAt: new Date().toISOString(),
  };
}

function showToast(message) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeoutId);
  toastTimeoutId = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

function formatTimestamp(isoString) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(isoString));
}

function updateClock() {
  refs.liveClock.textContent = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function isoNow(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString();
}

function cloneData(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function safeId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function buildMapEmbedUrl(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

function buildGoogleMapsUrl(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
}

async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };
  const token = options.token || studentSession?.token;

  if (token) {
    headers["X-Session-Token"] = token;
  }

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
    backendAvailable = false;
    throw new Error(getBackendUnavailableMessage());
  }

  const payload = await response.json().catch(() => ({}));
  backendAvailable = true;

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

function getBackendUnavailableMessage() {
  return "Shared backend offline. Start server.py for multi-device sync, or use local mode on this device.";
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
