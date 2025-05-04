/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext } from "react";
import { LoginResponse } from "../types/response";
import { LoginRequest, SignupRequest } from "@/services/authService";

interface AuthContextType {
  user: any | null;
  profile: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (loginData : LoginRequest) => Promise<void>;
  signUp: (signupData : SignupRequest) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

