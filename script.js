// script.js
// BB Hub Ver.1.1 FINAL

const STORAGE_KEY = "bbhub_v11_state";
const LANG_KEY = "bbhub_v11_lang";

let currentLang = localStorage.getItem(LANG_KEY) || "ja";
let state = loadState();
let timerInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  prepareState();
  renderApps();
  bindLanguageButtons();
  applyLanguage();
  updateAll();
  startTimerLoop();
});

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function prepareState() {
  const today = todayKey();

  if (!state.date || state.date !== today) {
    state = {
      date: today,
      apps: {}
    };
  }

  APPS.forEach((app) => {
    if (!state.apps[app.id]) {
      state.apps[app.id] = {};
    }

    app.missions.forEach((mission) => {
      if (!state.apps[app.id][mission.id]) {
        state.apps[app.id][mission.id] = {
          done: false,
          count: 0,
          hourCount: 0,
          hourStartedAt: null
        };
      }
    });
  });

  saveState();
}

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.ja?.[key] || key;
}

function bindLanguageButtons() {
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => {
      currentLang = button.dataset.lang;
      localStorage.setItem(LANG_KEY, currentLang);
      applyLanguage();
      updateAll();
    });
  });
}



function applyLanguage() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = t(key);
  });
}
function renderApps() {
  const appList = document.getElementById("appList");
  if (!appList) return;

  appList.innerHTML = "";

  APPS.forEach((app) => {
    const card = document.createElement("article");
    card.className = "app-card";
    card.id = `app-${app.id}`;

    card.innerHTML = `
  <div class="app-header">
    <div class="app-title-wrap">
      <span class="app-icon">${app.icon || ""}</span>
      <h3 class="app-title">${app.name}</h3>
    </div>

    <div class="app-progress" id="appProgress-${app.id}">0 / 0</div>
  </div>

  <div class="deadline-box" id="deadline-${app.id}">
    <span class="deadline-label" data-i18n="deadline.label">${t("deadline.label")}</span>
    <strong class="deadline-time" id="deadlineTime-${app.id}">--</strong>
  </div>

  <div class="mission-list" id="missionList-${app.id}"></div>
`;
    appList.appendChild(card);

    const missionList = document.getElementById(`missionList-${app.id}`);

    app.missions.forEach((mission) => {
      const missionElement = document.createElement("div");
      missionElement.className = "mission";
      missionElement.id = `mission-${app.id}-${mission.id}`;

      if (mission.type === "check") {
        missionElement.innerHTML = `
          <label class="mission-left">
            <input
              type="checkbox"
              id="input-${app.id}-${mission.id}"
              ${state.apps[app.id][mission.id].done ? "checked" : ""}
            />
            <span data-i18n="${mission.labelKey}">${t(mission.labelKey)}</span>
          </label>
          <span class="mission-checkmark" id="checkmark-${app.id}-${mission.id}"></span>
        `;

        missionList.appendChild(missionElement);

        const checkbox = document.getElementById(`input-${app.id}-${mission.id}`);
        checkbox.addEventListener("change", () => {
          state.apps[app.id][mission.id].done = checkbox.checked;
          saveState();
          updateAll();
        });
      }

           if (mission.type === "counter") {
        missionElement.classList.add("mission-counter");

        missionElement.innerHTML = `
          <div class="counter-panel">
            <div class="counter-label" data-i18n="${mission.labelKey}">
              ${t(mission.labelKey)}
            </div>

            <div class="counter-progress">
              <div
                class="counter-progress-fill"
                id="counterProgress-${app.id}-${mission.id}">
              </div>
            </div>

            <div class="counter-bottom">
              <button type="button" aria-label="minus" data-action="minus">−</button>

              <span class="counter-value" id="counter-${app.id}-${mission.id}">
                0 / ${mission.max}
              </span>

              <button type="button" aria-label="plus" data-action="plus">＋</button>
            </div>
          </div>
        `;

        missionList.appendChild(missionElement);

        const minusButton = missionElement.querySelector('[data-action="minus"]');
        const plusButton = missionElement.querySelector('[data-action="plus"]');

        minusButton.addEventListener("click", () => {
          changeCounter(app, mission, -1);
        });

        plusButton.addEventListener("click", () => {
          changeCounter(app, mission, 1);
        });

        if (mission.hourlyLimit && mission.cooldownMinutes) {
          const timerBox = document.createElement("div");
          timerBox.className = "timer";
          timerBox.id = `timer-${app.id}-${mission.id}`;
          timerBox.textContent = t("timer.ready");
          missionList.appendChild(timerBox);
        }
      }
    });
  });
}

function changeCounter(app, mission, amount) {
  const missionState = state.apps[app.id][mission.id];

  if (amount > 0 && mission.hourlyLimit && mission.cooldownMinutes) {
    const canAdd = handleHourlyLimit(missionState, mission);

    if (!canAdd) {
      updateAll();
      return;
    }
  }

  missionState.count += amount;

  if (missionState.count < 0) {
    missionState.count = 0;
  }

  if (missionState.count > mission.max) {
    missionState.count = mission.max;
  }

  missionState.done = missionState.count >= mission.max;

  saveState();
  updateAll();
}

function handleHourlyLimit(missionState, mission) {
  const now = Date.now();
  const cooldownMs = mission.cooldownMinutes * 60 * 1000;

  if (!missionState.hourStartedAt) {
    missionState.hourStartedAt = now;
    missionState.hourCount = 0;
  }

  const elapsed = now - missionState.hourStartedAt;

  if (elapsed >= cooldownMs) {
    missionState.hourStartedAt = now;
    missionState.hourCount = 0;
  }

  if (missionState.hourCount >= mission.hourlyLimit) {
    return false;
  }

  missionState.hourCount += 1;
  return true;
}
function updateAll() {
  prepareState();

  let totalMissions = 0;
  let completedMissions = 0;

  APPS.forEach((app) => {
    let appTotal = 0;
    let appCompleted = 0;

    app.missions.forEach((mission) => {
      totalMissions++;
      appTotal++;

      const missionState = state.apps[app.id][mission.id];
      const completed = isMissionComplete(missionState, mission);

      if (completed) {
        completedMissions++;
        appCompleted++;
      }

      updateMissionDisplay(app, mission, missionState, completed);
    });

    updateAppDisplay(app, appCompleted, appTotal);
    updateDeadlineDisplay(app);
  });

  updateSummaryDisplay(completedMissions, totalMissions);
  updateCompleteMessage(completedMissions, totalMissions);

  saveState();
}

function isMissionComplete(missionState, mission) {
  if (mission.type === "check") {
    return missionState.done === true;
  }

  if (mission.type === "counter") {
    return missionState.count >= mission.max;
  }

  return false;
}

function updateMissionDisplay(app, mission, missionState, completed) {
  const missionElement = document.getElementById(`mission-${app.id}-${mission.id}`);

  if (missionElement) {
    missionElement.classList.toggle("complete", completed);
  }

  if (mission.type === "check") {
    const checkbox = document.getElementById(`input-${app.id}-${mission.id}`);
    const checkmark = document.getElementById(`checkmark-${app.id}-${mission.id}`);

    if (checkbox) {
      checkbox.checked = missionState.done;
    }

    if (checkmark) {
      checkmark.textContent = completed ? "✓" : "";
    }
  }

  if (mission.type === "counter") {
    const counter = document.getElementById(`counter-${app.id}-${mission.id}`);

   if (counter) {
  counter.textContent = `${missionState.count} / ${mission.max}`;
}

const counterProgress = document.getElementById(
  `counterProgress-${app.id}-${mission.id}`
);

if (counterProgress) {
  const percent = mission.max === 0
    ? 0
    : Math.min(100, Math.round((missionState.count / mission.max) * 100));

  counterProgress.style.width = `${percent}%`;
}
  }

  if (mission.hourlyLimit && mission.cooldownMinutes) {
    updateTimerDisplay(app, mission, missionState);
  }
}

function updateAppDisplay(app, completed, total) {
  const progress = document.getElementById(`appProgress-${app.id}`);
  const card = document.getElementById(`app-${app.id}`);

  if (progress) {
    progress.textContent = `${completed} / ${total}`;
  }

  if (card) {
    card.classList.toggle("completed-card", completed === total);
  }
}

function updateSummaryDisplay(completed, total) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const remaining = total - completed;

  const totalProgressText = document.getElementById("totalProgressText");
  const totalPercent = document.getElementById("totalPercent");
  const totalProgressBar = document.getElementById("totalProgressBar");
  const completedCount = document.getElementById("completedCount");
  const remainingCount = document.getElementById("remainingCount");

  if (totalProgressText) {
    totalProgressText.textContent = `${completed} / ${total}`;
  }

  if (totalPercent) {
    totalPercent.textContent = `${percent}%`;
  }

  if (totalProgressBar) {
    totalProgressBar.style.width = `${percent}%`;
  }

  if (completedCount) {
    completedCount.textContent = completed;
  }

  if (remainingCount) {
    remainingCount.textContent = remaining;
  }
}

function updateCompleteMessage(completed, total) {
  const message = document.getElementById("completeMessage");
  if (!message) return;

  const allCompleted = total > 0 && completed === total;
  message.classList.toggle("hidden", !allCompleted);
}
function skipCooldown(appId, missionId) {
  const missionState = state.apps[appId][missionId];

  missionState.hourCount = 0;
  missionState.hourStartedAt = null;

  saveState();
  updateAll();
}
function updateTimerDisplay(app, mission, missionState) {
  const timer = document.getElementById(`timer-${app.id}-${mission.id}`);
  if (!timer) return;

  const now = Date.now();
  const cooldownMs = mission.cooldownMinutes * 60 * 1000;

  if (!missionState.hourStartedAt || missionState.hourCount < mission.hourlyLimit) {
    timer.classList.add("ready");
    timer.innerHTML = `${t("timer.limit")} / ${t("timer.ready")}`;
    return;
  }

  const elapsed = now - missionState.hourStartedAt;
  const remaining = cooldownMs - elapsed;

  if (remaining <= 0) {
    missionState.hourStartedAt = null;
    missionState.hourCount = 0;
    saveState();

    timer.classList.add("ready");
    timer.innerHTML = `${t("timer.limit")} / ${t("timer.ready")}`;
    return;
  }

  timer.classList.remove("ready");
  timer.innerHTML = `
    <div>${t("timer.cooldown")} ${formatTime(remaining)}</div>
    <button
      type="button"
      class="timer-skip-btn"
      onclick="skipCooldown('${app.id}', '${mission.id}')">
      ${t("timer.skip")}
    </button>
  `;
}

function startTimerLoop() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    const currentDate = todayKey();

    if (state.date !== currentDate) {
      state = {
        date: currentDate,
        apps: {}
      };

      prepareState();
      renderApps();
      applyLanguage();
      updateAll();
      return;
    }

    APPS.forEach((app) => {
      updateDeadlineDisplay(app);
      app.missions.forEach((mission) => {
        if (mission.hourlyLimit && mission.cooldownMinutes) {
          const missionState = state.apps[app.id][mission.id];
          updateTimerDisplay(app, mission, missionState);
        }
      });
    });
  }, 1000);
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}
function updateDeadlineDisplay(app) {
  if (!app.deadline) return;

  const box = document.getElementById(`deadline-${app.id}`);
  const timeEl = document.getElementById(`deadlineTime-${app.id}`);
  if (!box || !timeEl) return;

  const deadline = new Date(app.deadline).getTime();
  const now = Date.now();
  const diff = deadline - now;

  box.classList.remove("urgent", "warning", "closed");

  if (diff <= 0) {
    box.classList.add("closed");
    timeEl.textContent = t("deadline.closed");
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  if (days <= 2) {
    box.classList.add("urgent");
  } else if (days <= 6) {
    box.classList.add("warning");
  }

  if (currentLang === "en") {
    timeEl.textContent = `${days}d ${hours}:${minutes}:${seconds}`;
  } else if (currentLang === "ko") {
    timeEl.textContent = `${days}일 ${hours}:${minutes}:${seconds}`;
  } else {
    timeEl.textContent = `${days}日 ${hours}:${minutes}:${seconds}`;
  }
}

