import apiClient from './client';

export const loginAuth = (payload) => {
  return apiClient.post('/auth/login', payload);
};

export const getProfile = () => {
  return apiClient.get('/auth/profile');
};

export const logoutAuth = (token) => {
  return apiClient.post('/auth/logout', null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};