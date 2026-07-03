// script.js
// BB Hub Ver.1.1

let currentLang = localStorage.getItem("bbhub_lang") || "ja";
let state = JSON.parse(localStorage.getItem("bbhub_state")) || {};
let timerInterval = null;

const STORAGE_KEY = "bbhub_state";
const LANG_KEY = "bbhub_lang";

document.addEventListener("DOMContentLoaded", () => {
  initializeState();
  renderApps();
  applyLanguage();
  updateAllProgress();
  startTimerLoop();

  document.getElementById("resetBtn").addEventListener("click", resetToday);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem(LANG_KEY, currentLang);
      applyLanguage();
    });
  });
});

function initializeState() {
  const today = getTodayKey();

  if (!state.date || state.date !== today) {
    state = {
      date: today,
      apps: {}
    };
  }

  APPS.forEach((app) => {
    if (!state.apps[app.id]) state.apps[app.id] = {};

    app.missions.forEach((mission) => {
      if (!state.apps[app.id][mission.id]) {
        state.apps[app.id][mission.id] = {
          done: false,
          count: 0,
          cooldownStart: null,
          hourlyCount: 0
        };
      }
    });
  });

  saveState();
}

function renderApps() {
  const appList = document.getElementById("appList");
  appList.innerHTML = "";

  APPS.forEach((app) => {
    const card = document.createElement("article");
    card.className = "app-card";
    card.id = `card-${app.id}`;

    card.innerHTML = `
      <div class="app-header">
        <h3 class="app-title">${app.name}</h3>
        <div class="app-progress" id="progress-${app.id}">0 / 0</div>
      </div>
      <div class="missions" id="missions-${app.id}"></div>
    `;

    appList.appendChild(card);

    const missionArea = document.getElementById(`missions-${app.id}`);

    app.missions.forEach((mission) => {
      const missionEl = document.createElement("div");
      missionEl.className = "mission";
      missionEl.id = `mission-${app.id}-${mission.id}`;

      if (mission.type === "check") {
        missionEl.innerHTML = `
          <label class="mission-left">
            <input
              type="checkbox"
              id="${app.id}-${mission.id}"
              ${state.apps[app.id][mission.id].done ? "checked" : ""}
            />
            <span data-i18n="${mission.labelKey}">${t(mission.labelKey)}</span>
          </label>
          <span class="mission-status" id="status-${app.id}-${mission.id}"></span>
        `;

        missionArea.appendChild(missionEl);

        document
          .getElementById(`${app.id}-${mission.id}`)
          .addEventListener("change", (e) => {
            state.apps[app.id][mission.id].done = e.target.checked;
            saveState();
            updateAllProgress();
          });
      }

      if (mission.type === "counter") {
        missionEl.innerHTML = `
          <div class="mission-left">
            <span data-i18n="${mission.labelKey}">${t(mission.labelKey)}</span>
          </div>
          <div class="counter">
            <button type="button" data-action="minus">−</button>
            <span class="counter-value" id="count-${app.id}-${mission.id}">
              ${state.apps[app.id][mission.id].count} / ${mission.max}
            </span>
            <button type="button" data-action="plus">＋</button>
          </div>
        `;

        missionArea.appendChild(missionEl);

        const minusBtn = missionEl.querySelector('[data-action="minus"]');
        const plusBtn = missionEl.querySelector('[data-action="plus"]');

        minusBtn.addEventListener("click", () => {
          updateCounter(app, mission, -1);
        });

        plusBtn.addEventListener("click", () => {
          updateCounter(app, mission, 1);
        });

        if (mission.cooldownMinutes) {
          const timerEl = document.createElement("div");
          timerEl.className = "timer";
          timerEl.id = `timer-${app.id}-${mission.id}`;
          missionArea.appendChild(timerEl);
        }
      }
    });
  });
}

function updateCounter(app, mission, amount) {
  const missionState = state.apps[app.id][mission.id];

  if (amount > 0 && mission.hourlyLimit) {
    const now = Date.now();

    if (!missionState.cooldownStart) {
      missionState.cooldownStart = now;
      missionState.hourlyCount = 0;
    }

    const elapsed = now - missionState.cooldownStart;
    const cooldownMs = mission.cooldownMinutes * 60 * 1000;

    if (elapsed >= cooldownMs) {
      missionState.cooldownStart = now;
      missionState.hourlyCount = 0;
    }

    if (missionState.hourlyCount >= mission.hourlyLimit) {
      saveState();
      updateAllProgress();
      return;
    }

    missionState.hourlyCount += 1;
  }

  missionState.count += amount;

  if (missionState.count < 0) missionState.count = 0;
  if (missionState.count > mission.max) missionState.count = mission.max;

  missionState.done = missionState.count >= mission.max;

  saveState();
  updateAllProgress();
}

function updateAllProgress() {
  let total = 0;
  let completed = 0;

  APPS.forEach((app) => {
    let appTotal = 0;
    let appCompleted = 0;

    app.missions.forEach((mission) => {
      total++;
      appTotal++;

      const missionState = state.apps[app.id][mission.id];
      const isDone =
        mission.type === "check"
          ? missionState.done
          : missionState.count >= mission.max;

      if (isDone) {
        completed++;
        appCompleted++;
      }

      updateMissionUI(app, mission, isDone);
    });

    document.getElementById(
      `progress-${app.id}`
    ).textContent = `${appCompleted} / ${appTotal}`;

    const card = document.getElementById(`card-${app.id}`);
    card.classList.toggle("completed-card", appCompleted === appTotal);
  });

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const remaining = total - completed;

  document.getElementById("totalProgressText").textContent = `${completed} / ${total}`;
  document.getElementById("totalPercent").textContent = `${percent}%`;
  document.getElementById("totalProgressBar").style.width = `${percent}%`;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("remainingCount").textContent = remaining;
}

function updateMissionUI(app, mission, isDone) {
  const missionState = state.apps[app.id][mission.id];

  if (mission.type === "counter") {
    const countEl = document.getElementById(`count-${app.id}-${mission.id}`);
    if (countEl) {
      countEl.textContent = `${missionState.count} / ${mission.max}`;
    }
  }

  const missionEl = document.getElementById(`mission-${app.id}-${mission.id}`);
  if (missionEl) {
    missionEl.classList.toggle("complete", isDone);
  }

  const statusEl = document.getElementById(`status-${app.id}-${mission.id}`);
  if (statusEl) {
    statusEl.textContent = isDone ? "✓" : "";
  }

  if (mission.cooldownMinutes) {
    updateTimer(app, mission);
  }
}

function updateTimer(app, mission) {
  const timerEl = document.getElementById(`timer-${app.id}-${mission.id}`);
  if (!timerEl) return;

  const missionState = state.apps[app.id][mission.id];

  if (!missionState.cooldownStart) {
    timerEl.textContent = `${t("timer.limit")} / ${t("timer.ready")}`;
    timerEl.classList.add("ready");
    return;
  }

  const now = Date.now();
  const cooldownMs = mission.cooldownMinutes * 60 * 1000;
  const elapsed = now - missionState.cooldownStart;
  const remaining = cooldownMs - elapsed;

  if (remaining <= 0 || missionState.hourlyCount < mission.hourlyLimit) {
    timerEl.textContent = `${t("timer.limit")} / ${t("timer.ready")}`;
    timerEl.classList.add("ready");

    if (remaining <= 0) {
      missionState.cooldownStart = null;
      missionState.hourlyCount = 0;
      saveState();
    }

    return;
  }

  timerEl.classList.remove("ready");
  timerEl.textContent = `${t("timer.cooldown")} ${formatTime(remaining)}`;
}

function startTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    APPS.forEach((app) => {
      app.missions.forEach((mission) => {
        if (mission.cooldownMinutes) {
          updateTimer(app, mission);
        }
      });
    });
  }, 1000);
}

function applyLanguage() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  updateAllProgress();
}

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.ja[key] || key;
}

function resetToday() {
  const ok = confirm(t("button.reset"));
  if (!ok) return;

  state = {
    date: getTodayKey(),
    apps: {}
  };

  initializeState();
  renderApps();
  applyLanguage();
  updateAllProgress();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}
