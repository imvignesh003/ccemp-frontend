import api from '@/services/api';
import { Announcement } from '@/types/response';

export const announcementService = {
    createAnnouncement: async (announcementData: Partial<Announcement>): Promise<Announcement> => {
        console.log(announcementData);
        const response = await api.post('/announcements', announcementData);
        return response.data;
    },
    
    getAllAnnouncements: async (): Promise<Announcement[]> => {
        const response = await api.get('/announcements');
        return response.data;
    },
    
    getClubAnnouncements: async (clubId: string): Promise<Announcement[]> => {
        const response = await api.get(`/announcements/club/${clubId}`);
        return response.data;
    },
    
    getAnnouncementById: async (announcementId: string): Promise<Announcement> => {
        const response = await api.get(`/announcements/${announcementId}`);
        return response.data;
    },
}