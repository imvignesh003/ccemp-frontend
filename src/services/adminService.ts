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
    changeUserRole : async (id:string, role:UserRole) : Promise<boolean> => {
        const response = await api.put(`/admin/profile/${id}`,{ role });
        return response.data;
    },
    getAllLeads : async (): Promise<Profile[]> => {
        const response = await api.get('/admin/profile/leads');
        return response.data;
    }
}

export default adminService;