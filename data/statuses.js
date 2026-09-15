// data/statuses.js
const statuses = [
  { id: 1, name: "To Do", description: "Work that has been defined but not started.", order: 1 },
  { id: 2, name: "In Progress", description: "Work a team member is actively doing right now.", order: 2 },
  { id: 3, name: "In Review", description: "Work that is finished and waiting on a mentor or PM to check it.", order: 3 },
  { id: 4, name: "Blocked", description: "Work that cannot move forward until something outside the team happens.", order: 4 },
  { id: 5, name: "Done", description: "Work that has been reviewed and accepted.", order: 5 }
];

module.exports = statuses;
