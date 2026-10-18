const threads = require("../data/threads");
const escapeHtml = require("ejs").escapeXML;

// Display the form for creating a new thread
function getNewThreadPage(req, res) {
    res.render("partials/threads/new/new-thread-modal.ejs");
}

// Handle submission of a new thread
function saveNewThread(req, res) {
    console.log("New thread submitted:", req.body.threadName);
    res.redirect("/threads");
}

// Display all threads belonging to channel 1
function getAllThreads(req, res) {
    const channelThreads = threads
        .filter((thread) => thread.channelId === 1)
        .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));

    res.render("partials/threads/all/all-thread-modal", {
        threads: channelThreads
    });
}

// Display the form for editing a thread
function getEditThreadPage(req, res) {
    const thread = threads.find((t) => t.id === parseInt(req.params.id));

    res.render("partials/threads/edit/edit-thread-modal", {
        threadId: thread.id,
        threadName: thread.name
    });
}

// Handle submission of thread edits
function saveThreadEdits(req, res) {
    console.log(req.body);
    res.type("text/plain").send(
        `This route saves edits to thread ${escapeHtml(req.params.id)}`
    );
}

// Handle a request to delete a thread
function deleteThread(req, res) {
    console.log(`Thread ${req.params.id} deleted`);
    res.type("text/plain").send(
        `This route deletes thread ${escapeHtml(req.params.id)}`
    );
}

// Display a specific thread by its ID
function getThread(req, res) {
    const thread = threads.find((t) => t.id === parseInt(req.params.id));

    if (!thread) {
        return res.status(404).send("Thread not found");
    }

    res.render("partials/threads/show/show-threads-modal", {
        threadId: thread.id,
        threadName: thread.name
    });
}

// Export the functions so index.js can use them
module.exports = {
    getNewThreadPage,
    saveNewThread,
    getAllThreads,
    getEditThreadPage,
    saveThreadEdits,
    deleteThread,
    getThread
};
