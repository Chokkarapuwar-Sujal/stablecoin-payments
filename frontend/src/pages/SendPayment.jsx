import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
import WalletConnect from "../components/WalletConnect";
import PaymentForm from "../components/PaymentForm";
import { sendPayment } from "../services/api";

const peraWallet = new PeraWalletConnect();

function uint8ToBase64(bytes) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function getAlgodClient() {
  const server = import.meta.env.VITE_ALGOD_SERVER || "https://testnet-api.algonode.cloud";
  const token = import.meta.env.VITE_ALGOD_TOKEN || "";
  const port = import.meta.env.VITE_ALGOD_PORT || "";
  return new algosdk.Algodv2(token, server, port);
}

function toMicroAmount(amount) {
  return Math.round(Number(amount) * 1_000_000);
}

function SendPayment() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const stablecoinAssetId = useMemo(() => Number(import.meta.env.VITE_STABLECOIN_ASSET_ID || 0), []);

  const handleWalletChange = useCallback((address) => {
    setWalletAddress(address);
  }, []);

  const handleSubmit = async ({ receiver, amount, note }) => {
    try {
      setSubmitting(true);
      setError("");

      let result;

      if (walletAddress) {
        const algodClient = getAlgodClient();
        const params = await algodClient.getTransactionParams().do();

        const txn =
          stablecoinAssetId > 0
            ? algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                sender: walletAddress,
                receiver,
                amount: toMicroAmount(amount),
                assetIndex: stablecoinAssetId,
                note: note ? new TextEncoder().encode(note) : undefined,
                suggestedParams: params
              })
            : algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: walletAddress,
                receiver,
                amount: toMicroAmount(amount),
                note: note ? new TextEncoder().encode(note) : undefined,
                suggestedParams: params
              });

        const txnsToSign = [
          {
            txn: uint8ToBase64(algosdk.encodeUnsignedTransaction(txn))
          }
        ];

        const signed = await peraWallet.signTransaction([txnsToSign]);
        const signedTxnBase64 = uint8ToBase64(signed[0]);

        result = await sendPayment({
          sender: walletAddress,
          receiver,
          amount,
          signedTxn: signedTxnBase64,
          note
        });
      } else {
        // Mnemonic mode: backend signs with SENDER_MNEMONIC.
        result = await sendPayment({ receiver, amount, note });
      }

      navigate(`/status?txId=${result.txId}`);
    } catch (submitError) {
      setError(submitError.response?.data?.error || submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Send Stablecoin Payment</h2>
      <WalletConnect onAddressChange={handleWalletChange} />
      <p className="text-sm text-slate-400">
        Wallet is optional. If not connected, backend signs using <code>SENDER_MNEMONIC</code>.
      </p>
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <PaymentForm onSubmit={handleSubmit} submitting={submitting} />
        {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
      </div>
    </section>
  );
}

export default SendPayment;
