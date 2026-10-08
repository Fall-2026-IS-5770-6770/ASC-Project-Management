const express = require("express");

const router = express.Router();

const { getViewAllClients, getClientPage, saveNewClient, editClient, saveClientEdit, deleteClient, viewSingleClient } = require("../controllers/clientsController");

router.get("/all", getViewAllClients);

router.get("/new", getClientPage);

router.post("/new", saveNewClient);

router.get("/edit/:id", editClient);

router.post("/edit/:id", saveClientEdit);

router.post("/delete/:id", deleteClient);

router.get("/:id", viewSingleClient);

module.exports = router