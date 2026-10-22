const express = require("express");
const {
    getAllRequirements,
    getRequirement,
    createRequirement,
    updateRequirement,
    deleteRequirement
} = require("../controllers/RequirementApiController.js");

const router = express.Router();

router.get("/requirements", getAllRequirements);
router.post("/requirements", createRequirement);
router.get("/requirements/:id", getRequirement);
router.put("/requirements/:id", updateRequirement);
router.patch("/requirements/:id", updateRequirement);
router.delete("/requirements/:id", deleteRequirement);

module.exports = router;
