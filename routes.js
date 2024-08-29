const express = require("express");
const router = express.Router();
const authRoutes = require("./routes/auth.route");
const adminRoutes = require("./routes/admin.route");

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
