// data/projectTypes.js
const projectTypes = [
  {
    id: 1,
    name: "Full-Stack Application",
    description: "A web application with both a front end and a server-side back end.",
    typicalDurationWeeks: 15,
    typicalDeliverables: ["Deployed web app", "Source repository", "User guide"],
    typicalSkillIds: [1, 2, 3]
  },
  {
    id: 2,
    name: "Data Engineering",
    description: "Pipelines that move, clean, and reshape data for downstream use.",
    typicalDurationWeeks: 12,
    typicalDeliverables: ["ETL pipeline", "Data dictionary", "Runbook"],
    typicalSkillIds: [2, 6]
  },
  {
    id: 3,
    name: "Data Analytics",
    description: "Analysis that answers a specific business question for a client.",
    typicalDurationWeeks: 10,
    typicalDeliverables: ["Written report", "Analysis notebook", "Client presentation"],
    typicalSkillIds: [2, 6, 8]
  },
  {
    id: 4,
    name: "Data Visualization",
    description: "Dashboards and interactive graphics built on top of client data.",
    typicalDurationWeeks: 8,
    typicalDeliverables: ["Interactive dashboard", "Design rationale", "Handoff training"],
    typicalSkillIds: [4, 7]
  },
  {
    id: 5,
    name: "Mobile Application",
    description: "A phone or tablet application, usually paired with an existing back end.",
    typicalDurationWeeks: 14,
    typicalDeliverables: ["Published app build", "Source repository", "Test plan"],
    typicalSkillIds: [1, 3, 7]
  }
];

module.exports = projectTypes;
