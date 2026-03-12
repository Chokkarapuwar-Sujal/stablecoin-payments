const algosdk = require("algosdk");

const algodServer = process.env.ALGOD_SERVER || "https://testnet-api.algonode.cloud";
const algodPort = process.env.ALGOD_PORT || "";
const algodToken = process.env.ALGOD_TOKEN || "";
const indexerServer = process.env.INDEXER_SERVER || "https://testnet-idx.algonode.cloud";
const indexerPort = process.env.INDEXER_PORT || "";
const indexerToken = process.env.INDEXER_TOKEN || "";
const stablecoinAssetId = Number(process.env.STABLECOIN_ASSET_ID || 0);

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
const indexerClient = new algosdk.Indexer(indexerToken, indexerServer, indexerPort);

function normalizeAddress(addr) {
  if (typeof addr === "string") return addr;
  if (addr && addr.publicKey) return algosdk.encodeAddress(addr.publicKey);
  return "";
}

function toMicroAmount(amount) {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Amount must be a positive number");
  }
  return Math.round(parsed * 1_000_000);
}

async function waitForConfirmation(txId, timeoutRounds = 30) {
  try {
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, timeoutRounds);

    return {
      txId,
      confirmedRound: confirmedTxn["confirmed-round"],
      status: "confirmed"
    };
  } catch (_error) {
    const pending = await algodClient.pendingTransactionInformation(txId).do();

    if (pending["pool-error"] && pending["pool-error"].length > 0) {
      throw new Error(`Transaction rejected: ${pending["pool-error"]}`);
    }

    return {
      txId,
      status: "pending",
      message: "Confirmation not reached within timeout"
    };
  }
}

async function getTransactionStatus(txId) {
  const pending = await algodClient.pendingTransactionInformation(txId).do();

  if (pending["confirmed-round"] && pending["confirmed-round"] > 0) {
    return {
      txId,
      status: "confirmed",
      confirmedRound: pending["confirmed-round"]
    };
  }

  if (pending["pool-error"] && pending["pool-error"].length > 0) {
    return {
      txId,
      status: "rejected",
      error: pending["pool-error"]
    };
  }

  try {
    const lookup = await indexerClient.lookupTransactionByID(txId).do();
    const transaction = lookup.transaction;

    if (transaction && transaction["confirmed-round"] && transaction["confirmed-round"] > 0) {
      return {
        txId,
        status: "confirmed",
        confirmedRound: transaction["confirmed-round"]
      };
    }
  } catch (_error) {
    // Leave as pending if the transaction is not yet indexed.
  }

  return {
    txId,
    status: "pending"
  };
}

async function sendStablecoin({
  sender,
  receiver,
  amount,
  signedTxn,
  note,
  senderMnemonic
}) {
  if (!receiver) {
    throw new Error("Receiver address is required");
  }

  const microAmount = toMicroAmount(amount);

  if (signedTxn) {
    if (!sender) {
      throw new Error("Sender address is required for wallet-signed transactions");
    }

    let rawSignedTxn;
    if (signedTxn.startsWith("0x")) {
      rawSignedTxn = new Uint8Array(Buffer.from(signedTxn.slice(2), "hex"));
    } else {
      rawSignedTxn = new Uint8Array(Buffer.from(signedTxn, "base64"));
    }
    const result = await algodClient.sendRawTransaction(rawSignedTxn).do();
    return {
      txId: result.txid,
      status: "submitted",
      senderAddress: normalizeAddress(sender)
    };
  }

  if (!senderMnemonic) {
    throw new Error("No signed transaction provided and sender mnemonic is missing");
  }

  const account = algosdk.mnemonicToSecretKey(senderMnemonic);
  const suggestedParams = await algodClient.getTransactionParams().do();

  const transaction =
    stablecoinAssetId > 0
      ? algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: account.addr,
          receiver,
          amount: microAmount,
          assetIndex: stablecoinAssetId,
          suggestedParams,
          note: note ? new Uint8Array(Buffer.from(note)) : undefined
        })
      : algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: account.addr,
          receiver,
          amount: microAmount,
          suggestedParams,
          note: note ? new Uint8Array(Buffer.from(note)) : undefined
        });

  const signed = transaction.signTxn(account.sk);
  const result = await algodClient.sendRawTransaction(signed).do();
  return {
    txId: result.txid,
    status: "submitted",
    senderAddress: normalizeAddress(account.addr)
  };
}

module.exports = {
  sendStablecoin,
  waitForConfirmation,
  getTransactionStatus,
  stablecoinAssetId
};
