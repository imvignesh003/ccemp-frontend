import { Events } from '@/pages/event/EventPage';
import api from '@/services/api';
import { RegistrationDetails } from '@/types';
import { Event } from '@/types/response';

export const eventService = {
    createEvent: async (eventData: Partial<Event>): Promise<Events> => {
        console.log(eventData);
        const response = await api.post('/events', eventData);
        return response.data;
    },
    getAllEventsCount: async (): Promise<number> => {
        const response = await api.get('/events/count');
        return response.data;
    },
    getAllEvents: async (): Promise<Events[]> => {
        const response = await api.get('/events');
        return response.data;
    },

    getClubEvents: async (clubId: string): Promise<Events[]> => {
        console.log(clubId);
        const response = await api.get(`/events/club/${clubId}`);
        return response.data;
    },

    getEventById: async (eventId: string): Promise<Events> => {
        const response = await api.get(`/events/${eventId}`);
        return response.data;
    },

    getUserRegistrations: async (userId: string): Promise<string[]> => {
        console.log("Getting events registered by user:", userId);
        const response = await api.get(`/events/registrations/user/${userId}`);
        return response.data;
    },

    getEventRegistrations: async (eventId: string): Promise<RegistrationDetails[]> => {
        const response = await api.get(`/events/registrations/${eventId}`);
        return response.data;
    },

    getRegistrationCount: async (eventId: string): Promise<number> => {
        const response = await api.get(`/events/registrations/${eventId}/count`);
        return response.data;
    },

    registerForEvent: async (eventId: string, userId: string): Promise<boolean> => {
        const response = await api.post(`/events/${eventId}/register`, {userId:Number(userId)});
        return response.data;
    },

    cancelRegistration: async (eventId: string, userId: string): Promise<boolean> => {
        const response = await api.delete(`/events/${eventId}/register`, {data: {userId:Number(userId)}});
        return response.data;
    },

    getUserEvents: async (userId: string): Promise<Events[]> => {
        const response = await api.get(`/events/user/${userId}`);
        return response.data;
    }
};
