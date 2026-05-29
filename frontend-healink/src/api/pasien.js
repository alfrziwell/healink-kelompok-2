import apiClient from './client';

export const createPasien = (payload) => apiClient.post('/pasien', payload);

export const getAllPasien = (params) => apiClient.get('/pasien', { params });

export const getPasienByNik = (nik) => apiClient.get(`/pasien/${nik}`);

export const updatePasien = (nik, payload) => apiClient.put(`/pasien/${nik}`, payload);

export const deletePasien = (nik) => apiClient.delete(`/pasien/${nik}`);
