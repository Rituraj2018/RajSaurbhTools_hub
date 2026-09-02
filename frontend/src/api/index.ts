import { axiosClient } from './axiosClient';
import { HealthCheckData } from '../types';

export const systemApi = {
  getHealth: async (): Promise<HealthCheckData> => {
    const response = await axiosClient.get<HealthCheckData>('/health');
    return response.data;
  },
};

export { axiosClient };
export * from './filesApi';
export * from './historyApi';
