import axios from 'axios';
import { User, Farm, RecommendationResponse, MarketData, SignupData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (signupData: SignupData): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/signup', signupData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const farmAPI = {
  createFarm: async (farmData: Omit<Farm, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Farm> => {
    const response = await api.post('/farms', farmData);
    return response.data;
  },

  getFarms: async (): Promise<Farm[]> => {
    const response = await api.get('/farms');
    return response.data;
  },

  getFarm: async (farmId: string): Promise<Farm> => {
    const response = await api.get(`/farms/${farmId}`);
    return response.data;
  },

  updateFarm: async (farmId: string, farmData: Partial<Farm>): Promise<Farm> => {
    const response = await api.put(`/farms/${farmId}`, farmData);
    return response.data;
  },

  deleteFarm: async (farmId: string): Promise<void> => {
    await api.delete(`/farms/${farmId}`);
  },
};

export const recommendationAPI = {
  getRecommendations: async (farmId: string): Promise<RecommendationResponse> => {
    const response = await api.post('/recommendations', { farmId });
    return response.data;
  },
};

export const marketAPI = {
  getMarketTrends: async (): Promise<MarketData[]> => {
    const response = await api.get('/market/trends');
    return response.data;
  },

  getCropPrices: async (crop: string): Promise<MarketData> => {
    const response = await api.get(`/market/crops/${crop}`);
    return response.data;
  },
};

export default api;