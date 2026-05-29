import apiClient from './client';

export const createDiagnosa = (payload) => apiClient.post('/diagnosa', payload);

export const getBlockchainTransaction = (txId) => apiClient.get(`/diagnosa/blockchain/${txId}`);

export const getPatientMedicalHistory = (nik) => apiClient.get(`/diagnosa/patient/${nik}/medical-history`);

export const getHospitalDiagnosisSummary = (id_rs) => apiClient.get(`/diagnosa/hospital/${id_rs}/summary`);

export const getAllDiagnosa = (params) => apiClient.get('/diagnosa', { params });

export const getDiagnosaById = (id) => apiClient.get(`/diagnosa/${id}`);

export const updateDiagnosa = (id, payload) => apiClient.put(`/diagnosa/${id}`, payload);

export const deleteDiagnosa = (id) => apiClient.delete(`/diagnosa/${id}`);
