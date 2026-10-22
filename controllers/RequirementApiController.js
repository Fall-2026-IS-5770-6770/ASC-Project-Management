const requirements = require("../data/requirements.js");

const editableFields = [
    "projectId",
    "title",
    "description",
    "priority",
    "statusId",
    "dueDate",
    "assignedPersonId",
    "mentorPersonId",
    "acceptanceCriteria",
    "estimatedHours",
    "actualHours"
];

function getId(req, res) {
    const id = Number(req.params.id);

    if (!/^\d+$/.test(req.params.id) || !Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ error: "Requirement id must be a positive integer." });
        return null;
    }

    return id;
}

function getEditableValues(body, res) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        res.status(400).json({ error: "Request body must be a JSON object." });
        return null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "id")) {
        res.status(400).json({ error: "Requirement id is assigned by the server and cannot be changed." });
        return null;
    }

    const unknownFields = Object.keys(body).filter((field) => !editableFields.includes(field));
    if (unknownFields.length > 0) {
        res.status(400).json({ error: `Unknown requirement field: ${unknownFields.join(", ")}.` });
        return null;
    }

    const values = { ...body };
    if (Object.prototype.hasOwnProperty.call(values, "title")) {
        if (typeof values.title !== "string" || values.title.trim() === "") {
            res.status(400).json({ error: "Requirement title must be a non-empty string." });
            return null;
        }
        values.title = values.title.trim();
    }

    return values;
}

function getAllRequirements(req, res) {
    return res.status(200).json(requirements);
}

function getRequirement(req, res) {
    const id = getId(req, res);
    if (id === null) return;

    const requirement = requirements.find((item) => item.id === id);
    if (!requirement) {
        return res.status(404).json({ error: `Requirement ${id} was not found.` });
    }

    return res.status(200).json(requirement);
}

function createRequirement(req, res) {
    const values = getEditableValues(req.body, res);
    if (values === null) return;

    if (typeof values.title !== "string" || values.title.trim() === "") {
        return res.status(400).json({ error: "Requirement title is required." });
    }

    const id = requirements.reduce((highestId, item) => Math.max(highestId, item.id), 0) + 1;
    const requirement = { id, ...values };
    requirements.push(requirement);

    return res.status(201).json(requirement);
}

function updateRequirement(req, res) {
    const id = getId(req, res);
    if (id === null) return;

    const requirement = requirements.find((item) => item.id === id);
    if (!requirement) {
        return res.status(404).json({ error: `Requirement ${id} was not found.` });
    }

    const values = getEditableValues(req.body, res);
    if (values === null) return;
    if (Object.keys(values).length === 0) {
        return res.status(400).json({ error: "Provide at least one field to update." });
    }

    const updatedRequirement = { ...requirement, ...values };
    if (typeof updatedRequirement.title !== "string" || updatedRequirement.title.trim() === "") {
        return res.status(400).json({ error: "Requirement title must be a non-empty string." });
    }

    Object.assign(requirement, values);
    return res.status(200).json(requirement);
}

function deleteRequirement(req, res) {
    const id = getId(req, res);
    if (id === null) return;

    const index = requirements.findIndex((item) => item.id === id);
    if (index === -1) {
        return res.status(404).json({ error: `Requirement ${id} was not found.` });
    }

    const [deletedRequirement] = requirements.splice(index, 1);
    return res.status(200).json({
        message: "Requirement deleted.",
        requirement: deletedRequirement
    });
}

module.exports = {
    getAllRequirements,
    getRequirement,
    createRequirement,
    updateRequirement,
    deleteRequirement
};
