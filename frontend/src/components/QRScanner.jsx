import { useEffect, useMemo, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

function parseAlgorandUri(value) {
  try {
    const normalized = value.replace("algorand://", "https://dummy/");
    const url = new URL(normalized);

    return {
      address: url.searchParams.get("address") || "",
      amount: url.searchParams.get("amount") || ""
    };
  } catch (_error) {
    return { address: "", amount: "" };
  }
}

function QRScanner({ onDecoded }) {
  const [error, setError] = useState("");
  const scannerRegionId = useMemo(() => `scanner-${Math.random().toString(36).slice(2)}`, []);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      scannerRegionId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      false
    );

    scanner.render(
      (decodedText) => {
        const parsed = parseAlgorandUri(decodedText);
        if (!parsed.address || !parsed.amount) {
          setError("Invalid QR format. Expected algorand://pay?address=...&amount=...");
          return;
        }
        onDecoded(parsed);
      },
      (_scanError) => {
        setError("");
      }
    );

    return () => {
      scanner.clear().catch(() => null);
    };
  }, [onDecoded, scannerRegionId]);

  return (
    <div className="space-y-3">
      <div id={scannerRegionId} className="overflow-hidden rounded-lg border border-slate-700" />
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}

export default QRScanner;
