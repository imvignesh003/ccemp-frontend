import { LoginResponse } from "@/types/response";
import api from "./api";

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;  
}


const profileService = {
  updateUser: async (
    id: number,
    name: string,
    contact: string
  ): Promise<boolean> => {
    console.log("Profile credentials:", id, name, contact);
    const response = await api.put(`/auth/${id}`, {
      name: name,
      contact: contact,
    });
    console.log("Response:", response.data);
    return response.data;
  },
  changePassword: async (req:PasswordChangeRequest): Promise<LoginResponse | null> => {
    console.log("Change password credentials:", req);
    console.log(req.old_password, req.new_password);
    const response = await api.post("/auth/updatePassword",req);

    console.log("Response:", response.data);
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
    }
    return response.data;
  }
  
  
};
export default profileService;
