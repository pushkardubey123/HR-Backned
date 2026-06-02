const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const { createOrder, verifyPayment } = require("../Controllers/PaymentController");

router.post("/create-order", auth, attachCompanyId, createOrder);
router.post("/verify", auth, attachCompanyId, verifyPayment);

module.exports = router;