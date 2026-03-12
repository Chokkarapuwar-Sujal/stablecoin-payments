const algosdk = require("algosdk");

function createAlgodClient() {
  const server = process.env.ALGOD_SERVER || "https://testnet-api.algonode.cloud";
  const token = process.env.ALGOD_TOKEN || "";
  const port = process.env.ALGOD_PORT || "";
  return new algosdk.Algodv2(token, server, port);
}

module.exports = {
  createAlgodClient
};
