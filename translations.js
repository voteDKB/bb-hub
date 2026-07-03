const TRANSLATIONS = {

  en: {

    appTitle: "BB Hub",
    appSubtitle: "Daily Voting Tracker",

    slogan1: "Every vote matters.",
    slogan2: "Every BB matters. 💙",

    today: "Today",
    progress: "Today's Progress",
    tasks: "Tasks",

    attendance: "Attendance",
    fcAttendance: "FC Attendance",
    freeVote: "Free Vote",
    ads: "Watch Ads",
    cheerComments: "Cheer Comments",
    likeComments: "Like Cheer Comments",

    openApp: "Open App",

    completed: "Completed",
    remaining: "Remaining",

    reset: "Reset Today",

    votingEnds: "Voting ends",

    nextAds: "Next Ads",
    notify: "Notify Me"

  },

  ja: {

    appTitle: "BB Hub",
    appSubtitle: "Daily Voting Tracker",

    slogan1: "一票一票が力になる。",
    slogan2: "すべてのBBが力になる。💙",

    today: "今日",
    progress: "今日の進捗",
    tasks: "タスク",

    attendance: "出席",
    fcAttendance: "FC出席",
    freeVote: "無料投票",
    ads: "広告",
    cheerComments: "応援コメント",
    likeComments: "応援コメントにいいね",

    openApp: "アプリを開く",

    completed: "完了",
    remaining: "残り",

    reset: "今日をリセット",

    votingEnds: "投票締切",

    nextAds: "次の広告",
    notify: "通知する"

  },

  ko: {

    appTitle: "BB Hub",
    appSubtitle: "Daily Voting Tracker",

    slogan1: "모든 한 표가 소중합니다.",
    slogan2: "모든 BB가 소중합니다. 💙",

    today: "오늘",
    progress: "오늘의 진행률",
    tasks: "작업",

    attendance: "출석",
    fcAttendance: "FC 출석",
    freeVote: "무료 투표",
    ads: "광고 보기",
    cheerComments: "응원 댓글",
    likeComments: "응원 댓글 좋아요",

    openApp: "앱 열기",

    completed: "완료",
    remaining: "남음",

    reset: "오늘 초기화",

    votingEnds: "투표 마감",

    nextAds: "다음 광고",
    notify: "알림"

  }

};

let currentLanguage =
  localStorage.getItem("bbhub-language") || "en";

function t(key) {

  return TRANSLATIONS[currentLanguage][key] || key;

}

function setLanguage(lang) {

  currentLanguage = lang;

  localStorage.setItem("bbhub-language", lang);

  render();

}
