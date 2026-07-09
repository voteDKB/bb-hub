/* ==========================
   BB Hub Ver.1.3 Script
========================== */

const translations = {
  ja: {
    eyebrow: "DKB Voting Tracker",
    subtitle: "今日の投票ミッションをまとめてチェックしよう",
    todayProgress: "今日の進捗",
    summaryTitle: "Daily Mission",
    missionsDone: "ミッション完了",
    allDone: "Today's mission accomplished!",
    seeTomorrow: "また明日がんばろう！",
    stardomSub: "出席・広告・無料投票",
    rematchSub: "出席・FC出席・応援コメント・いいね・広告",
    jkSub: "出席・無料投票・広告",
    deadline: "投票締切",
    attendance: "出席",
    ads30: "広告30回",
    ads: "広告",
    freeVote: "無料投票",
    fcAttendance: "FC出席",
    comments10: "応援コメント10個",
    likeComments: "応援コメントにいいね",
    todo: "TODO",
    done: "DONE",
    complete: "COMPLETE",
    nextAds: "次の広告まで",
    timerReset: "1時間経ったことにする",
    ended: "終了しました",
    daysLeft: "残り{d}日 {h}時間",
    hoursLeft: "残り{h}時間 {m}分",
    minutesLeft: "残り{m}分",
    endsToday: "⚠️ Ends today",
    endsSoon: "🚨 Voting ends in {d} day!"
  },
  en: {
    eyebrow: "DKB Voting Tracker",
    subtitle: "Check today’s voting missions in one place",
    todayProgress: "Today’s Progress",
    summaryTitle: "Daily Mission",
    missionsDone: "missions done",
    allDone: "Today's mission accomplished!",
    seeTomorrow: "See you tomorrow!",
    stardomSub: "Attendance, ads, free vote",
    rematchSub: "FC attendance, comments, ads",
    jkSub: "Purple theme tracker",
    deadline: "Voting deadline",
    attendance: "Attendance",
    ads30: "30 ads",
    ads: "Ads",
    freeVote: "Free vote",
    fcAttendance: "FC attendance",
    comments10: "10 support comments",
    likeComments: "Like support comments",
    todo: "TODO",
    done: "DONE",
    complete: "COMPLETE",
    nextAds: "Next ads in",
    timerReset: "Mark 1 hour passed",
    ended: "Closed",
    daysLeft: "{d}d {h}h left",
    hoursLeft: "{h}h {m}m left",
    minutesLeft: "{m}m left",
    endsToday: "⚠️ Ends today",
    endsSoon: "🚨 Voting ends in {d} day!"
  },
  ko: {
    eyebrow: "DKB Voting Tracker",
    subtitle: "오늘의 투표 미션을 한 번에 체크해요",
    todayProgress: "오늘의 진행률",
    summaryTitle: "Daily Mission",
    missionsDone: "미션 완료",
    allDone: "Today's mission accomplished!",
    seeTomorrow: "내일도 같이 힘내요!",
    stardomSub: "출석・광고・무료 투표",
    rematchSub: "FC 출석・댓글・광고",
    jkSub: "보라색 테마 관리",
    deadline: "투표 마감",
    attendance: "출석",
    ads30: "광고 30회",
    ads: "광고",
    freeVote: "무료 투표",
    fcAttendance: "FC 출석",
    comments10: "응원 댓글 10개",
    likeComments: "응원 댓글 좋아요",
    todo: "TODO",
    done: "DONE",
    complete: "COMPLETE",
    nextAds: "다음 광고까지",
    timerReset: "1시간 지난 걸로 하기",
    ended: "종료되었습니다",
    daysLeft: "{d}일 {h}시간 남음",
    hoursLeft: "{h}시간 {m}분 남음",
    minutesLeft: "{m}분 남음",
    endsToday: "⚠️ 오늘 마감",
    endsSoon: "🚨 투표 마감까지 {d}일!"
  }
};

let currentLang = localStorage.getItem("bbhub-lang") || "ja";

/* ===== 0時リセット ===== */

function resetDailyMissionsIfNeeded() {
  const today = new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo"
  });

  const lastResetDate = localStorage.getItem("bbhub-last-reset-date");

  if (lastResetDate === today) return;

  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith("bbhub-stardom-task-") ||
      key.startsWith("bbhub-stardom-counter-") ||
      key.startsWith("bbhub-rematch-task-") ||
      key.startsWith("bbhub-rematch-counter-") ||
      key.startsWith("bbhub-jk-task-") ||
      key.startsWith("bbhub-jk-counter-")
    ) {
      localStorage.removeItem(key);
    }
  });

  localStorage.setItem("bbhub-last-reset-date", today);
}
resetDailyMissionsIfNeeded();
/* ===== 完了音 ===== */

const completeSounds = [
  "sounds/Default_D1.mp3",
  "sounds/Default_GK.mp3",
  "sounds/Default_YUKU.mp3",
  "sounds/Default_echan.mp3",
  "sounds/Default_harry.mp3",
  "sounds/Default_heechan.mp3",
  "sounds/Default_junseo.mp3"
];

let lastSoundIndex = -1;

function playCompleteSound() {
  if (completeSounds.length === 0) return;

  let index;

  do {
    index = Math.floor(Math.random() * completeSounds.length);
  } while (completeSounds.length > 1 && index === lastSoundIndex);

  lastSoundIndex = index;

  console.log("再生ファイル:", completeSounds[index]);

  const audio = new Audio(completeSounds[index]);
  audio.volume = 0.8;
  audio.play().catch((error) => {
    console.log("音声再生エラー:", error);
    alert("音声が再生できませんでした。Consoleを確認してください。");
  });
}

const counterLimits = new WeakMap();

document.querySelectorAll(".mission-counter").forEach((counter) => {
  const text = counter.querySelector("[data-counter-text]")?.textContent || "0 / 1";
  const limit = Number(text.split("/")[1]?.trim() || 1);
  counterLimits.set(counter, limit);

  const key = getCounterKey(counter);
  const saved = Number(localStorage.getItem(key) || 0);
  setCounter(counter, Math.min(saved, limit));
});

document.querySelectorAll("[data-task]").forEach((input) => {
  const key = getTaskKey(input);
  input.checked = localStorage.getItem(key) === "true";
  updateMissionState(input.closest(".mission"));

 input.addEventListener("change", () => {
  localStorage.setItem(key, input.checked);
  updateMissionState(input.closest(".mission"));

  if (input.checked) {
    playCompleteSound();
  }

  updateAllProgress();
});
});

document.querySelectorAll("[data-plus]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const counter = btn.closest(".mission-counter");
    const limit = counterLimits.get(counter);
    const current = Number(counter.dataset.value || 0);
    const next = Math.min(current + 1, limit);

    setCounter(counter, next);
    localStorage.setItem(getCounterKey(counter), counter.dataset.value);

    // ミッション達成時だけ音を再生
    if (current < limit && next === limit) {
      playCompleteSound();
    }

    updateAllProgress();
  });
});

document.querySelectorAll("[data-minus]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const counter = btn.closest(".mission-counter");
    const current = Number(counter.dataset.value || 0);
    setCounter(counter, Math.max(current - 1, 0));
    localStorage.setItem(getCounterKey(counter), counter.dataset.value);
    updateAllProgress();
  });
});

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.lang;
    localStorage.setItem("bbhub-lang", currentLang);
    applyLanguage();
    updateDeadlines();
  });
});

function getTaskKey(input){
  const app = input.closest("[data-app]")?.dataset.app || "app";
  const index = [...document.querySelectorAll(`[data-app="${app}"] [data-task]`)].indexOf(input);
  return `bbhub-${app}-task-${index}`;
}

function getCounterKey(counter){
  const app = counter.closest("[data-app]")?.dataset.app || "app";
  const index = [...document.querySelectorAll(`[data-app="${app}"] .mission-counter`)].indexOf(counter);
  return `bbhub-${app}-counter-${index}`;
}

function setCounter(counter, value){
  const limit = counterLimits.get(counter) || 1;
  const percent = Math.round((value / limit) * 100);

  counter.dataset.value = value;
  counter.querySelectorAll("[data-counter-value]").forEach((el) => el.textContent = value);
  counter.querySelectorAll("[data-counter-text]").forEach((el) => el.textContent = `${value} / ${limit}`);
  counter.querySelectorAll("[data-counter-fill]").forEach((el) => el.style.width = `${percent}%`);

  counter.classList.toggle("complete", value >= limit);
}

function updateMissionState(mission){
  if(!mission) return;
  const input = mission.querySelector("[data-task]");
  const state = mission.querySelector(".mission-state");
  const done = !!input?.checked;

  mission.classList.toggle("complete", done);
  if(state){
    state.textContent = done ? translations[currentLang].done : translations[currentLang].todo;
  }
}

function getMissionScore(appCard){
  let done = 0;
  let total = 0;

  appCard.querySelectorAll("[data-task]").forEach((input) => {
    total += 1;
    if(input.checked) done += 1;
  });

  appCard.querySelectorAll(".mission-counter").forEach((counter) => {
    const limit = counterLimits.get(counter) || 1;
    total += limit;
    done += Number(counter.dataset.value || 0);
  });

  return { done, total };
}

function updateAllProgress(){
  let allDone = 0;
  let allTotal = 0;

  document.querySelectorAll("[data-app]").forEach((appCard) => {
    const { done, total } = getMissionScore(appCard);
    allDone += done;
    allTotal += total;

    const percent = total ? Math.round((done / total) * 100) : 0;
    appCard.querySelector("[data-app-percent]").textContent = `${percent}%`;
    appCard.querySelector("[data-app-fill]").style.width = `${percent}%`;

    const complete = percent === 100;
    appCard.classList.toggle("completed-card", complete);
    appCard.querySelector(".complete-ribbon").classList.toggle("hidden", !complete);
  });

  const allPercent = allTotal ? Math.round((allDone / allTotal) * 100) : 0;
  document.getElementById("completedCount").textContent = allDone;
  document.getElementById("totalCount").textContent = allTotal;
  document.getElementById("summaryPercent").textContent = `${allPercent}%`;
  document.getElementById("summaryFill").style.width = `${allPercent}%`;

  document.getElementById("completeMessage").classList.toggle("hidden", allPercent !== 100);
}

function applyLanguage(){
  const dict = translations[currentLang];

  document.documentElement.lang = currentLang;
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if(dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll(".mission").forEach(updateMissionState);
}

function updateComingSoon(){
  const now = new Date();

  document.querySelectorAll("[data-start]").forEach((card) => {
    const start = new Date(card.dataset.start);
    const isComingSoon = now < start;

    card.classList.toggle("coming-soon", isComingSoon);

    let label = card.querySelector(".coming-soon-label");

    if (isComingSoon && !label) {
     label = document.createElement("div");
label.className = "coming-soon-label";

label.innerHTML = `
  <div>Coming soon</div>
  <small>決勝投票開始：7月10日 00:00 JST</small>
`;

card.querySelector(".deadline-box").after(label);
    }

    if (!isComingSoon && label) {
      label.remove();
    }

    card.querySelectorAll("input, button").forEach((el) => {
      el.disabled = isComingSoon;
    });
  });
}
/* Deadline */

function updateDeadlines(){
  const dict = translations[currentLang];
  const now = new Date();

  document.querySelectorAll(".deadline-box").forEach((box) => {
    const deadline = new Date(box.dataset.deadline);
    const diff = deadline - now;
    const textEl = box.querySelector("[data-deadline-text]");
    const alertEl = box.closest(".app-card")?.querySelector("[data-deadline-alert]");

    box.classList.remove("warning", "urgent", "closed");
    alertEl?.classList.add("hidden");

    if(diff <= 0){
      textEl.textContent = dict.ended;
      box.classList.add("closed");
      return;
    }

    const totalMinutes = Math.floor(diff / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if(days >= 1){
      textEl.textContent = dict.daysLeft.replace("{d}", days).replace("{h}", hours);
    }else if(hours >= 1){
      textEl.textContent = dict.hoursLeft.replace("{h}", hours).replace("{m}", minutes);
    }else{
      textEl.textContent = dict.minutesLeft.replace("{m}", minutes);
    }

    if(days <= 1){
      box.classList.add("urgent");
      if(alertEl){
        alertEl.textContent = days === 0
          ? dict.endsToday
          : dict.endsSoon.replace("{d}", days);
        alertEl.classList.remove("hidden");
      }
    }else if(days <= 3){
      box.classList.add("warning");
    }
  });
}



applyLanguage();
updateAllProgress();
updateDeadlines();
updateComingSoon();

setInterval(updateDeadlines, 60000);
setInterval(updateComingSoon, 60000);

// Service Worker登録
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.error("Service Worker registration failed:", err));
  });
}
