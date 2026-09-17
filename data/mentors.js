// data/mentors.js
const mentors = [
  {
    id: 1,
    personId: 3,
    department: "Data Analytics and Information Systems",
    availability: "Tuesdays and Thursdays, 1-4pm",
    maxProjectLoad: 3,
    preferredProjectTypeId: 1,
    skillIds: [1, 3, 5]
  },
  {
    id: 2,
    personId: 4,
    department: "Computer Science",
    availability: "Mondays and Wednesdays, 9am-12pm",
    maxProjectLoad: 2,
    preferredProjectTypeId: 2,
    skillIds: [2, 6]
  },
  {
    id: 3,
    personId: 6,
    department: "Management Information Systems",
    availability: "Fridays, 10am-2pm",
    maxProjectLoad: 4,
    preferredProjectTypeId: 3,
    skillIds: [4, 5, 8]
  }
];

module.exports = mentors;
