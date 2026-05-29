import apiClient from './client';

export const createDokter = (payload) => apiClient.post('/dokter', payload);

export const getAllDokter = (params) => apiClient.get('/dokter', { params });

export const getDokterById = (id) => apiClient.get(`/dokter/${id}`);

export const updateDokter = (id, payload) => apiClient.put(`/dokter/${id}`, payload);

export const deleteDokter = (id) => apiClient.delete(`/dokter/${id}`);
