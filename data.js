const APP_DATA = [
  {
    id: "stardom",
    name: "Stardom",
    deadline: "2026-07-08",
    tasks: [
      { id: "attendance", type: "check", labelKey: "attendance" },
      { id: "ads", type: "counter", labelKey: "ads", max: 30 },
      { id: "freeVote", type: "check", labelKey: "freeVote" }
    ]
  },
  {
    id: "star-rematch",
    name: "Star Rematch",
    tasks: [
      { id: "attendance", type: "check", labelKey: "attendance" },
      { id: "fcAttendance", type: "check", labelKey: "fcAttendance" },
      { id: "cheerComments", type: "counter", labelKey: "cheerComments", max: 10 },
      { id: "likeComments", type: "check", labelKey: "likeComments" },
      {
        id: "ads",
        type: "counter",
        labelKey: "ads",
        max: 60,
        hourlyLimit: 10,
        cooldownMinutes: 60
      },
      { id: "freeVote", type: "check", labelKey: "freeVote" }
    ]
  },
  {
    id: "jk-fandom",
    name: "JK Fandom",
    tasks: [
      { id: "attendance", type: "check", labelKey: "attendance" },
      { id: "ads", type: "counter", labelKey: "ads", max: 15 },
      { id: "freeVote", type: "check", labelKey: "freeVote" }
    ]
  }
];
