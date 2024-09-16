const express = require("express");
const { createNewUser } = require("../controllers/admin.controller");
const router = express.Router();

router.post("/create", createNewUser);

module.exports = router;
