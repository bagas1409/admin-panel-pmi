// src/api/distribution.ts
import api from './axios';

// ── DSD (Distribution Stok Darah) ──
export const getStockRequests = async (status?: string) => {
  const url = status ? `/distribution/requests?status=${status}` : '/distribution/requests';
  const { data } = await api.get(url);
  return data.data;
};

export const createStockRequest = async (payload: { regionId: string; bloodType: string; quantity: number; notes?: string }) => {
  const { data } = await api.post('/distribution/requests', payload);
  return data.data;
};

export const approveStockRequest = async (id: string) => {
  const { data } = await api.patch(`/distribution/requests/${id}/approve`);
  return data;
};

export const rejectStockRequest = async (id: string, notes?: string) => {
  const { data } = await api.patch(`/distribution/requests/${id}/reject`, { notes });
  return data;
};

// ── DISTRIBUTION CENTER ──
export const getDCStock = async () => {
  const { data } = await api.get('/distribution/dc/stock');
  return data.data; // { stocks: DCStock[], receptionLogs: StockRequestLog[] }
};

export const getDCInventory = async () => {
  const { data } = await api.get('/distribution/dc/inventory');
  return data.data; // DCInventory[]
};

export const addDCInventory = async (payload: { bloodType: string; productType: string; quantity: number; notes?: string }) => {
  const { data } = await api.post('/distribution/dc/inventory', payload);
  return data.data;
};
