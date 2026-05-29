import apiClient from './client';

export const getAllAdmins = (params) => apiClient.get('/users/admins', { params });

export const getAdminById = (id) => apiClient.get(`/users/admins/${id}`);

export const createAdmin = (payload) => apiClient.post('/users/admins', payload);

export const updateAdmin = (id, payload) => apiClient.put(`/users/admins/${id}`, payload);

export const deleteAdmin = (id) => apiClient.delete(`/users/admins/${id}`);
