const express = require("express");

const router = express.Router();

const {
    getAllDocuments,
    saveNewDocument,
    getEditPage,
    saveDocumentEdits,
    deleteDocument,
    getDocument
} = require("../controllers/DocumentController");

// Get all documents
router.get("/", getAllDocuments);

// Add a document
router.post("/new", saveNewDocument);

// Get the edit page for one document
router.get("/edit/:id", getEditPage);

// Save document edits
router.post("/edit/:id", saveDocumentEdits);

// Delete one document
router.post("/delete/:id", deleteDocument);

// Get one document by id
router.get("/:id", getDocument);

module.exports = router;