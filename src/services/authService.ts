
import api from './api';
import { LoginResponse } from '@/types/response';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

// export interface AuthResponse {
//   user: {
//     id: string;
//     email: string;
//     name: string;
//   };
//   profile: {
//     id: string;
//     role: string;
//   };
//   token: string;
// }



const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('Login credentials:', credentials);
    const response = await api.post('/auth/login', credentials);
    console.log('Login response:', response.data);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  
  signup: async (userData: SignupRequest): Promise<LoginResponse> => {
    console.log('Signup credentials:', userData);
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },
  
  getCurrentUser: async (): Promise<LoginResponse | null> => {
    try {
      const response = await api.get('/auth');
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Invalid/expired token — remove it from localStorage
        localStorage.removeItem('auth_token');
        return null;
      }
      return Promise.reject(error);
    }
  }
  
};

export default authService;
