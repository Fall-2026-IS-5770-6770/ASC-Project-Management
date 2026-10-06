const express = require("express");

const router = express.Router();

const {getAllChannels, getNewChannelForm, createChannel, getEditChannelForm, updateChannel, deleteChannel, getChannelById} = require("../controllers/communicationchannelcontroller.js")

// Static paths (all, new, edit, delete) must be registered before /:id so they aren't shadowed.

// View all communication channels
router.get("/all", getAllChannels);

// Get the create channel page
router.get("/new", getNewChannelForm);

// Save a new communication channel
router.post("/new", createChannel);

// Get the edit page for one channel
router.get("/edit/:id", getEditChannelForm);

// Save the edited channel
router.post("/edit/:id", updateChannel);

// Delete one channel by id
router.post("/delete/:id", deleteChannel);

// View one channel by id
router.get("/:id", getChannelById);

module.exports = router