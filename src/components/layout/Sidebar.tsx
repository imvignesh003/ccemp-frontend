
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  CalendarDays,
  Home,
  Settings,
  Users,
  PlusCircle,
  BarChart3,
  Bell,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-border text-background hover: hover:bg-opacity-80"
          : "hover:text-ccem-purple hover:bg-border/80 hover:text-background"
      )}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const isStudent = profile?.user.role === "STUDENT";
  const isClubLeader = profile?.user.role === "CLUB_LEADER" || profile?.user.role === "ADMIN";

  return (
    <div className="bg-secondary w-64 h-[calc(100vh-4rem)] border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold">
          {isStudent ? "Student Portal" : "Club Management"}
        </h2>
        <p className="text-sm text-border">
          {isStudent ? "Explore and join clubs" : "Manage your clubs"}
        </p>
      </div>
      
      <nav className="mt-2 flex-1 space-y-1 px-2">
        <SidebarItem
          to="/"
          icon={<Home size={18} />}
          label="Dashboard"
          active={location.pathname === "/"}
        />
        
        <SidebarItem
          to="/clubs"
          icon={<Users size={18} />}
          label="Clubs"
          active={location.pathname.startsWith("/clubs")}
        />
        
        <SidebarItem
          to="/events"
          icon={<CalendarDays size={18} />}
          label="Events"
          active={location.pathname.startsWith("/events")}
        />
        
        <SidebarItem
          to="/announcements"
          icon={<Bell size={18} />}
          label="Announcements"
          active={location.pathname.startsWith("/announcements")}
        />
        
        {isClubLeader && (
          <>
            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-3 text-[12px] font-semibold uppercase tracking-wider mb-2">
                Management
              </p>
              
              <SidebarItem
                to="/manage-clubs"
                icon={<Users size={18} />}
                label="Manage Clubs"
                active={location.pathname.startsWith("/manage-clubs")}
              />
              
              <SidebarItem
                to="/create-event"
                icon={<PlusCircle size={18} />}
                label="Create Event"
                active={location.pathname === "/create-event"}
              />
              
              <SidebarItem
                to="/analytics"
                icon={<BarChart3 size={18} />}
                label="Analytics"
                active={location.pathname === "/analytics"}
              />
            </div>
          </>
        )}
        
        <div className="pt-4 mt-4 border-t border-border">
          <SidebarItem
            to="/profile"
            icon={<Settings size={18} />}
            label="Profile Settings"
            active={location.pathname === "/profile"}
          />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
