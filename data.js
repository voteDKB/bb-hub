// data.js
// BB Hub Ver.1.1

const APPS = [
  {
    id: "stardom",
    name: "Stardom",
    icon: "S",
    deadline: "2026-07-08T15:00:00+09:00",
    missions: [
      {
        id: "attendance",
        type: "check",
        labelKey: "mission.attendance"
      },
      {
        id: "ads",
        type: "counter",
        labelKey: "mission.ads",
        max: 30
      },
      {
        id: "freeVote",
        type: "check",
        labelKey: "mission.freeVote"
      }
    ]
  },
  {
    id: "starRematch",
    name: "Star Rematch",
    icon: "R",
    deadline: "2026-07-13T15:00:00+09:00",
    missions: [
      {
        id: "attendance",
        type: "check",
        labelKey: "mission.attendance"
      },
      {
        id: "fcAttendance",
        type: "check",
        labelKey: "mission.fcAttendance"
      },
      {
        id: "supportComments",
        type: "counter",
        labelKey: "mission.supportComments",
        max: 10
      },
      {
        id: "commentLike",
        type: "check",
        labelKey: "mission.commentLike"
      },
      {
        id: "freeVote",
        type: "check",
        labelKey: "mission.freeVote"
      },
      {
        id: "ads",
        type: "counter",
        labelKey: "mission.ads",
        max: 60,
        hourlyLimit: 10,
        cooldownMinutes: 60
      }
    ]
  },
  {
    id: "jkFandom",
    name: "JK Fandom",
    icon: "★",
    deadline: "2026-07-13T15:00:00+09:00",
    missions: [
      {
        id: "attendance",
        type: "check",
        labelKey: "mission.attendance"
      },
      {
        id: "ads",
        type: "counter",
        labelKey: "mission.ads",
        max: 15
      },
      {
        id: "freeVote",
        type: "check",
        labelKey: "mission.freeVote"
      }
    ]
  }
];
