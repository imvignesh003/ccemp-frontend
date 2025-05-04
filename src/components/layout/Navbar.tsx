
import React from "react";
import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

const Navbar: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-16 h-16 flex items-center justify-center font-bold">
              <img src="/logo.svg" alt="Campus Nexus Logo" className="w-32 h-32"
                />
              </div>
              <span className="text-xl font-bold">Campus Clubs & Events Manager</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 bg-background rounded-full my-2">
            {/* <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full"></span>
            </Button> */}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={profile?.user.profile_image}
                      alt={profile?.user.name}
                    />
                    <AvatarFallback>
                      {profile?.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1">
                <DropdownMenuLabel className="hover:bg-secondary">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.user.name}</p>
                    <p className="text-xs">{profile?.user.email}</p>
                    <p className="text-xs font-medium">{profile?.user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center gap-2 hover:bg-secondary rounded-md p-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
