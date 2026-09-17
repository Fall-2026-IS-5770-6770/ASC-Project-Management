// data/messages.js
const messages = [
  { id: 1, threadId: 1, channelId: 1, senderPersonId: 3, body: "Welcome to the project, everyone. Kickoff is Thursday at 2pm in the ASC conference room.", postedAt: "2026-01-12T15:04:00", editedAt: null },
  { id: 2, threadId: 1, channelId: 1, senderPersonId: 2, body: "I can make Thursday. Should I bring the data access request form?", postedAt: "2026-01-12T15:22:00", editedAt: null },
  { id: 3, threadId: 1, channelId: 1, senderPersonId: 3, body: "Yes please, bring it signed and I will walk it over to Athletics.", postedAt: "2026-01-12T15:31:00", editedAt: null },
  { id: 4, threadId: 1, channelId: 1, senderPersonId: 1, body: "Thursday works for me too. I will be about ten minutes late coming from class.", postedAt: "2026-01-15T09:20:00", editedAt: "2026-01-15T09:24:00" },
  { id: 5, threadId: 2, channelId: 1, senderPersonId: 2, body: "The attendance export has null values for the 2019 season. Do we drop those rows or backfill them?", postedAt: "2026-01-22T10:11:00", editedAt: null },
  { id: 6, threadId: 2, channelId: 1, senderPersonId: 4, body: "Drop them for now and note it in the data dictionary. We can revisit if the client cares about 2019.", postedAt: "2026-01-22T14:02:00", editedAt: null },
  { id: 7, threadId: 2, channelId: 1, senderPersonId: 2, body: "Done, noted in version 1.1 of the dictionary.", postedAt: "2026-02-04T16:45:00", editedAt: null },
  { id: 8, threadId: 3, channelId: 1, senderPersonId: 1, body: "Draft palette is up in the wireframes doc. It is colorblind safe.", postedAt: "2026-02-03T13:30:00", editedAt: null },
  { id: 9, threadId: 3, channelId: 1, senderPersonId: 3, body: "Looks good. Check it against the university brand colors before we show the client.", postedAt: "2026-02-05T08:12:00", editedAt: null },
  { id: 10, threadId: 5, channelId: 3, senderPersonId: 7, body: "Pantry has four tablets on hand, all Android. Planning to test on those.", postedAt: "2026-01-26T09:45:00", editedAt: null },
  { id: 11, threadId: 5, channelId: 3, senderPersonId: 8, body: "I can borrow one this week and check the layout at that screen size.", postedAt: "2026-02-02T12:05:00", editedAt: null }
];

// Pretend this is the signed-in user until authentication is built.
const currentPersonId = 2;

module.exports = { messages, currentPersonId };
