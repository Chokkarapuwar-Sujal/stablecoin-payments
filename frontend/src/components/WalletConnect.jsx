import { useEffect, useMemo, useState } from "react";
import { PeraWalletConnect } from "@perawallet/connect";

const peraWallet = new PeraWalletConnect();

function WalletConnect({ onAddressChange }) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          onAddressChange(accounts[0]);
        }
      })
      .catch((sessionError) => {
        setError(sessionError.message);
      });
  }, [onAddressChange]);

  const shortAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }, [address]);

  const connect = async () => {
    try {
      setError("");
      const accounts = await peraWallet.connect();
      const walletAddress = accounts[0];
      setAddress(walletAddress);
      onAddressChange(walletAddress);

      peraWallet.connector?.on("disconnect", () => {
        setAddress("");
        onAddressChange("");
      });
    } catch (connectError) {
      setError(connectError.message);
    }
  };

  const disconnect = async () => {
    await peraWallet.disconnect();
    setAddress("");
    onAddressChange("");
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-lg shadow-slate-950/30">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Wallet</p>
          <p className="text-sm font-semibold text-slate-100">
            {address ? shortAddress : "Not connected"}
          </p>
        </div>
        {address ? (
          <button
            type="button"
            onClick={disconnect}
            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-600"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={connect}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-brand-100"
          >
            Connect Pera Wallet
          </button>
        )}
      </div>
      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}

export default WalletConnect;
