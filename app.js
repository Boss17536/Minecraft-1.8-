/**
 * CM CLIENT 1.8.8 WEB EDITION
 * Core Runtime & Interface Orchestrator
 */

// Default configuration
const CM_CONFIG_KEY = "cmclient_web_config";
const defaultConfig = {
  username: "Player" + Math.floor(1000 + Math.random() * 9000),
  fov: 90,
  renderDistance: 8,
  maxFps: 240,
  volume: 100,
  sensitivity: 100,
  mods: {
    keystrokes: true,
    cps: true,
    sprint: true,
    armor: true,
    fps: true,
    fullbright: true,
    blockhit: true,
    dynamicFov: true,
    fastRender: true
  },
  activePack: "Dewiers-20k-Resource-Pack-16x-1.8.9.zip"
};

let config = loadConfig();

// CPS Tracking State
let leftClicks = [];
let rightClicks = [];

document.addEventListener("DOMContentLoaded", () => {
  initUI();
  initEventListeners();
  initInputListeners();
});

function loadConfig() {
  try {
    const saved = localStorage.getItem(CM_CONFIG_KEY);
    if (saved) {
      return { ...defaultConfig, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Could not load config from localStorage", e);
  }
  return { ...defaultConfig };
}

function saveConfig() {
  try {
    localStorage.setItem(CM_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save config", e);
  }
}

function initUI() {
  const usernameInput = document.getElementById("player-username");
  const returningCard = document.getElementById("returning-user-card");
  const inputGroup = document.getElementById("player-input-group");
  const displaySavedName = document.getElementById("display-saved-name");

  // Check if player previously set their username
  const hasSavedProfile = localStorage.getItem("cmclient_has_saved_profile");
  if (hasSavedProfile && config.username) {
    if (returningCard) returningCard.classList.remove("hidden");
    if (inputGroup) inputGroup.classList.add("hidden");
    if (displaySavedName) displaySavedName.textContent = config.username;
  } else {
    if (returningCard) returningCard.classList.add("hidden");
    if (inputGroup) inputGroup.classList.remove("hidden");
  }

  if (usernameInput) {
    usernameInput.value = config.username;
    updateSkinPreview(config.username);
  }

  // Update quick toggle pills
  document.querySelectorAll(".toggle-pill").forEach(pill => {
    const mod = pill.dataset.mod;
    if (config.mods[mod]) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });

  // Update settings inputs
  document.getElementById("set-fov").value = config.fov;
  document.getElementById("fov-display-val").textContent = config.fov === 110 ? "110 (Quake Pro)" : config.fov;
  document.getElementById("set-render-distance").value = config.renderDistance;
  document.getElementById("render-display-val").textContent = `${config.renderDistance} Chunks`;
  document.getElementById("set-max-fps").value = config.maxFps;
  document.getElementById("fps-display-val").textContent = config.maxFps === 240 ? "Unlimited" : `${config.maxFps} FPS`;

  document.getElementById("set-keystrokes").checked = config.mods.keystrokes;
  document.getElementById("set-cps").checked = config.mods.cps;
  document.getElementById("set-sprint").checked = config.mods.sprint;
  document.getElementById("set-armor").checked = config.mods.armor;
  document.getElementById("set-fullbright").checked = config.mods.fullbright;
  document.getElementById("set-blockhit").checked = config.mods.blockhit;
}

function updateSkinPreview(username) {
  const cleanName = username.trim() || "Steve";
  const preview = document.getElementById("skin-preview");
  if (preview) {
    preview.src = `https://mc-heads.net/avatar/${encodeURIComponent(cleanName)}/100`;
  }
}

function initEventListeners() {
  const usernameInput = document.getElementById("player-username");
  const returningCard = document.getElementById("returning-user-card");
  const inputGroup = document.getElementById("player-input-group");
  const displaySavedName = document.getElementById("display-saved-name");
  const btnSwitch = document.getElementById("btn-switch-account");

  // Switch account button
  if (btnSwitch) {
    btnSwitch.addEventListener("click", () => {
      returningCard.classList.add("hidden");
      inputGroup.classList.remove("hidden");
      usernameInput.focus();
      usernameInput.select();
    });
  }

  // Username updates - saves immediately to avoid asking again
  usernameInput.addEventListener("input", (e) => {
    config.username = e.target.value.trim() || "Player";
    localStorage.setItem("cmclient_has_saved_profile", "true");
    saveConfig();
    updateSkinPreview(config.username);
    if (displaySavedName) displaySavedName.textContent = config.username;
  });

  // Enter button inside username box
  const btnEnter = document.getElementById("btn-enter-game");
  if (btnEnter) {
    btnEnter.addEventListener("click", () => {
      launchGame({ mode: "multiplayer" });
    });
  }

  // Pressing Enter key on physical keyboard in username input
  usernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      launchGame({ mode: "multiplayer" });
    }
  });

  // Random Name generator
  document.getElementById("btn-random-name").addEventListener("click", () => {
    const prefixes = ["Speedy", "Shadow", "Ninja", "Combo", "Void", "Blaze", "Frost", "Ghost"];
    const randomName = prefixes[Math.floor(Math.random() * prefixes.length)] + "_" + Math.floor(100 + Math.random() * 900);
    usernameInput.value = randomName;
    config.username = randomName;
    localStorage.setItem("cmclient_has_saved_profile", "true");
    saveConfig();
    updateSkinPreview(randomName);
    if (displaySavedName) displaySavedName.textContent = randomName;
  });

  // Quick toggles
  document.querySelectorAll(".toggle-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const mod = pill.dataset.mod;
      config.mods[mod] = !config.mods[mod];
      pill.classList.toggle("active", config.mods[mod]);
      saveConfig();
      applyHudVisibility();
    });
  });

  // Modal navigation
  document.getElementById("btn-open-settings").addEventListener("click", () => openModal("modal-settings"));
  document.getElementById("btn-open-packs").addEventListener("click", () => openModal("modal-packs"));
  document.getElementById("btn-game-settings").addEventListener("click", () => openModal("modal-settings"));

  document.querySelectorAll(".btn-close-modal").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.target));
  });

  // Settings Tabs
  document.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.remove("hidden");
    });
  });

  // FOV Slider
  const fovSlider = document.getElementById("set-fov");
  fovSlider.addEventListener("input", (e) => {
    config.fov = parseInt(e.target.value);
    document.getElementById("fov-display-val").textContent = config.fov === 110 ? "110 (Quake Pro)" : config.fov;
  });

  // Render Distance Slider
  const renderSlider = document.getElementById("set-render-distance");
  renderSlider.addEventListener("input", (e) => {
    config.renderDistance = parseInt(e.target.value);
    document.getElementById("render-display-val").textContent = `${config.renderDistance} Chunks`;
  });

  // Save Settings Modal Button
  document.getElementById("btn-save-settings").addEventListener("click", () => {
    config.mods.keystrokes = document.getElementById("set-keystrokes").checked;
    config.mods.cps = document.getElementById("set-cps").checked;
    config.mods.sprint = document.getElementById("set-sprint").checked;
    config.mods.armor = document.getElementById("set-armor").checked;
    config.mods.fullbright = document.getElementById("set-fullbright").checked;
    config.mods.blockhit = document.getElementById("set-blockhit").checked;
    saveConfig();
    closeModal("modal-settings");
    applyHudVisibility();
  });

  // Singleplayer Launch
  document.getElementById("btn-launch-sp").addEventListener("click", () => {
    launchGame({ mode: "singleplayer" });
  });

  // Multiplayer Launch
  document.getElementById("btn-launch-mp").addEventListener("click", () => {
    launchGame({ mode: "multiplayer" });
  });

  // Server Card Connect Buttons
  document.querySelectorAll(".btn-connect[data-ip]").forEach(btn => {
    btn.addEventListener("click", () => {
      launchGame({ mode: "server", server: btn.dataset.ip });
    });
  });

  // Custom Server Connect
  document.getElementById("btn-connect-custom").addEventListener("click", () => {
    const ip = document.getElementById("custom-server-ip").value.trim();
    if (!ip) {
      alert("Please enter a valid WebSocket server address (e.g., ws://localhost:8081 or wss://mc.arch.lol/)");
      return;
    }
    launchGame({ mode: "server", server: ip });
  });

  // Fullscreen button
  document.getElementById("btn-fullscreen").addEventListener("click", () => {
    const container = document.getElementById("game-view");
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen().catch(err => console.log(err));
    }
  });

  // Exit Game
  document.getElementById("btn-exit-game").addEventListener("click", () => {
    const frame = document.getElementById("game-frame");
    frame.src = "about:blank";
    document.getElementById("game-view").classList.add("hidden");
    document.getElementById("launcher-view").classList.remove("hidden");
  });

  // Resource pack drag & drop
  const dropZone = document.getElementById("drop-pack-zone");
  const fileInput = document.getElementById("file-pack-input");

  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleResourcePackUpload(e.target.files[0]);
    }
  });

  // Pack selection toggles
  document.querySelectorAll(".btn-toggle-pack").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const packId = btn.dataset.packId;
      document.querySelectorAll(".pack-item").forEach(p => p.classList.remove("active"));
      const target = document.getElementById(packId);
      if (target) {
        target.classList.add("active");
        config.activePack = target.dataset.pack;
        saveConfig();
        alert(`Activated: ${config.activePack}`);
      }
    });
  });
}

function handleResourcePackUpload(file) {
  if (!file.name.endsWith(".zip")) {
    alert("Resource pack must be a .zip file!");
    return;
  }
  alert(`Loaded pack: ${file.name}! This pack will be synchronized into your 1.8.8 Web Client storage.`);
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

function applyHudVisibility() {
  document.getElementById("hud-keystrokes").style.display = config.mods.keystrokes ? "flex" : "none";
  document.getElementById("hud-cps").style.display = config.mods.cps ? "block" : "none";
  document.getElementById("hud-sprint").style.display = config.mods.sprint ? "block" : "none";
  document.getElementById("hud-armor").style.display = config.mods.armor ? "flex" : "none";
}

function launchGame(params) {
  const launcher = document.getElementById("launcher-view");
  const gameView = document.getElementById("game-view");
  const playerDisplay = document.getElementById("game-player-display");
  const gameFrame = document.getElementById("game-frame");

  launcher.classList.add("hidden");
  gameView.classList.remove("hidden");
  playerDisplay.textContent = config.username;

  applyHudVisibility();

  // Point to the browser 1.8 client bundle
  // Query parameters pass username, FOV, and target server
  let clientUrl = `client/index.html?username=${encodeURIComponent(config.username)}&fov=${config.fov}`;
  if (params.server) {
    clientUrl += `&server=${encodeURIComponent(params.server)}`;
  }

  gameFrame.src = clientUrl;
}

function initInputListeners() {
  // Key state map for Keystrokes HUD
  const keyMap = {
    KeyW: "key-w",
    KeyA: "key-a",
    KeyS: "key-s",
    KeyD: "key-d",
    Space: "key-space"
  };

  window.addEventListener("keydown", (e) => {
    const id = keyMap[e.code];
    if (id) {
      const el = document.getElementById(id);
      if (el) el.classList.add("active");
    }
  });

  window.addEventListener("keyup", (e) => {
    const id = keyMap[e.code];
    if (id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove("active");
    }
  });

  // Mouse clicks for CPS counter & LMB/RMB keys
  window.addEventListener("mousedown", (e) => {
    const now = performance.now();
    if (e.button === 0) {
      leftClicks.push(now);
      const lmb = document.getElementById("key-lmb");
      if (lmb) lmb.classList.add("active");
    } else if (e.button === 2) {
      rightClicks.push(now);
      const rmb = document.getElementById("key-rmb");
      if (rmb) rmb.classList.add("active");
    }
    updateCps();
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      const lmb = document.getElementById("key-lmb");
      if (lmb) lmb.classList.remove("active");
    } else if (e.button === 2) {
      const rmb = document.getElementById("key-rmb");
      if (rmb) rmb.classList.remove("active");
    }
  });

  // Listen for forwarded in-game inputs from the game frame
  window.addEventListener("message", (e) => {
    if (!e.data || !e.data.type) return;
    
    if (e.data.type === "cm_keydown") {
      const id = keyMap[e.data.code];
      if (id) {
        const el = document.getElementById(id);
        if (el) el.classList.add("active");
      }
      if (e.data.code === "ControlLeft" || e.data.code === "KeyR") {
        const sprintEl = document.getElementById("hud-sprint");
        if (sprintEl) sprintEl.textContent = "[Sprinting (CM Client Active)]";
      }
    } else if (e.data.type === "cm_keyup") {
      const id = keyMap[e.data.code];
      if (id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove("active");
      }
    } else if (e.data.type === "cm_mousedown") {
      const now = performance.now();
      if (e.data.button === 0) {
        leftClicks.push(now);
        const lmb = document.getElementById("key-lmb");
        if (lmb) lmb.classList.add("active");
      } else if (e.data.button === 2) {
        rightClicks.push(now);
        const rmb = document.getElementById("key-rmb");
        if (rmb) rmb.classList.add("active");
      }
      updateCps();
    } else if (e.data.type === "cm_mouseup") {
      if (e.data.button === 0) {
        const lmb = document.getElementById("key-lmb");
        if (lmb) lmb.classList.remove("active");
      } else if (e.data.button === 2) {
        const rmb = document.getElementById("key-rmb");
        if (rmb) rmb.classList.remove("active");
      }
    }
  });

  // Real-time FPS Monitor
  let frameCount = 0;
  let lastTime = performance.now();
  function measureFps(currentTime) {
    frameCount++;
    if (currentTime - lastTime >= 1000) {
      const fpsEl = document.getElementById("hud-fps-val");
      if (fpsEl) fpsEl.textContent = frameCount;
      frameCount = 0;
      lastTime = currentTime;
    }
    requestAnimationFrame(measureFps);
  }
  requestAnimationFrame(measureFps);

  // Update CPS calculations every 100ms
  setInterval(updateCps, 100);
}

function updateCps() {
  const oneSecAgo = performance.now() - 1000;
  leftClicks = leftClicks.filter(t => t > oneSecAgo);
  rightClicks = rightClicks.filter(t => t > oneSecAgo);

  const lmbCount = leftClicks.length;
  const rmbCount = rightClicks.length;

  const cpsLmb = document.getElementById("cps-lmb");
  const cpsRmb = document.getElementById("cps-rmb");
  const cpsVal = document.getElementById("hud-cps-val");

  if (cpsLmb) cpsLmb.textContent = lmbCount;
  if (cpsRmb) cpsRmb.textContent = rmbCount;
  if (cpsVal) cpsVal.textContent = lmbCount;
}
