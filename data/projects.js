// data/projects.js
const projects = [
  {
    id: 1,
    name: "Aggie Athletics Attendance Dashboard",
    description: "A dashboard showing ticket sales and attendance trends for USU home games.",
    clientId: 1,
    mainBoardStatusId: 4,
    projectManagerId: 3,
    startDate: "2026-01-12",
    midpointDate: "2026-02-23",
    endDate: "2026-04-24",
    budget: 12000,
    estimatedHours: 320,
    notes: "Client wants a read-only public view in phase two."
  },
  {
    id: 2,
    name: "Cache Community Food Pantry Inventory",
    description: "An inventory tracker so pantry staff can see what is stocked and what is running low.",
    clientId: 2,
    mainBoardStatusId: 4,
    projectManagerId: 3,
    startDate: "2026-01-20",
    midpointDate: "2026-03-02",
    endDate: "2026-04-30",
    budget: 8500,
    estimatedHours: 240,
    notes: "Volunteers will use this on tablets in the warehouse."
  },
  {
    id: 3,
    name: "Alumni Donation Trends Report",
    description: "An analytics report on ten years of alumni giving, broken out by college and class year.",
    clientId: 3,
    mainBoardStatusId: 2,
    projectManagerId: 4,
    startDate: "2026-02-02",
    midpointDate: "2026-03-09",
    endDate: "2026-05-08",
    budget: 15000,
    estimatedHours: 400,
    notes: "Waiting on a signed statement of work before the team is assigned."
  },
  {
    id: 4,
    name: "Cache Valley Transit Route Map",
    description: "An interactive map of bus routes and stop-level ridership for the transit district.",
    clientId: 4,
    mainBoardStatusId: 1,
    projectManagerId: 4,
    startDate: "2026-03-01",
    midpointDate: "2026-04-05",
    endDate: "2026-06-12",
    budget: 9500,
    estimatedHours: 260,
    notes: "Initial lead came in through the ASC contact form."
  },
  {
    id: 5,
    name: "ASC Intern Onboarding Portal",
    description: "An internal portal that walks new ASC student hires through paperwork and training.",
    clientId: 5,
    mainBoardStatusId: 7,
    projectManagerId: 6,
    startDate: "2025-09-02",
    midpointDate: "2025-10-14",
    endDate: "2025-12-05",
    budget: 6000,
    estimatedHours: 180,
    notes: "Delivered and closed out. Keep it on the board as a completed example."
  }
];

module.exports = projects;
