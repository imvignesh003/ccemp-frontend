import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.tsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Club } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Edit, Plus } from "lucide-react";
import { format } from "date-fns";
import CreateClub from "@/components/club/CreateClub";
import clubService, { MemberData } from "@/services/clubService";
import EditClub from "@/components/club/EditClub";
import LoadingSpinner from "@/components/layout/Spinner.tsx";

const ManageClubsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [pendingRequests, setPendingRequests] = useState<MemberData[]>([]);
  const [clubMembers, setClubMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<number | null>(
    null
  );

  const [isCreating, setIsCreating] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user && profile) {
      fetchClubs();
    }
  }, [user, profile]);

  useEffect(() => {
    if (selectedClub) {
      fetchClubDetails();
    }
  }, [selectedClub]);

  const fetchClubs = async () => { //done
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let data;

      if (profile.user.role === "ADMIN") {
        data = await clubService.getAllClubs();
        console.log(data);
      } else {
        data = await clubService.getMyClubs(profile.user.id);
        console.log(data);
      }

      if (!data) {
        console.error("Error fetching clubs: Eoor Fetching Clubs");
        throw new Error("Error fetching clubs: Eoor Fetching Clubs");
      }

      if (data) { //done
        // Get member counts
        const memberCountsPromises = data.map(async (club) => {
          const count = await clubService.getClubMembersCount(club.id);
          return {
            clubId: club.id,
            count: count || 0,
          };
        });

        const memberCounts = await Promise.all(memberCountsPromises);

        const formattedClubs = data.map((club) => {
          const countObj = memberCounts.find((c) => c.clubId === club.id);
          return {
            id: club.id,
            name: club.name,
            description: club.description,
            category: club.category,
            createdAt: club.createdAt,
            lead: club.lead, 
            memberCount: countObj ? countObj.count : 0,
          };
        });
        formattedClubs.sort((a, b) => a.name.localeCompare(b.name));

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

  const fetchClubDetails = async () => { //done
    if (!selectedClub) return;

    try {
      setLoading(true);

      const data = await clubService.getClubMemberDetails(selectedClub.id);
      console.log(data);

      // Filter and format pending membership requests
      const pendingData = data.filter(
        (member) => member.status === "PENDING"
      );

      const formattedRequests = pendingData.map((member) => ({
        id: member.id,
        profile: member.profile,
        club: member.clubDto || member.club,
        status: member.status as "PENDING" | "APPROVED" | "REJECTED",
        joinedAt: member.joinedDate,
      }));

      setPendingRequests(formattedRequests);
      console.log("Pending Requests",formattedRequests);

      // Filter and format approved members
      const membersData = data.filter(
        (member) => member.status === "APPROVED"
      );

      const formattedMembers = membersData.map((member) => ({
        id: member.id,
        profile: member.profile,
        club: member.clubDto || member.club,
        status: member.status as "PENDING" | "APPROVED" | "REJECTED",
        joinedAt: member.joinedDate,
      }));

      setClubMembers(formattedMembers);
      console.log("Club Members", formattedMembers);

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

  const handleApproveRequest = async (userId: number, clubId: string) => {
    try {
      setProcessingRequest(userId);


      const response = await clubService.approve(clubId, userId);
      console.log(response);
      if (!response) {
        throw new Error("Error approving request");
      }  

    

      // Update UI
      setPendingRequests((prev) => prev.filter((req) => req.profile.id !== userId));

      // Add to members list
      const approvedMember = pendingRequests.find(
        (req) => req.profile.id === userId
      );
      if (approvedMember) {
        setClubMembers((prev) => [
          ...prev,
          { ...approvedMember, status: "APPROVED" },
        ]);
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

  const handleRejectRequest = async (userId: number, clubId: string) => {
    try {
      setProcessingRequest(userId);


      const response = await clubService.reject(clubId, userId);
      console.log(response);
      if (!response) {
        throw new Error("Error rejecting request");
      }

      // Update UI
      setPendingRequests((prev) => prev.filter((req) => req.profile.id !== userId));

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

  const handleRemoveMember = async (userId: number, clubId: string) => {
    try {
      setProcessingRequest(userId);

      const response = await clubService.remove(clubId, userId);
      console.log(response);
      if(!response){
        throw new Error("Error removing member");
      }

      // Simulate removal by filtering out the member
      const updatedMembers = clubMembers.filter(
        (member) => member.profile.id !== userId
      );
      setClubMembers(updatedMembers);
      // Update UI
      setClubMembers((prev) =>
        prev.filter((member) => member.profile.id !== userId)
      );

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

  if (
    profile &&
    profile.user.role !== "LEAD" &&
    profile.user.role !== "ADMIN"
  ) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You don't have permission to manage clubs.</p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  if (loading) {
    return (
        <LoadingSpinner />
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
          className="bg-border hover:bg-border/80 text-background flex items-center gap-2"
        >
          <Plus size={16} />
          Create New Club
        </Button>
      </div>

      {isCreating && (
        <CreateClub
          selectedClub={selectedClub}
          setIsCreating={setIsCreating}
          setLoading={setLoading}
          fetchClubs={fetchClubs}
        />
      )}

      {clubs.length === 0 && !loading && !isCreating ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 mb-4">
              You don't have any clubs to manage yet.
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-border hover:bg-border/80 text-background"
            >
              Create Your First Club
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-secondary">
            <CardHeader>
              <CardTitle>Your Clubs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clubs.map((club) => (
                  <Button
                    key={club.id}
                    variant={
                      selectedClub?.id === club.id ? "default" : "outline"
                    }
                    className={`w-full justify-start  ${
                      selectedClub?.id === club.id
                        ? "bg-border hover:bg-border/80 text-background"
                        : "bg-secondary hover:bg-border/60"
                    }`}
                    onClick={() => setSelectedClub(club)}
                  >
                    <div className="flex flex-row justify-between w-full">
                      <span>{club.name}</span>
                      <span className="text-xs bg-background text-border px-2 py-1 rounded-full">
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
                <EditClub
                  clubs={clubs}
                  selectedClub={selectedClub}
                  setIsEditing={setIsEditing}
                  setLoading={setLoading}
                  fetchClubs={fetchClubs}
                  setClubs={setClubs}
                  setSelectedClub={setSelectedClub}
                  editName={editName}
                  setEditName={setEditName}
                  editDescription={editDescription}
                  setEditDescription={setEditDescription}
                  editCategory={editCategory}
                  setEditCategory={setEditCategory}
                />
              ) : (
                <>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{selectedClub.name}</CardTitle>
                      <p className="text-gray-500 mt-1">
                        {selectedClub.category}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 bg-border hover:bg-border/60 text-background"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit size={16} />
                      Edit Club
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">About</h3>
                      <p className="text-gray-700">
                        {selectedClub.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Pending Requests
                      </h3>

                      {loading ? (
                        <div className="h-20 bg-gray-100 rounded-md animate-pulse"></div>
                      ) : pendingRequests.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingRequests.map((pending) => (
                              <TableRow
                                key={`${pending.profile .id}-${pending.club.id}`}
                              >
                                <TableCell className="font-medium">
                                  {pending.profile.name}
                                </TableCell>
                                <TableCell>
                                  {pending.status === "PENDING" && pending.joinedAt &&
                                  format(
                                    new Date(pending.joinedAt),
                                    "MMM d, yyyy"
                                  )
                                  }
                            
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-green-500 text-green-600 hover:bg-green-50"
                                      onClick={() =>
                                        handleApproveRequest(
                                          pending.profile.id,
                                          pending.club.id
                                        )
                                      }
                                      disabled={
                                        processingRequest === pending.profile.id
                                      }
                                    >
                                      <Check size={16} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-500 text-red-600 hover:bg-red-50"
                                      onClick={() =>
                                        handleRejectRequest(
                                          pending.profile.id,
                                          pending.club.id
                                        )
                                      }
                                      disabled={
                                        processingRequest === pending.profile.id
                                      }
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
                        <p className="text-gray-500 text-center py-4">
                          No pending requests
                        </p>
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
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clubMembers.map((member) => (
                              <TableRow
                                key={`${member.profile.id}-${member.club.id}`}
                              >
                                <TableCell className="font-medium">
                                  {member.profile.name}
                                </TableCell>
                                <TableCell>
                                  {member.joinedAt && format(
                                    new Date(member.joinedAt),
                                    "MMM d, yyyy"
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      handleRemoveMember(
                                        member.profile.id,
                                        member.club.id
                                      )
                                    }
                                    disabled={
                                      processingRequest === member.profile.id
                                    }
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No members yet
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Link to={`/clubs/${selectedClub.id}`}>
                        <Button variant="outline" className="w-full bg-border hover:bg-border/60 text-background">
                          View Club Page
                        </Button>
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
