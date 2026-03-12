const QRCode = require("qrcode");
const {
  sendStablecoin,
  waitForConfirmation,
  getTransactionStatus,
  stablecoinAssetId
} = require("../services/algorandService");

async function sendPayment(req, res, next) {
  try {
    const { sender, receiver, amount, signedTxn, note } = req.body;

    const submitResult = await sendStablecoin({
      sender,
      receiver,
      amount,
      signedTxn,
      note,
      senderMnemonic: process.env.SENDER_MNEMONIC
    });

    const confirmation = await waitForConfirmation(submitResult.txId);

    res.json({
      success: true,
      assetId: stablecoinAssetId,
      ...submitResult,
      confirmation
    });
  } catch (error) {
    next(error);
  }
}

async function generateMerchantQr(req, res, next) {
  try {
    const { address, amount } = req.body;

    if (!address || !amount) {
      return res.status(400).json({ error: "address and amount are required" });
    }

    const payload = `algorand://pay?address=${address}&amount=${amount}`;
    const qrCodeDataUrl = await QRCode.toDataURL(payload);

    return res.json({
      success: true,
      payload,
      qrCodeDataUrl
    });
  } catch (error) {
    next(error);
  }
}

async function getPaymentStatus(req, res, next) {
  try {
    const { txId } = req.params;
    const status = await getTransactionStatus(txId);
    res.json({ success: true, ...status });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendPayment,
  generateMerchantQr,
  getPaymentStatus
};
