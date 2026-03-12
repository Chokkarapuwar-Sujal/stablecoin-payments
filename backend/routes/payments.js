const express = require("express");
const {
  sendPayment,
  generateMerchantQr,
  getPaymentStatus
} = require("../controllers/paymentsController");

const router = express.Router();

router.post("/send", sendPayment);
router.post("/qr", generateMerchantQr);
router.get("/status/:txId", getPaymentStatus);

module.exports = router;
