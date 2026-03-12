# Stablecoin Payments Architecture

## Components

- Frontend (React + TailwindCSS)
- Backend (Node.js + Express)
- Algorand Network (TestNet)
- Pera Wallet (optional user signing)
- Backend mnemonic wallet (optional service-wallet signing)

## Flow

1. User enters receiver address and amount, or scans merchant QR code.
2. User can either connect Pera Wallet or rely on backend mnemonic mode.
3. Frontend builds an Algorand transaction for wallet-signed mode.
4. In mnemonic mode, frontend sends payment intent to backend without wallet signing.
5. Backend submits ALGO transfers when `STABLECOIN_ASSET_ID=0` or ASA transfers when asset ID is greater than zero.
6. Backend waits for confirmation and returns settlement result.
7. Frontend polls `/api/payments/status/:txId` for updates.

## API Contract

- `POST /api/payments/send`
  - Body: `sender`, `receiver`, `amount`, `signedTxn`, `note`
- `POST /api/payments/qr`
  - Body: `address`, `amount`
- `GET /api/payments/status/:txId`

## Security Notes

- Private keys are not required for normal wallet-based flow.
- Optional `SENDER_MNEMONIC` can be used for service-wallet mode.
- Public Algod and Indexer endpoints can introduce short-lived status lag.
- Always validate receiver addresses and amount constraints at integration boundary.
