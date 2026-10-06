
const express = require("express");
const router = express.Router();
const statusController = require("../controllers/StatusController");

router.get("/statuses", statusController.getAllStatuses);


router.get("/status/new", statusController.getNewStatusForm);
router.post("/status/new", statusController.createStatus);

router.get("/status/edit/:id", statusController.getEditStatusForm);
router.post("/status/edit/:id", statusController.updateStatus);

router.post("/status/delete/:id", statusController.deleteStatus);

router.get("/status/:id", statusController.getStatus);

module.exports = router;

