const express = require("express");
const banController = require("../controllers/banController");

const router = express.Router();

router.get("/", banController.getList);
router.post("/", banController.create);
router.put("/:id", banController.update);
router.delete("/:id", banController.remove);

module.exports = router;
