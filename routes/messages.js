const express = require('express');
const { getMessageId, getCreateMessage, postCreateMessage, getMessages, editMessage, postEditMessage, postDeleteMessage} = require('../controllers/MessageController');

// creating the router here is a mini router - this is technically middleware! 
const router = express.Router();

// ===== MESSAGES (Issue #8) =====

router.get("/new", getCreateMessage);

router.post("/new", postCreateMessage)

router.get("", getMessages) 

router.get("/edit/:id", editMessage)

router.post("/edit/:id", postEditMessage)

router.post("/delete/:id", postDeleteMessage)

router.get("/:id", getMessageId)