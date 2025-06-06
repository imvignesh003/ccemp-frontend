import api from "@/services/api"
import { UserRole } from "@/types";

export interface Profile {
    id: string;
    name: string;
    email: string;
    contact: string;
    role: UserRole;
}

const adminService = {
    getAllUsers : async (): Promise<Profile[]> => {
        const response = await api.get('/admin/profiles');
        return response.data;
    },
    getAllUsersCount : async (): Promise<number> => {
        const response = await api.get('/admin/profiles/count');
        return response.data;
    },
    changeUserRole : async (id:string, role:UserRole) : Promise<boolean> => {
        const response = await api.put(`/admin/profile/${id}`,{ role });
        return response.data;
    },
    getAllLeads : async (): Promise<Profile[]> => {
        console.log("Fetching all leads");
        const response = await api.get('/admin/profile/leads');
        return response.data;
    },
    getProfileById : async (id : string): Promise<Profile> => {
        const response = await api.get(`/profile/${id}`);
        return response.data;
    }
}

export default adminService;