// data/mainBoardStatuses.js
const mainBoardStatuses = [
  { id: 1, name: "Lead Generation", description: "A possible project the ASC has heard about but has not scoped.", order: 1 },
  { id: 2, name: "Statement of Work", description: "Scope and price are being written up for the client to sign.", order: 2 },
  { id: 3, name: "Hiring", description: "The statement of work is signed and the ASC is staffing the team.", order: 3 },
  { id: 4, name: "In Progress", description: "The team is actively working the project.", order: 4 },
  { id: 5, name: "Billing", description: "Work is finished and the client is being invoiced.", order: 5 },
  { id: 6, name: "Close Out", description: "Final documents, handoff, and retrospective.", order: 6 },
  { id: 7, name: "Completed", description: "Fully delivered, billed, and closed.", order: 7 }
];

module.exports = mainBoardStatuses;
