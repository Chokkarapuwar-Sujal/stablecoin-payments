const algosdk = require("algosdk");
const { createAlgodClient } = require("./algorandClient");

function toMicroAmount(amount) {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Amount must be a positive number");
  }
  return Math.round(parsed * 1_000_000);
}

async function createAssetTransferTransaction({ sender, receiver, amount, assetId, note }) {
  const client = createAlgodClient();
  const suggestedParams = await client.getTransactionParams().do();

  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender,
    receiver,
    amount: toMicroAmount(amount),
    assetIndex: Number(assetId),
    suggestedParams,
    note: note ? new Uint8Array(Buffer.from(note)) : undefined
  });
}

module.exports = {
  createAssetTransferTransaction,
  toMicroAmount
};
