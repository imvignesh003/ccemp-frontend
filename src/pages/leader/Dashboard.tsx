import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  getMyClubsAsLeader,
  getPendingRequestsForLeader,
  approveClubMembership,
  events,
} from "../../data/mockData";
import { Club, ClubMember, Event } from "../../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useToast } from "../../components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Check, X } from "lucide-react";
import DashCard from "@/components/ui/DashCard";
// import ClubLeaderAnalytics from "../../components/analytics/ClubLeaderAnalytics";

const LeaderDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ClubMember[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    if (user) {
      const clubs = getMyClubsAsLeader(user.id);
      setMyClubs(clubs);
      setPendingRequests(getPendingRequestsForLeader(user.id));

      // Get upcoming events for my clubs
      const myClubIds = clubs.map((club) => club.id);
      const now = new Date();
      const filteredEvents = events
        .filter(
          (event) =>
            myClubIds.includes(event.clubId) && new Date(event.date) > now
        )
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      setUpcomingEvents(filteredEvents);

      // Select the first club by default for analytics
      if (clubs.length > 0 && !selectedClub) {
        setSelectedClub(clubs[0]);
      }
    }
  }, [user, selectedClub]);

  const handleApproveRequest = (userId: string, clubId: string) => {
    approveClubMembership(userId, clubId);

    // Update UI
    setPendingRequests((prev) =>
      prev.filter((req) => !(req.userId === userId && req.clubId === clubId))
    );

    // Show success message
    toast({
      title: "Request Approved",
      description: "The member has been approved and added to the club.",
    });
  };

  const handleRejectRequest = (userId: string, clubId: string) => {
    // In a real app, this would call an API
    setPendingRequests((prev) =>
      prev.filter((req) => !(req.userId === userId && req.clubId === clubId))
    );

    toast({
      title: "Request Rejected",
      description: "The club join request has been rejected.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleClubSelect = (club: Club) => {
    setSelectedClub(club);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold ">Club Leader Dashboard</h1>
          <p>Manage your clubs and events</p>
        </div>
        <Link to="/create-event">
          <Button className="bg-secondary hover:bg-secondary/90">
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Dashboard Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <DashCard
          cardTitle="My Clubs"
          cardContent="Clubs you're managing"
          count={myClubs.length}
        ></DashCard>
        <DashCard
          cardTitle="Upcoming Events"
          cardContent="Events scheduled for your clubs"
          count={upcomingEvents.length}
        ></DashCard>
        <DashCard
          cardTitle="Pending Requests"
          cardContent="Club join requests awaiting approval"
          count={pendingRequests.length}
        ></DashCard>
      </div>

      {/* Club Analytics Section */}
      {selectedClub && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {myClubs.map((club) => (
              <Button
                key={club.id}
                variant={selectedClub.id === club.id ? "default" : "outline"}
                className={
                  selectedClub.id === club.id
                    ? "bg-ccem-purple hover:bg-ccem-purple/90"
                    : ""
                }
                onClick={() => handleClubSelect(club)}
              >
                {club.name}
              </Button>
            ))}
          </div>
          {/* <ClubLeaderAnalytics clubId={selectedClub.id} clubName={selectedClub.name} /> */}
        </div>
      )}

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="my-clubs">My Clubs</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Join Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Club</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => {
                      const club = myClubs.find((c) => c.id === request.clubId);
                      return (
                        <TableRow key={`${request.userId}-${request.clubId}`}>
                          <TableCell className="font-medium">
                            {request.userName}
                          </TableCell>
                          <TableCell>{club?.name}</TableCell>
                          <TableCell>{formatDate(request.joinedAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() =>
                                  handleApproveRequest(
                                    request.userId,
                                    request.clubId
                                  )
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
                                    request.userId,
                                    request.clubId
                                  )
                                }
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    No pending requests at the moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Club</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Registration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/events/${event.id}`}
                            className="hover:text-ccem-purple"
                          >
                            {event.title}
                          </Link>
                        </TableCell>
                        <TableCell>{event.clubName}</TableCell>
                        <TableCell>{formatDate(event.date)}</TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell className="text-right">
                          {event.registeredCount}/{event.registrationLimit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No upcoming events scheduled.</p>
                  <Link to="/create-event">
                    <Button className="mt-2 bg-ccem-purple hover:bg-ccem-purple/90">
                      Create an Event
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-clubs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Clubs</CardTitle>
            </CardHeader>
            <CardContent>
              {myClubs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Club Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myClubs.map((club) => (
                      <TableRow key={club.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/clubs/${club.id}`}
                            className="hover:text-ccem-purple"
                          >
                            {club.name}
                          </Link>
                        </TableCell>
                        <TableCell>{club.category}</TableCell>
                        <TableCell>{club.memberCount}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/manage-clubs/${club.id}`}>
                            <Button size="sm" variant="outline">
                              Manage
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    You don't manage any clubs yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderDashboard;
