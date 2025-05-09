import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyClubs,
  getMyEventRegistrations,
  getMyPendingRequests,
  announcements,
  events,
  clubs,
  joinClub,
  registerForEvent,
} from "../../data/mockData";
import { Club, ClubMember, Event } from "../../types";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useToast } from "../../components/ui/use-toast";
import ClubCard from "../../components/shared/ClubCard";
import EventCard from "../../components/shared/EventCard";
import AnnouncementCard from "../../components/shared/AnnouncementCard";
import DashCard from "@/components/ui/DashCard";

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ClubMember[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recommendedClubs, setRecommendedClubs] = useState<Club[]>([]);

  useEffect(() => {
    if (user) {
      setMyClubs(getMyClubs(user.id));
      setMyEvents(getMyEventRegistrations(user.id));
      setPendingRequests(getMyPendingRequests(user.id));
      
      // Get future events sorted by date
      const now = new Date();
      const futureEvents = events
        .filter(event => new Date(event.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setUpcomingEvents(futureEvents);
      
      // Get recommended clubs (excluding ones the user is already in)
      const myClubIds = getMyClubs(user.id).map(club => club.id);
      const pendingClubIds = getMyPendingRequests(user.id).map(req => req.clubId);
      const excludeClubIds = [...myClubIds, ...pendingClubIds];
      const recommended = clubs
        .filter(club => !excludeClubIds.includes(club.id))
        .slice(0, 3);
      setRecommendedClubs(recommended);
    }
  }, [user]);

  const handleJoinClub = (clubId: string) => {
    if (user) {
      joinClub(user.id, clubId);
      
      // Update UI
      setPendingRequests(prev => [
        ...prev,
        {
          userId: user.id,
          userName: profile?.user.name || "User",
          clubId,
          joinedAt: new Date().toISOString(),
          status: "PENDING"
        }
      ]);
      
      // Remove from recommended
      setRecommendedClubs(prev => prev.filter(club => club.id !== clubId));
      
      // Show success message
      toast({
        title: "Request Sent",
        description: "Your club join request has been sent and is pending approval.",
      });
    }
  };

  // Updated to match our EventCard component's onRegister prop type
  const handleRegisterEvent = (eventId?: string) => {
    if (user && eventId) {
      registerForEvent(user.id, eventId);
      
      // Update UI
      const registeredEvent = events.find(e => e.id === eventId);
      if (registeredEvent) {
        setMyEvents(prev => [...prev, registeredEvent]);
      }
      
      // Show success message
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for this event.",
      });
    }
  };

  const isPendingForClub = (clubId: string) => {
    return pendingRequests.some(req => req.clubId === clubId);
  };

  const isRegisteredForEvent = (eventId: string) => {
    return myEvents.some(event => event.id === eventId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.user.name || "User"}</h1>
          <p className="text-gray-500">Here's what's happening at your campus</p>
        </div>
        <Link to="/events">
          <Button variant="outline">View All Events</Button>
        </Link>
      </div>

      {/* Dashboard Overview */}
      <div className="grid gap-4 md:grid-cols-3">
              <DashCard
                cardTitle="My Clubs"
                cardContent="Clubs you're a member of"
                count={myClubs.length}
              ></DashCard>
              <DashCard
                cardTitle="Upcoming Events"
                cardContent="Events you've registered for"
                count={myEvents.length}
              ></DashCard>  
              <DashCard
                cardTitle="Pending Requests"
                cardContent="Club join requests awaiting approval"
                count={pendingRequests.length}
              ></DashCard>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="my-clubs">My Clubs</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={handleRegisterEvent}
                isRegistered={isRegisteredForEvent(event.id)}
              />
            ))}
            {upcomingEvents.length === 0 && (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">No upcoming events found.</p>
              </div>
            )}
          </div>
          {upcomingEvents.length > 0 && (
            <div className="text-center">
              <Link to="/events">
                <Button variant="link">View all upcoming events</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-clubs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                isMember={true}
              />
            ))}
            {myClubs.length === 0 && (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">You haven't joined any clubs yet.</p>
                <Link to="/clubs">
                  <Button className="mt-2 bg-ccem-purple hover:bg-ccem-purple/90">
                    Browse Clubs
                  </Button>
                </Link>
              </div>
            )}
          </div>
          {myClubs.length > 0 && (
            <div className="text-center">
              <Link to="/clubs">
                <Button variant="link">View all clubs</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onJoin={handleJoinClub}
                isMember={false}
                isPending={isPendingForClub(club.id)}
              />
            ))}
            {recommendedClubs.length === 0 && (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">No recommended clubs at the moment.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="announcements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {announcements.slice(0, 4).map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
            {announcements.length === 0 && (
              <div className="col-span-2 text-center py-10">
                <p className="text-gray-500">No announcements at the moment.</p>
              </div>
            )}
          </div>
          {announcements.length > 0 && (
            <div className="text-center">
              <Link to="/announcements">
                <Button variant="link">View all announcements</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
