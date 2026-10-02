// Communication Channel controller (Issue #6)
// Each function is a route handler. The route file only maps method + path to these.

// View all communication channels
const getAllChannels = (req, res) => {
    res.send("Viewing all channels");
};

// Create a new communication channel (form page)
const getNewChannelForm = (req, res) => {
    res.send("Send the create channel page");
};

// Save a new communication channel
const createChannel = (req, res) => {
    console.log(req.body);
    res.send("Saving a new channel");
};

// Edit a specific communication channel (form page)
const getEditChannelForm = (req, res) => {
    res.send(`Edit specific channel with ID: ${req.params.id}`);
};

// Save the edited communication channel
const updateChannel = (req, res) => {
    console.log(req.body);
    res.send(`Saving the edited channel ${req.params.id}`);
};

// Delete a specific communication channel
const deleteChannel = (req, res) => {
    res.send(`Deleting channel ${req.params.id}`);
};

// View a specific communication channel
const getChannelById = (req, res) => {
    res.send(`Viewing channel with ID: ${req.params.id}`);
};

module.exports = {
    getAllChannels,
    getNewChannelForm,
    createChannel,
    getEditChannelForm,
    updateChannel,
    deleteChannel,
    getChannelById
};