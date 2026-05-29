import apiClient from './client';

export const getFabricHealth = () => apiClient.get('/fabric/health');

export const getAllLedgerRecords = () => apiClient.get('/fabric/ledger/all');
