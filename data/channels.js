// data/channels.js
const channels = [
  {
    id: 1,
    name: "athletics-dashboard-general",
    type: "Team",
    url: "https://teams.example.com/asc/athletics-dashboard-general",
    projectId: 1,
    participantPersonIds: [1, 2, 3, 4],
    createdDate: "2026-01-12"
  },
  {
    id: 2,
    name: "athletics-dashboard-client",
    type: "Client",
    url: "https://teams.example.com/asc/athletics-dashboard-client",
    projectId: 1,
    participantPersonIds: [3, 4],
    createdDate: "2026-01-14"
  },
  {
    id: 3,
    name: "food-pantry-general",
    type: "Team",
    url: "https://teams.example.com/asc/food-pantry-general",
    projectId: 2,
    participantPersonIds: [3, 7, 8],
    createdDate: "2026-01-20"
  },
  {
    id: 4,
    name: "alumni-report-general",
    type: "Team",
    url: "https://teams.example.com/asc/alumni-report-general",
    projectId: 3,
    participantPersonIds: [4, 5],
    createdDate: "2026-02-02"
  },
  {
    id: 5,
    name: "intern-portal-archive",
    type: "Archived",
    url: "https://teams.example.com/asc/intern-portal-archive",
    projectId: 5,
    participantPersonIds: [6],
    createdDate: "2025-09-02"
  }
];

module.exports = channels;
