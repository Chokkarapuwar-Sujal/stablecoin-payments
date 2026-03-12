import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getTransactionStatus } from "../services/api";

function TransactionStatus() {
  const [searchParams] = useSearchParams();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const txId = searchParams.get("txId") || "";

  useEffect(() => {
    if (!txId) return;

    let intervalId;
    let isActive = true;

    const fetchStatus = async () => {
      try {
        if (!isActive) return;

        setError("");
        setLoading(true);
        const data = await getTransactionStatus(txId);

        if (!isActive) return;

        setStatusData(data);

        if (data.status === "confirmed" || data.status === "rejected") {
          clearInterval(intervalId);
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.response?.data?.error || requestError.message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 4000);

    return () => {
      isActive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [txId]);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="text-2xl font-bold">Transaction Status</h2>
      <p className="mt-2 break-all text-sm text-slate-300">TX ID: {txId || "No transaction selected"}</p>

      {loading ? <p className="mt-4 text-sm text-slate-400">Checking blockchain status...</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

      {statusData?.status === "confirmed" ? (
        <div className="mt-5 rounded-lg border border-brand-700 bg-brand-900/30 p-4">
          <p className="font-semibold text-brand-100">Payment Confirmed on Algorand</p>
          <p className="mt-1 text-sm">Transaction ID: {statusData.txId}</p>
          <p className="text-sm">Confirmed Round: {statusData.confirmedRound}</p>
        </div>
      ) : null}

      {statusData?.status === "pending" ? (
        <div className="mt-5 rounded-lg border border-amber-700 bg-amber-900/30 p-4">
          <p className="font-semibold text-amber-100">Transaction is pending confirmation</p>
        </div>
      ) : null}

      {statusData?.status === "rejected" ? (
        <div className="mt-5 rounded-lg border border-rose-700 bg-rose-900/30 p-4">
          <p className="font-semibold text-rose-100">Transaction was rejected</p>
          <p className="text-sm">Reason: {statusData.error}</p>
        </div>
      ) : null}
    </section>
  );
}

export default TransactionStatus;
