const escapeHtml = require("ejs").escapeXML;

function getCreateMessage(req, res) {
    res.send('Send the creat message page')
}

function postCreateMessage(req, res) {
    console.log(req.body);
    res.send("Saving a new message");
};

function getMessages(req, res) {
    res.send("View all messages");
}

function editMessage(req, res) {
    res.type("text/plain").send(`Edit message page for message ${escapeHtml(req.params.id)}`);
}

function postEditMessage(req, res) {
    console.log(req.body);
    res.type("text/plain").send(`Saving edits to message ${escapeHtml(req.params.id)}`);
}

function postDeleteMessage(req, res) {
    res.type("text/plain").send(`Deleting message ${escapeHtml(req.params.id)}`);
}

function getMessageId(req, res) {
    res.type("text/plain").send(`View message ${escapeHtml(req.params.id)}`);
}

module.exports = { getCreateMessage, postCreateMessage, getMessages, editMessage, postEditMessage, postDeleteMessage, getMessageId }