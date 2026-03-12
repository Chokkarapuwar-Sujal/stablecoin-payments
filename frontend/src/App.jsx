import { Suspense, lazy } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";

const SendPayment = lazy(() => import("./pages/SendPayment"));
const ScanQR = lazy(() => import("./pages/ScanQR"));
const TransactionStatus = lazy(() => import("./pages/TransactionStatus"));

function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-4 text-sm">
          <h1 className="mr-auto text-lg font-bold text-brand-100">Stablecoin Payments</h1>
          <Link className="rounded px-3 py-1 hover:bg-slate-800" to="/">
            Home
          </Link>
          <Link className="rounded px-3 py-1 hover:bg-slate-800" to="/send">
            Send Payment
          </Link>
          <Link className="rounded px-3 py-1 hover:bg-slate-800" to="/scan">
            Scan QR
          </Link>
          <Link className="rounded px-3 py-1 hover:bg-slate-800" to="/status">
            Transaction Status
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Suspense fallback={<div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-300">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/send" element={<SendPayment />} />
            <Route path="/scan" element={<ScanQR />} />
            <Route path="/status" element={<TransactionStatus />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
