import apiClient from './client';

export const createRumahSakit = (payload) => apiClient.post('/rumah-sakit', payload);

export const getAllRumahSakit = (params) => apiClient.get('/rumah-sakit', { params });

export const getRumahSakitById = (id) => apiClient.get(`/rumah-sakit/${id}`);

export const updateRumahSakit = (id, payload) => apiClient.put(`/rumah-sakit/${id}`, payload);

export const deleteRumahSakit = (id) => apiClient.delete(`/rumah-sakit/${id}`);
