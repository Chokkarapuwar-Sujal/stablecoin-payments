import { useState } from "react";
import { createMerchantQr } from "../services/api";

function Home() {
  const [merchantAddress, setMerchantAddress] = useState("");
  const [amount, setAmount] = useState("10");
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState("");

  const generateQr = async (event) => {
    event.preventDefault();
    try {
      setError("");
      const data = await createMerchantQr({ address: merchantAddress, amount });
      setQrData(data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold">Merchant QR Generator</h3>
        <p className="mt-1 text-sm text-slate-400">
          Merchants can generate payment QR payloads for customer checkout.
        </p>

        <form onSubmit={generateQr} className="mt-4 space-y-3">
          <input
            required
            value={merchantAddress}
            onChange={(event) => setMerchantAddress(event.target.value.trim())}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Merchant Algorand address"
          />
          <input
            required
            type="number"
            min="0.000001"
            step="0.000001"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Amount"
          />
          <button
            type="submit"
            className="rounded-md bg-brand-500 px-4 py-2 font-semibold text-slate-900 hover:bg-brand-100"
          >
            Generate QR
          </button>
        </form>

        {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}

        {qrData ? (
          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-4">
            <img src={qrData.qrCodeDataUrl} alt="Merchant QR code" className="h-56 w-56 rounded bg-white p-2" />
            <p className="mt-3 break-all text-xs text-slate-400">{qrData.payload}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default Home;
