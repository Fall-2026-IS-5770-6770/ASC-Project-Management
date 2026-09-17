// data/projectProjectTypes.js
const projectProjectTypes = [
  { id: 1, projectId: 1, projectTypeId: 1, isPrimary: true },
  { id: 2, projectId: 1, projectTypeId: 4, isPrimary: false },
  { id: 3, projectId: 2, projectTypeId: 1, isPrimary: true },
  { id: 4, projectId: 3, projectTypeId: 3, isPrimary: true },
  { id: 5, projectId: 3, projectTypeId: 2, isPrimary: false },
  { id: 6, projectId: 4, projectTypeId: 4, isPrimary: true },
  { id: 7, projectId: 4, projectTypeId: 5, isPrimary: false },
  { id: 8, projectId: 5, projectTypeId: 1, isPrimary: true }
];

module.exports = projectProjectTypes;
