import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

export async function sendPayment(payload) {
  const response = await apiClient.post("/payments/send", payload);
  return response.data;
}

export async function createMerchantQr(payload) {
  const response = await apiClient.post("/payments/qr", payload);
  return response.data;
}

export async function getTransactionStatus(txId) {
  const response = await apiClient.get(`/payments/status/${txId}`);
  return response.data;
}
