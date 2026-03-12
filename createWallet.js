const algosdk = require("algosdk");

const account = algosdk.generateAccount();
const address =
	typeof account.addr === "string"
		? account.addr
		: algosdk.encodeAddress(account.addr.publicKey);

console.log("Address:", address);
console.log("Mnemonic:", algosdk.secretKeyToMnemonic(account.sk));
