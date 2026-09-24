// data/students.js
const students = [
  {
    id: 1,
    personId: 1,
    major: "Data Analytics",
    graduationDate: "2027-05-07",
    resumeUrl: "/uploads/resumes/maya-thompson.pdf",
    minHoursPerWeek: 10,
    maxHoursPerWeek: 20,
    workApprovalStatus: "Approved",
    availability: "Weekday afternoons",
    preferredProjectTypeId: 3,
    skillIds: [1, 4, 6]
  },
  {
    id: 2,
    personId: 2,
    major: "Computer Science",
    graduationDate: "2026-12-18",
    resumeUrl: "/uploads/resumes/devin-okafor.pdf",
    minHoursPerWeek: 15,
    maxHoursPerWeek: 25,
    workApprovalStatus: "Approved",
    availability: "Mornings before 11am",
    preferredProjectTypeId: 1,
    skillIds: [1, 2, 3]
  },
  {
    id: 3,
    personId: 5,
    major: "Management Information Systems",
    graduationDate: "2027-05-07",
    resumeUrl: "/uploads/resumes/sofia-marquez.pdf",
    minHoursPerWeek: 8,
    maxHoursPerWeek: 15,
    workApprovalStatus: "Pending",
    availability: "Tuesdays and Thursdays, all day",
    preferredProjectTypeId: 5,
    skillIds: [5, 7]
  },
  {
    id: 4,
    personId: 7,
    major: "Statistics",
    graduationDate: "2026-05-01",
    resumeUrl: "/uploads/resumes/alice-nguyen.pdf",
    minHoursPerWeek: 12,
    maxHoursPerWeek: 20,
    workApprovalStatus: "Approved",
    availability: "Flexible",
    preferredProjectTypeId: 2,
    skillIds: [2, 6, 8]
  },
  {
    id: 5,
    personId: 8,
    major: "Economics",
    graduationDate: "2028-05-05",
    resumeUrl: "/uploads/resumes/marcus-bell.pdf",
    minHoursPerWeek: 6,
    maxHoursPerWeek: 12,
    workApprovalStatus: "Not Approved",
    availability: "Evenings only",
    preferredProjectTypeId: 4,
    skillIds: [4, 8]
  }
];

module.exports = students;
