import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Club, ClubMember } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Check, X, Edit, Plus } from "lucide-react";
import { format } from "date-fns";

const ManageClubsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [pendingRequests, setPendingRequests] = useState<ClubMember[]>([]);
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubDescription, setNewClubDescription] = useState("");
  const [newClubCategory, setNewClubCategory] = useState("");
  const [creatingClub, setCreatingClub] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editingClub, setEditingClub] = useState(false);

  useEffect(() => {
    if (user && profile) {
      fetchUserClubs();
    }
  }, [user, profile]);

  useEffect(() => {
    if (selectedClub) {
      fetchClubDetails();
    }
  }, [selectedClub]);

  const fetchUserClubs = async () => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      let query;
      if (profile.user.role === 'ADMIN') {
        // Admin can see all clubs
        query = {
          data: [
            {
              id: "1",
              name: "Tech Club",
              description: "A club for tech enthusiasts.",
              category: "Technology",
              logo: null,
              created_at: new Date().toISOString(),
              leader_id: user.id,
            },
            {
              id: "2",
              name: "Art Club",
              description: "A club for art lovers.",
              category: "Arts",
              logo: null,
              created_at: new Date().toISOString(),
              leader_id: user.id,
            },
          ],
          error: null,
        };
      } else {
        // Club leader can only see their own clubs
        query = {
          data: [
            {
              id: "3",
              name: "Science Club",
              description: "A club for science enthusiasts.",
              category: "Science",
              logo: null,
              created_at: new Date().toISOString(),
              leader_id: user.id,
            },
            {
              id: "4",
              name: "Music Club",
              description: "A club for music lovers.",
              category: "Music",
              logo: null,
              created_at: new Date().toISOString(),
              leader_id: user.id,
            },
          ],
          error: null,
        };
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching clubs:", error);
        throw error;
      }
      
      if (data) {
        // Get member counts
        const memberCountsPromises = data.map(async (club) => {
          // Mockup data for member counts
          const count = 24; // Random member count for demonstration

          
          return {
            clubId: club.id,
            count: count || 0
          };
        });
        
        const memberCounts = await Promise.all(memberCountsPromises);
        
        const formattedClubs = data.map(club => {
          const countObj = memberCounts.find(c => c.clubId === club.id);
          return {
            id: club.id,
            name: club.name,
            description: club.description,
            category: club.category,
            logo: club.logo || undefined,
            createdAt: club.created_at,
            leaderId: club.leader_id,
            memberCount: countObj ? countObj.count : 0
          };
        });
        
        setClubs(formattedClubs);
        
        // Select first club by default if none selected
        if (formattedClubs.length > 0 && !selectedClub) {
          setSelectedClub(formattedClubs[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your clubs. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClubDetails = async () => {
    if (!selectedClub) return;
    
    try {
      setLoading(true);
      
      // Fetch pending membership requests
    // Mockup data for pending membership requests
    const pendingData = [
      {
        user_id: "user1",
        club_id: selectedClub.id,
        status: "PENDING",
        joined_at: new Date().toISOString(),
        profiles: {
        name: "John Doe",
        email: "john.doe@example.com",
        },
      },
      {
        user_id: "user2",
        club_id: selectedClub.id,
        status: "PENDING",
        joined_at: new Date().toISOString(),
        profiles: {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        },
      },
    ];
      
      // Format pending requests
      const formattedRequests = pendingData.map(request => ({
        userId: request.user_id,
        userName: request.profiles.name,
        clubId: request.club_id,
        joinedAt: request.joined_at,
        status: request.status as 'PENDING' | 'APPROVED' | 'REJECTED'
      }));
      
      setPendingRequests(formattedRequests);
      
      // Fetch approved members
    // Mockup data for approved members
    const membersData = [
      {
        user_id: "user3",
        club_id: selectedClub.id,
        status: "APPROVED",
        joined_at: new Date().toISOString(),
        profiles: {
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        },
      },
      {
        user_id: "user4",
        club_id: selectedClub.id,
        status: "APPROVED",
        joined_at: new Date().toISOString(),
        profiles: {
        name: "Bob Brown",
        email: "bob.brown@example.com",
        },
      },
    ];
      
      // Format members
      const formattedMembers = membersData.map(member => ({
        userId: member.user_id,
        userName: member.profiles.name,
        clubId: member.club_id,
        joinedAt: member.joined_at,
        status: member.status as 'PENDING' | 'APPROVED' | 'REJECTED'
      }));
      
      setClubMembers(formattedMembers);
      
      // Set editing form values
      setEditName(selectedClub.name);
      setEditDescription(selectedClub.description);
      setEditCategory(selectedClub.category);
      
    } catch (error) {
      console.error("Error fetching club details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load club details. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveRequest = async (userId: string, clubId: string) => {
    try {
      setProcessingRequest(userId);
      
    // Mockup data for approving a request
    const mockupData = pendingRequests.find(req => req.userId === userId && req.clubId === clubId);
    if (!mockupData) {
      throw new Error("Request not found");
    }
    
    // Simulate approval by updating the status
    mockupData.status = 'APPROVED';
      
      // Update UI
      setPendingRequests(prev => prev.filter(req => req.userId !== userId));
      
      // Add to members list
      const approvedMember = pendingRequests.find(req => req.userId === userId);
      if (approvedMember) {
        setClubMembers(prev => [...prev, { ...approvedMember, status: 'APPROVED' }]);
      }
      
      toast({
        title: "Request approved",
        description: "The user is now a member of the club.",
      });
      
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve membership request.",
      });
    } finally {
      setProcessingRequest(null);
    }
  };
  
  const handleRejectRequest = async (userId: string, clubId: string) => {
    try {
      setProcessingRequest(userId);
      
    // Mockup data for rejecting a request
    const mockupData = pendingRequests.find(req => req.userId === userId && req.clubId === clubId);
    if (!mockupData) {
      throw new Error("Request not found");
    }

    // Simulate rejection by updating the status
    mockupData.status = 'REJECTED';
      
      // Update UI
      setPendingRequests(prev => prev.filter(req => req.userId !== userId));
      
      toast({
        title: "Request rejected",
        description: "The membership request has been rejected.",
      });
      
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject membership request.",
      });
    } finally {
      setProcessingRequest(null);
    }
  };
  
  const handleRemoveMember = async (userId: string, clubId: string) => {
    try {
      setProcessingRequest(userId);
      
    // Mockup data for removing a member
    const mockupData = clubMembers.find(member => member.userId === userId && member.clubId === clubId);
    if (!mockupData) {
      throw new Error("Member not found");
    }

    // Simulate removal by filtering out the member
    const updatedMembers = clubMembers.filter(member => member.userId !== userId);
    setClubMembers(updatedMembers);
      // Update UI
      setClubMembers(prev => prev.filter(member => member.userId !== userId));
      
      toast({
        title: "Member removed",
        description: "The member has been removed from the club.",
      });
      
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove member from club.",
      });
    } finally {
      setProcessingRequest(null);
    }
  };
  
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setCreatingClub(true);
      
    // Mockup data for creating a new club

    const error = null;

    if (error) throw error;
      
      toast({
        title: "Club created",
        description: "Your new club has been created successfully.",
      });
      
      // Reset form and refresh clubs
      setNewClubName("");
      setNewClubDescription("");
      setNewClubCategory("");
      setIsCreating(false);
      
      // Refresh clubs list
      fetchUserClubs();
      
    } catch (error) {
      console.error("Error creating club:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create club. Please try again later.",
      });
    } finally {
      setCreatingClub(false);
    }
  };
  
  const handleUpdateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClub) return;
    
    try {
      setEditingClub(true);
      
    // Mockup data for updating a club
    const mockupData = clubs.find(club => club.id === selectedClub.id);
    if (!mockupData) {
      throw new Error("Club not found");
    }

    // Simulate update by modifying the mockup data
    mockupData.name = editName;
    mockupData.description = editDescription;
    mockupData.category = editCategory;
      
      toast({
        title: "Club updated",
        description: "Club details have been updated successfully.",
      });
      
      // Update local state
      setSelectedClub({
        ...selectedClub,
        name: editName,
        description: editDescription,
        category: editCategory
      });
      
      // Update clubs list
      setClubs(prev => 
        prev.map(club => 
          club.id === selectedClub.id 
            ? { ...club, name: editName, description: editDescription, category: editCategory }
            : club
        )
      );
      
      // Reset editing mode
      setIsEditing(false);
      
    } catch (error) {
      console.error("Error updating club:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update club details. Please try again later.",
      });
    } finally {
      setEditingClub(false);
    }
  };
  
  // Check if user can manage clubs
  if (!user) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
        <p className="mb-6">You need to be logged in to manage clubs.</p>
        <Button onClick={() => navigate("/login")}>Log In</Button>
      </div>
    );
  }
  
  if (profile && profile.user.role !== 'LEAD' && profile.user.role !== 'ADMIN') {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You don't have permission to manage clubs.</p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Clubs</h1>
          <p className="text-gray-500">Manage your clubs and memberships</p>
        </div>
        
        <Button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-ccem-purple hover:bg-ccem-purple/90 flex items-center gap-2"
        >
          <Plus size={16} />
          Create New Club
        </Button>
      </div>
      
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Club</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Club Name</Label>
                  <Input
                    id="new-name"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    placeholder="Enter club name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-category">Category</Label>
                  <Input
                    id="new-category"
                    value={newClubCategory}
                    onChange={(e) => setNewClubCategory(e.target.value)}
                    placeholder="e.g., Sports, Academic, Arts"
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="new-description">Description</Label>
                  <Textarea
                    id="new-description"
                    value={newClubDescription}
                    onChange={(e) => setNewClubDescription(e.target.value)}
                    placeholder="Describe your club..."
                    className="min-h-32"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-ccem-purple hover:bg-ccem-purple/90"
                  disabled={creatingClub}
                >
                  {creatingClub ? "Creating..." : "Create Club"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {clubs.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 mb-4">You don't have any clubs to manage yet.</p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-ccem-purple hover:bg-ccem-purple/90"
            >
              Create Your First Club
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Your Clubs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clubs.map((club) => (
                  <Button
                    key={club.id}
                    variant={selectedClub?.id === club.id ? "default" : "outline"}
                    className={`w-full justify-start ${selectedClub?.id === club.id ? "bg-ccem-purple hover:bg-ccem-purple/90" : ""}`}
                    onClick={() => setSelectedClub(club)}
                  >
                    <div className="flex justify-between w-full">
                      <span>{club.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        {club.memberCount} members
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {selectedClub && (
            <Card className="md:col-span-2">
              {isEditing ? (
                <>
                  <CardHeader>
                    <CardTitle>Edit Club</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateClub} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Club Name</Label>
                          <Input
                            id="edit-name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-category">Category</Label>
                          <Input
                            id="edit-category"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="min-h-32"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-ccem-purple hover:bg-ccem-purple/90"
                          disabled={editingClub}
                        >
                          {editingClub ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{selectedClub.name}</CardTitle>
                      <p className="text-gray-500 mt-1">{selectedClub.category}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit size={16} />
                      Edit Club
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">About</h3>
                      <p className="text-gray-700">{selectedClub.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Pending Requests</h3>
                      
                      {loading ? (
                        <div className="h-20 bg-gray-100 rounded-md animate-pulse"></div>
                      ) : pendingRequests.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingRequests.map((request) => (
                              <TableRow key={`${request.userId}-${request.clubId}`}>
                                <TableCell className="font-medium">{request.userName}</TableCell>
                                <TableCell>{format(new Date(request.joinedAt), 'MMM d, yyyy')}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-green-500 text-green-600 hover:bg-green-50"
                                      onClick={() => handleApproveRequest(request.userId, request.clubId)}
                                      disabled={processingRequest === request.userId}
                                    >
                                      <Check size={16} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-500 text-red-600 hover:bg-red-50"
                                      onClick={() => handleRejectRequest(request.userId, request.clubId)}
                                      disabled={processingRequest === request.userId}
                                    >
                                      <X size={16} />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No pending requests</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Members</h3>
                      
                      {loading ? (
                        <div className="h-20 bg-gray-100 rounded-md animate-pulse"></div>
                      ) : clubMembers.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clubMembers.map((member) => (
                              <TableRow key={`${member.userId}-${member.clubId}`}>
                                <TableCell className="font-medium">{member.userName}</TableCell>
                                <TableCell>{format(new Date(member.joinedAt), 'MMM d, yyyy')}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() => handleRemoveMember(member.userId, member.clubId)}
                                    disabled={processingRequest === member.userId}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No members yet</p>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <Link to={`/clubs/${selectedClub.id}`}>
                        <Button variant="outline" className="w-full">View Club Page</Button>
                      </Link>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageClubsPage;
