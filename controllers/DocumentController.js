const documents = require("../data/documents.js");
const projects = require("../data/projects.js");
const people = require("../data/people.js");

// Get all documents
function getAllDocuments(req, res) {
    console.log("DOCUMENTS ROUTE REACHED");

    const documentList = documents.map((document) => {
        const project = projects.find((p) => p.id === document.projectId);
        const uploader = people.find((p) => p.id === document.personId);

        return {
            ...document,
            projectName: project ? project.name : "Unknown Project",
            uploaderName: uploader
                ? `${uploader.firstName} ${uploader.lastName}`
                : "Unknown"
        };
    });

    res.render("documents/index", {
        documents: documentList,
        projects,
        people
    });
}

// Add a document
function saveNewDocument(req, res) {
    console.log("Document submitted:", req.body.name);
    res.redirect("/documents");
}

// Get the edit page for one document
function getEditPage(req, res) {
    const documentId = Number(req.params.id);
    const document = documents.find((d) => d.id === documentId);

    if (!document) {
        return res.status(404).send("Document not found");
    }

    res.render("documents/edit", {
        document,
        projects,
        people
    });
}

// Save document edits
function saveDocumentEdits(req, res) {
    console.log("Edited document:", req.body.name);
    res.redirect("/documents");
}

// Delete one document
function deleteDocument(req, res) {
    const documentId = Number(req.params.id);
    console.log("Delete document:", documentId);
    res.redirect("/documents");
}

// Get one document by id
function getDocument(req, res) {
    const documentId = Number(req.params.id);
    const document = documents.find((d) => d.id === documentId);

    if (!document) {
        return res.status(404).send("Document not found");
    }

    const project = projects.find((p) => p.id === document.projectId);
    const uploader = people.find((p) => p.id === document.personId);

    res.render("documents/show", {
        document,
        project,
        uploader
    });
}

module.exports = {
    getAllDocuments,
    saveNewDocument,
    getEditPage,
    saveDocumentEdits,
    deleteDocument,
    getDocument
};