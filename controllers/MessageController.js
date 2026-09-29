
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
    res.send(`Edit message page for message ${req.params.id}`);
}

function postEditMessage(req, res) {
    console.log(req.body);
    res.send(`Saving edits to message ${req.params.id}`);
}

function postDeleteMessage(req, res) {
    res.send(`Deleting message ${req.params.id}`);
}

function getMessageId(req, res) {
    res.send(`View message ${req.params.id}`);
}

module.exports = { getCreateMessage, postCreateMessage, getMessages, editMessage, postEditMessage, postDeleteMessage, getMessageId }