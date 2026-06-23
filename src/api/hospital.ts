// src/api/hospital.ts
import api from './axios';

// ── ROLE REQUESTS ─────────────────────────────────────────────

export const submitRoleRequest = async (payload: {
  namaRs: string; noIzinRs: string; alamatRs: string;
  noTelpRs: string; namaPic: string; jabatanPic: string; dokumenIzin?: string;
}) => {
  const { data } = await api.post('/hospital/role-requests', payload);
  return data.data;
};

export const getMyRoleRequestStatus = async () => {
  const { data } = await api.get('/hospital/role-requests/my');
  return data.data;
};

export const getRoleRequests = async (status?: string) => {
  const url = status ? `/hospital/role-requests?status=${status}` : '/hospital/role-requests';
  const { data } = await api.get(url);
  return data.data;
};

export const approveRoleRequest = async (id: string) => {
  const { data } = await api.patch(`/hospital/role-requests/${id}/approve`);
  return data;
};

export const rejectRoleRequest = async (id: string, alasanTolak?: string) => {
  const { data } = await api.patch(`/hospital/role-requests/${id}/reject`, { alasanTolak });
  return data;
};

// ── BLOOD REQUESTS ────────────────────────────────────────────

export const getHospitalBloodRequests = async (status?: string) => {
  const url = status ? `/hospital/blood-requests?status=${status}` : '/hospital/blood-requests';
  const { data } = await api.get(url);
  return data.data;
};

export const getMyBloodRequests = async () => {
  const { data } = await api.get('/hospital/blood-requests/my');
  return data.data;
};

export const createBloodRequest = async (payload: any) => {
  const { data } = await api.post('/hospital/blood-requests', payload);
  return data.data;
};

export const processBloodRequest = async (id: string, namaPengambil: string) => {
  const { data } = await api.patch(`/hospital/blood-requests/${id}/process`, { namaPengambil });
  return data;
};

export const rejectBloodRequest = async (id: string, alasanTolak?: string) => {
  const { data } = await api.patch(`/hospital/blood-requests/${id}/reject`, { alasanTolak });
  return data;
};

// ── DISPENSING HISTORY ────────────────────────────────────────

export const getDispensingHistory = async () => {
  const { data } = await api.get('/hospital/dispensings');
  return data.data;
};

// ── HOSPITAL STOCKS ───────────────────────────────────────────

export const getMyBloodStocks = async () => {
  const { data } = await api.get('/hospital/stocks/my');
  return data.data;
};

export const updateMyBloodStocks = async (stocks: { bloodType: string; productType: string; quantity: number }[]) => {
  const { data } = await api.put('/hospital/stocks/my', { stocks });
  return data.data;
};

export const useMyBloodStock = async (payload: {
  bloodType: string; productType: string; quantity: number;
  namaPasien: string; noRekamMedis: string; namaDokter: string; alasanMedis: string;
}) => {
  const { data } = await api.post('/hospital/stocks/use', payload);
  return data.data;
};

export const getMyBloodUsages = async () => {
  const { data } = await api.get('/hospital/stocks/usages');
  return data.data;
};
