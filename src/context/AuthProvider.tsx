/* eslint-disable @typescript-eslint/no-explicit-any */
import authService, { LoginRequest, SignupRequest } from "@/services/authService";
import { AuthContext } from "./AuthContext";
import { LoginResponse } from "@/types/response";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState< any | null>(null);
    const [profile, setProfile] = useState<LoginResponse | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
  
    useEffect(() => {
      const checkAuthStatus = async () => {
        const token = localStorage.getItem("auth_token");
    
        if (!token) {
          setIsLoading(false); // No token means not logged in
          setIsAuthenticated(false);
          return;
        }
    
        try {
          const authData = await authService.getCurrentUser();
          if (authData) {
            setUser(authData.user);
            setProfile(authData);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error checking auth status:", error);
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      };
    
      checkAuthStatus();
    }, []);
    
  
    const signIn = async (loginData : LoginRequest) => {
      try {
        const credentials: LoginRequest = loginData;
        const authData = await authService.login(credentials);
        console.log("Login response:", authData);
        
        setUser(authData.user);
        setProfile(authData as LoginResponse);
        setIsAuthenticated(true);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.response?.data?.message || "An error occurred during login",
        });
        throw error;
      }
    };
  
    const signUp = async (signupData : SignupRequest) => {
      try {
        const userData: SignupRequest = signupData;
        const authData = await authService.signup(userData);
        
        setUser(authData.user);
        setProfile(authData as LoginResponse);
        setIsAuthenticated(true);
        
        toast({
          title: "Welcome to CCEM!",
          description: "Your account has been created successfully.",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.response?.data?.message || "An error occurred during sign up",
        });
        throw error;
      }
    };
  
    const signOut = async () => {
      try {
        await authService.logout();
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Sign out failed",
          description: error.response?.data?.message || "An error occurred during sign out",
        });
        throw error;
      }
    };
  
    return (
      <AuthContext.Provider value={{ 
        user, 
        profile, 
        isAuthenticated, 
        isLoading,
        signIn, 
        signUp, 
        signOut 
      }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  