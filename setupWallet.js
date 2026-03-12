const fs = require("fs");
const path = require("path");
const algosdk = require("algosdk");

const projectRoot = __dirname;
const envPath = path.join(projectRoot, ".env");
const envExamplePath = path.join(projectRoot, ".env.example");

function ensureEnvFile() {
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log("Created .env from .env.example");
      return;
    }
    fs.writeFileSync(envPath, "", "utf8");
    console.log("Created empty .env");
  }
}

function setEnvValue(content, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${escapedKey}=.*$`, "m");
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  }
  const suffix = content.endsWith("\n") || content.length === 0 ? "" : "\n";
  return `${content}${suffix}${key}=${value}\n`;
}

function getAddressString(addr) {
  if (typeof addr === "string") return addr;
  return algosdk.encodeAddress(addr.publicKey);
}

function main() {
  ensureEnvFile();

  const account = algosdk.generateAccount();
  const address = getAddressString(account.addr);
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

  let env = fs.readFileSync(envPath, "utf8");
  env = setEnvValue(env, "SENDER_MNEMONIC", mnemonic);
  fs.writeFileSync(envPath, env, "utf8");

  console.log("Wallet Address:", address);
  console.log("Mnemonic:", mnemonic);
  console.log("Mnemonic written to .env");
  console.log("Fund this wallet using: https://dispenser.testnet.aws.algodev.network/");
}

main();
