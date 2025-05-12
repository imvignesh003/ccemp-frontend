
import api from './api';
import { Club, UserRole } from '../types';



export interface MemberData {
  id: string;
  profile : {
    id: number;
    name: string;
    email: string;
    contact: string;
    role: UserRole;
  };
  club : Club;
  clubDto ?: Club;
  joinedDate ?: Date;
  status : 'PENDING' | 'APPROVED' | 'REJECTED' | 'NONE';
  joinedAt : Date | undefined;
}

const clubService = {
  getAllClubs: async (): Promise<Club[]> => {
    const response = await api.get('/clubs');
    return response.data;
  },

  getMyClubs: async (leadId: number): Promise<Club[]> => {
    const response = await api.get(`/clubs/lead/${leadId}`);
    return response.data;
  },
  
  getClubById: async (id: string): Promise<Club> => {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  },

  getClubMembersCount: async (id: string): Promise<number> => {
    const response = await api.get(`/clubs/${id}/members/count`);
    return response.data;
  },

  getClubMemberDetails: async(id:string): Promise<MemberData[]> => {
    const response = await api.get(`/clubs/${id}/members`);
    console.log("response"+ response.data);
    return response.data;
  },

  joinClub: async (clubId: string, userId: number): Promise<boolean> => {
    console.log(clubId, userId);
    const response = await api.post(`/clubs/${clubId}/join`, { userId });
    return response.data;
  },

  approve : async (clubId: string, userId: number): Promise<boolean> => {
    const response = await api.post(`/clubs/${clubId}/approve`, { userId });
    return response.data;
  },

  reject : async (clubId: string, userId: number): Promise<boolean> => {
    const response = await api.post(`/clubs/${clubId}/reject`, { userId });
    return response.data;
  },

  remove : async (clubId: string, userId: number): Promise<boolean> => {
    const response = await api.post(`/clubs/${clubId}/remove`, { userId });
    return response.data;
  },
  getMemberStatus: async (clubId: string, userId: number): Promise<MemberData> => {
    const response = await api.get(`/clubs/${clubId}/status/${userId}`);
    return response.data;
  },
  
  getUserClubs: async (userId: number): Promise<Club[]> => {
    const response = await api.get(`/clubs/user/${userId}`);
    return response.data;
  },



  
  createClub: async (clubData: Partial<Club>): Promise<Club> => {
    console.log(clubData)
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
  

  
  leaveClub: async (clubId: string): Promise<void> => {
    await api.post(`/clubs/${clubId}/leave`);
  }
};

export default clubService;
