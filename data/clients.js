// data/clients.js
const clients = [
  {
    id: 1,
    name: "USU Athletics Department",
    type: "Internal",
    contactPersonName: "Dana Kowalski",
    contactEmail: "dana.kowalski@usu.edu",
    phone: "435-555-0210",
    address: { street: "900 E 700 N", city: "Logan", state: "UT", zip: "84322" },
    billingEmail: "athletics.billing@usu.edu",
    billingTerms: "Internal transfer, quarterly"
  },
  {
    id: 2,
    name: "Cache Community Food Pantry",
    type: "Non-Profit",
    contactPersonName: "Rosa Delgado",
    contactEmail: "rosa@cachefoodpantry.org",
    phone: "435-555-0233",
    address: { street: "359 S Main St", city: "Logan", state: "UT", zip: "84321" },
    billingEmail: "accounts@cachefoodpantry.org",
    billingTerms: "Reduced non-profit rate, net 60"
  },
  {
    id: 3,
    name: "USU Alumni Association",
    type: "Internal",
    contactPersonName: "Grant Whitmore",
    contactEmail: "grant.whitmore@usu.edu",
    phone: "435-555-0248",
    address: { street: "1450 Old Main Hill", city: "Logan", state: "UT", zip: "84322" },
    billingEmail: "alumni.billing@usu.edu",
    billingTerms: "Internal transfer, on completion"
  },
  {
    id: 4,
    name: "Cache Valley Transit District",
    type: "Profit",
    contactPersonName: "Nia Foster",
    contactEmail: "nfoster@cvtdbus.org",
    phone: "435-555-0261",
    address: { street: "754 W 600 N", city: "Logan", state: "UT", zip: "84321" },
    billingEmail: "ap@cvtdbus.org",
    billingTerms: "Net 30, 50% due at kickoff"
  },
  {
    id: 5,
    name: "Analytics Solutions Center",
    type: "Internal",
    contactPersonName: "Priya Raman",
    contactEmail: "priya.raman@usu.edu",
    phone: "435-555-0108",
    address: { street: "3565 Old Main Hill", city: "Logan", state: "UT", zip: "84322" },
    billingEmail: "asc.billing@usu.edu",
    billingTerms: "No charge, internal project"
  }
];

module.exports = clients;
