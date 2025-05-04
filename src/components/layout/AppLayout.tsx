
import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { Menu, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/use-toast";

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);
  
  // Show welcome toast when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      const welcomeShown = sessionStorage.getItem('welcomeShown');
      
      if (!welcomeShown) {
        toast({
          title: "Welcome to CCEM",
          description: "Navigate using the sidebar to explore clubs and events.",
        });
        
        sessionStorage.setItem('welcomeShown', 'true');
      }
    }
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 relative">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/30 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      
        {/* Sidebar */}
        <div 
          className={`fixed md:static z-30 transition-transform duration-300 ease-in-out transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar />
        </div>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="md:hidden mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSidebar} 
              className="flex items-center gap-2"
            >
              {sidebarOpen ? (
                <>
                  <X size={16} />
                  <span>Close Menu</span>
                </>
              ) : (
                <>
                  <Menu size={16} />
                  <span>Open Menu</span>
                </>
              )}
            </Button>
          </div>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
