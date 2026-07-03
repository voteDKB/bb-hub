const todayKey = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = "bbhub-state-" + todayKey;

let state = loadState();
let cooldownTimer = null;

function loadState() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getTaskKey(appId, taskId) {
  return `${appId}-${taskId}`;
}

function getTaskValue(appId, taskId) {
  return state[getTaskKey(appId, taskId)] || 0;
}

function setTaskValue(appId, taskId, value) {
  state[getTaskKey(appId, taskId)] = value;
  saveState();
  render();
}

function isTaskComplete(app, task) {
  const value = getTaskValue(app.id, task.id);

  if (task.type === "check") {
    return value === 1;
  }

  if (task.type === "counter") {
    return value >= task.max;
  }

  return false;
}

function getAllTasks() {
  return APP_DATA.flatMap(app =>
    app.tasks.map(task => ({ app, task }))
  );
}

function getProgress() {
  const allTasks = getAllTasks();
  const completed = allTasks.filter(({ app, task }) =>
    isTaskComplete(app, task)
  ).length;

  return {
    completed,
    total: allTasks.length,
    percent: Math.round((completed / allTasks.length) * 100)
  };
}

function getProgressMessage(progress) {
  if (progress.completed === 0) {
    return currentLanguage === "ja"
      ? "今日のミッションを始めよう！💙"
      : currentLanguage === "ko"
        ? "오늘의 미션을 시작해요! 💙"
        : "Let’s start today’s mission! 💙";
  }

  if (progress.completed < progress.total) {
    const remaining = progress.total - progress.completed;
    return currentLanguage === "ja"
      ? `あと ${remaining} タスク！`
      : currentLanguage === "ko"
        ? `${remaining}개 남았어요!`
        : `${remaining} task${remaining === 1 ? "" : "s"} remaining. Keep going!`;
  }

  return currentLanguage === "ja"
    ? "🎉 今日のタスク完了！また明日！"
    : currentLanguage === "ko"
      ? "🎉 오늘의 작업 완료! 내일 또 만나요!"
      : "🎉 Amazing job BB! See you tomorrow!";
}

function formatDeadline(dateString) {
  const deadline = new Date(dateString + "T23:59:59");
  const now = new Date();

  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "";

  if (currentLanguage === "ja") {
    return diffDays === 0
      ? "本日締切"
      : `締切まであと${diffDays}日`;
  }

  if (currentLanguage === "ko") {
    return diffDays === 0
      ? "오늘 마감"
      : `마감까지 ${diffDays}일`;
  }

  return diffDays === 0
    ? "Ends today"
    : `Ends in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
}

function render() {
  clearInterval(cooldownTimer);

  const root = document.getElementById("app");
  const progress = getProgress();

  root.innerHTML = `
    <header class="hero">
      <div class="top-row">
        <div class="language-switch">
          <button class="${currentLanguage === "ja" ? "active" : ""}" onclick="setLanguage('ja')">JP</button>
          <button class="${currentLanguage === "en" ? "active" : ""}" onclick="setLanguage('en')">EN</button>
          <button class="${currentLanguage === "ko" ? "active" : ""}" onclick="setLanguage('ko')">KR</button>
        </div>
      </div>

      <div class="logo-ring" aria-hidden="true">
        <div class="logo-text">
          <span>BB</span>
          <strong>Hub</strong>
        </div>
      </div>

      <p class="eyebrow">${t("appSubtitle")}</p>
      <h1>${t("slogan1")}<br>${t("slogan2")}</h1>
    </header>

    <section class="progress-card">
      <div class="section-head">
        <div>
          <p class="label">${t("today")}</p>
          <h2>${t("progress")}</h2>
        </div>
        <span class="progress-count">${progress.completed} / ${progress.total} ${t("tasks")}</span>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress.percent}%"></div>
      </div>

      <p class="progress-message">${getProgressMessage(progress)}</p>
    </section>

    <section class="apps">
      ${APP_DATA.map(app => renderAppCard(app)).join("")}
    </section>

    <button class="reset-button" onclick="resetToday()">
      ${t("reset")}
    </button>

    <footer class="footer">
      <p>Made with 💙<br>by BB, for BB.</p>
    </footer>
  `;

  startCooldownTimer();
}

function renderAppCard(app) {
  const deadlineText = app.deadline ? formatDeadline(app.deadline) : "";

  return `
    <article class="app-card">
      <div class="app-head">
        <div>
          <p class="app-kicker">Voting App</p>
          <h2>${app.name}</h2>
          ${
            deadlineText
              ? `<p class="deadline">${t("votingEnds")} Jul 8 · ${deadlineText}</p>`
              : ""
          }
        </div>
        <a class="open-button" href="#" aria-label="${t("openApp")}">${t("openApp")}</a>
      </div>

      <div class="task-list">
        ${app.tasks.map(task => renderTask(app, task)).join("")}
      </div>
    </article>
  `;
}

function renderTask(app, task) {
  if (task.type === "check") {
    return renderCheckTask(app, task);
  }

  if (task.type === "counter") {
    return renderCounterTask(app, task);
  }

  return "";
}

function renderCheckTask(app, task) {
  const checked = getTaskValue(app.id, task.id) === 1;

  return `
    <label class="task-item ${checked ? "done" : ""}">
      <input
        type="checkbox"
        ${checked ? "checked" : ""}
        onchange="setTaskValue('${app.id}', '${task.id}', this.checked ? 1 : 0)"
      />
      <span>${t(task.labelKey)}</span>
    </label>
  `;
}

function renderCounterTask(app, task) {
  const value = getTaskValue(app.id, task.id);
  const complete = value >= task.max;

  const cooldownHtml =
    task.hourlyLimit
      ? renderCooldown(app, task, value)
      : "";

  return `
    <div class="counter-task ${complete ? "done" : ""}">
      <div class="counter-head">
        <span>${t(task.labelKey)}</span>
        <strong>${Math.min(value, task.max)} / ${task.max}</strong>
      </div>

      <div class="counter-controls">
        <button onclick="changeCounter('${app.id}', '${task.id}', -1)">−</button>
        <div class="counter-number">${Math.min(value, task.max)}</div>
        <button onclick="changeCounter('${app.id}', '${task.id}', 1)">＋</button>
      </div>

      ${cooldownHtml}
    </div>
  `;
}

function changeCounter(appId, taskId, amount) {
  const app = APP_DATA.find(item => item.id === appId);
  const task = app.tasks.find(item => item.id === taskId);

  let value = getTaskValue(appId, taskId);
  value = Math.max(0, Math.min(task.max, value + amount));

  state[getTaskKey(appId, taskId)] = value;

  handleCooldown(appId, task, value);

  saveState();
  render();
}

function getCooldownKey(appId, taskId) {
  return `${appId}-${taskId}-cooldownUntil`;
}

function getHourlyCountKey(appId, taskId) {
  return `${appId}-${taskId}-hourlyCount`;
}

function getHourlyStartedKey(appId, taskId) {
  return `${appId}-${taskId}-hourlyStarted`;
}

function handleCooldown(appId, task, value) {
  if (!task.hourlyLimit) return;

  const now = Date.now();

  const countKey = getHourlyCountKey(appId, task.id);
  const startedKey = getHourlyStartedKey(appId, task.id);
  const cooldownKey = getCooldownKey(appId, task.id);

  let started = state[startedKey] || now;
  let count = state[countKey] || 0;

  if (now - started >= task.cooldownMinutes * 60 * 1000) {
    started = now;
    count = 0;
  }

  count += 1;

  state[startedKey] = started;
  state[countKey] = count;

  if (count >= task.hourlyLimit && value < task.max) {
    state[cooldownKey] =
      now + task.cooldownMinutes * 60 * 1000;
  }
}

function renderCooldown(app, task, value) {
  const cooldownUntil = state[getCooldownKey(app.id, task.id)];

  if (!cooldownUntil || Date.now() >= cooldownUntil || value >= task.max) {
    return "";
  }

  const remainingMs = cooldownUntil - Date.now();
  const minutes = Math.floor(remainingMs / 1000 / 60);
  const seconds = Math.floor((remainingMs / 1000) % 60);

  return `
    <div class="cooldown">
      <span>${t("nextAds")}</span>
      <strong>${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}</strong>
    </div>
  `;
}

function startCooldownTimer() {
  cooldownTimer = setInterval(() => {
    const hasCooldown = Object.keys(state).some(key =>
      key.includes("cooldownUntil") && state[key] > Date.now()
    );

    if (hasCooldown) {
      render();
    }
  }, 1000);
}

function resetToday() {
  if (!confirm("Reset today?")) return;

  state = {};
  saveState();
  render();
}

render();
