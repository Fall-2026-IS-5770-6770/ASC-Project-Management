// run the loading code for reflect meta-data
require('reflect-metadata')

require('dotenv').config(); // env variables being brought in
const postgres = require("../app-data-source");
const DocumentTable = require('../entities/Document.entities.js');

// querrying document repo to assign it to a variable
const documentRepo = postgres.manager.getRepository(DocumentTable);



// bring in connection to other data
const projects = require("../data/projects.js");
const people = require("../data/people.js");

// Get all documents
async function getAllDocuments(req, res) {
    // retreive all documents currently stored in table 
    let documents = await documentRepo.find();

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
async function saveNewDocument(req, res) {
    console.log("Document submitted:", req.body.name);
    const newDocument = documentRepo.create();
    
    // add fields to document 
    newDocument.name = req.body.name;
    newDocument.type = req.body.type;
    newDocument.fileName = req.body.fileName;
    newDocument.fileUrl = req.body.fileUrl;
    newDocument.projectId = Number(req.body.projectId);
    newDocument.personId = Number(req.body.personId);
    newDocument.uploadedDate = req.body.uploadedDate;
    newDocument.version = req.body.version;
    newDocument.status = req.body.status;

    // save function to write to table 
    await documentRepo.save(newDocument);
    res.redirect("/documents");
}

// Get the edit page for one document
async function getEditPage(req, res) {
    const documentId = Number(req.params.id);
    const document = await documentRepo.findOneBy({ id: documentId });

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
async function saveDocumentEdits(req, res) {
    console.log("Edited document:", req.body.name);

    const documentId = Number(req.params.id);
    const foundDocument = await documentRepo.findOneBy({ id: documentId });

    if (!foundDocument) {
        return res.status(404).send("Document not found");
    }

    foundDocument.name = req.body.name;
    foundDocument.type = req.body.type;
    foundDocument.fileName = req.body.fileName;
    foundDocument.fileUrl = req.body.fileUrl;
    foundDocument.projectId = Number(req.body.projectId);
    foundDocument.personId = Number(req.body.personId);
    foundDocument.uploadedDate = req.body.uploadedDate;
    foundDocument.version = req.body.version;
    foundDocument.status = req.body.status;

    await documentRepo.save(foundDocument);

    res.redirect("/documents");
}

// Delete one document
async function deleteDocument(req, res) {
    const documentId = Number(req.params.id);
    const document = await documentRepo.findOneBy({ id: documentId });

    if (!document) {
        return res.status(404).send("Document not found");
    }

    await documentRepo.remove(document);
    console.log("Delete document:", documentId);
    res.redirect("/documents");
}

// Get one document by id
async function getDocument(req, res) {
    const documentId = Number(req.params.id);
    const document = await documentRepo.findOneBy({ id: documentId});

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