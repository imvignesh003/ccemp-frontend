
import api from './api';
import { Club } from '../types';

const clubService = {
  getAllClubs: async (): Promise<Club[]> => {
    const response = await api.get('/clubs');
    return response.data;
  },
  
  getClubById: async (id: string): Promise<Club> => {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  },
  
  getUserClubs: async (): Promise<Club[]> => {
    const response = await api.get('/clubs/user');
    return response.data;
  },
  
  createClub: async (clubData: Partial<Club>): Promise<Club> => {
    const response = await api.post('/clubs', clubData);
    return response.data;
  },
  
  updateClub: async (id: string, clubData: Partial<Club>): Promise<Club> => {
    const response = await api.put(`/clubs/${id}`, clubData);
    return response.data;
  },
  
  deleteClub: async (id: string): Promise<void> => {
    await api.delete(`/clubs/${id}`);
  },
  
  joinClub: async (clubId: string): Promise<void> => {
    await api.post(`/clubs/${clubId}/join`);
  },
  
  leaveClub: async (clubId: string): Promise<void> => {
    await api.post(`/clubs/${clubId}/leave`);
  }
};

export default clubService;
