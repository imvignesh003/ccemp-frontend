
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "../../types";
import { Search, Filter } from "lucide-react";
import  adminService, { Profile }  from "@/services/adminService";


const ManageUsersPage: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("STUDENT");
  


  useEffect(() => {
    if (profile?.profile.role === 'ADMIN') {
      fetchUsers();
    }
  }, [profile]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users from backend
      const data = await adminService.getAllUsers();

      const formattedUsers: Profile[] = data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        contact: user.contact
      }));
      
      setUsers(formattedUsers);
      
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangeRole = async (userId: string, role: UserRole) => {
    try {
      // Call API to update user role
      const response : boolean  = await adminService.changeUserRole(userId, role);
      if(!response){
        throw new Error("Failed to update user role");
      }
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role } : user
        )
      );
      
      toast({
        title: "Role updated",
        description: "The user's role has been updated successfully.",
      });
      
      // Reset editing state
      setEditingUser(null);
      
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role. Please try again.",
      });
    }
  };
  
  const handleStartEditing = (userId: string, currentRole: UserRole) => {
    setEditingUser(userId);
    setNewRole(currentRole);
  };
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  // Check if user has permission to manage user
  if (!profile || profile?.profile.role !== "ADMIN" ) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You don't have permission to manage users.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-gray-600">View and update user information</p>
        </div>
      </div>
      
      <Card className="mb-6 bg-secondary/90 text-border">
        <CardHeader>
          <CardTitle>User Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 ">
            <div className="flex-1 relative rounded-[5px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-border" size={18} />
              <Input
                className="pl-10"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48 bg-border text-secondary ring-offset-border">
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  <SelectValue placeholder="Filter by role" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-border text-background">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="STUDENT">Students</SelectItem>
                <SelectItem value="LEAD">Club Leaders</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0 bg-secondary/80 border-border rounded-[8px]">
          {loading ? (
            <div className="p-6 text-center">
              <p>Loading users...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow >
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-border text-background flex items-center justify-center text-xs">
                            {user.name.charAt(0)}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{user.email}</TableCell>
                      <TableCell>
                        {editingUser === user.id ? (
                          <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                            <SelectTrigger className="w-36 bg-border text-background ring-offset-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-border text-background">
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="LEAD">Club Leader</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className={`
                            px-2 py-1 text-xs font-medium inline-block rounded-md
                            ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : ''}
                            ${user.role === 'LEAD' ? 'bg-blue-100 text-blue-800' : ''}
                            ${user.role === 'STUDENT' ? 'bg-green-100 text-green-800' : ''}
                          `}>
                            {user.role}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingUser === user.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingUser(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-ccem-purple hover:bg-ccem-purple/90"
                              onClick={() => handleChangeRole(user.id, newRole)}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            className="bg-border text-background hover:bg-border/60"
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStartEditing(user.id, user.role as UserRole)}
                          >
                            Change Role
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No users match your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUsersPage;
