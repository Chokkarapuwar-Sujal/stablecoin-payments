import { useEffect, useState } from "react";

function PaymentForm({ defaultReceiver = "", defaultAmount = "", onSubmit, submitting }) {
  const [receiver, setReceiver] = useState(defaultReceiver);
  const [amount, setAmount] = useState(defaultAmount);
  const [note, setNote] = useState("Stablecoin payment");

  useEffect(() => {
    setReceiver(defaultReceiver || "");
  }, [defaultReceiver]);

  useEffect(() => {
    setAmount(defaultAmount || "");
  }, [defaultAmount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({ receiver, amount, note });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm text-slate-300" htmlFor="receiver">
          Receiver Wallet Address
        </label>
        <input
          id="receiver"
          required
          value={receiver}
          onChange={(event) => setReceiver(event.target.value.trim())}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-brand-500 focus:ring-2"
          placeholder="ALGOSENDER..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300" htmlFor="amount">
          Amount
        </label>
        <input
          id="amount"
          required
          type="number"
          min="0.000001"
          step="0.000001"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-brand-500 focus:ring-2"
          placeholder="10"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300" htmlFor="note">
          Note (optional)
        </label>
        <input
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-brand-500 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-brand-500 px-5 py-2 font-semibold text-slate-900 hover:bg-brand-100 disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Send Stablecoin"}
      </button>
    </form>
  );
}

export default PaymentForm;
