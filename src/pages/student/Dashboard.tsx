import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import { Club } from "../../types";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useToast } from "../../components/ui/use-toast";
import ClubCard from "../../components/shared/ClubCard";
import EventCard from "../../components/shared/EventCard";
import AnnouncementCard from "../../components/shared/AnnouncementCard";
import DashCard from "@/components/ui/DashCard";
import clubService, { MemberData } from "@/services/clubService";
import { Events, RegisteredEvents } from "../event/EventPage";
import { eventService } from "@/services/eventService";
import studentService from "@/services/studentService";
import { announcementService } from "@/services/announcementService";
import { ExtendedAnnouncement } from "../announcement/AnnouncementPage";

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [myEvents, setMyEvents] = useState<Events[]>([]);
  const [pendingRequests, setPendingRequests] = useState<MemberData[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [upcomingEvents, setUpcomingEvents] = useState<RegisteredEvents[]>([]);
  const [recommendedClubs, setRecommendedClubs] = useState<Club[]>([]);
  const [announcements, setAnnouncements] = useState<ExtendedAnnouncement[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [allEvents, setAllEvents] = useState<RegisteredEvents[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true);

          // Fetch user's clubs
          const clubs = await clubService.getUserClubs(user.id);
          setMyClubs(clubs);

          // Fetch user's events
          const events = await eventService.getUserEvents(user.id);
          setMyEvents(events);

          // Fetch pending club join requests
          const pendingRequestsCount = await studentService.getMyPendingRequests(user.id);
          // Store the count for display in the dashboard
          setPendingRequestsCount(pendingRequestsCount);
          // Since studentService.getMyPendingRequests returns a count, not an array,
          // we need to create a placeholder array for UI purposes
          const pendingRequestsArray: MemberData[] = [];
          setPendingRequests(pendingRequestsArray);

          // Get future events sorted by date
          const now = new Date();
          const futureEvents = events
            .filter(event => new Date(event.dateTime) > now)
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
            .map(event => ({
              ...event,
              isRegistered: true // User is registered for these events
            }));
          setUpcomingEvents(futureEvents);

          // Fetch all clubs for recommendations
          const allClubs = await clubService.getAllClubs();
          setAllClubs(allClubs);

          // Get recommended clubs (excluding ones the user is already in)
          const myClubIds = clubs.map(club => club.id);
          // Since we don't have actual pending requests data, we'll use an empty array
          const excludeClubIds = myClubIds;
          const recommended = allClubs
            .filter(club => !excludeClubIds.includes(club.id));
          setRecommendedClubs(recommended);

          // Fetch all events
          const allEventsData = await eventService.getAllEvents();
          const allEventsWithRegistration = allEventsData.map(event => ({
            ...event,
            isRegistered: events.some(myEvent => myEvent.id === event.id)
          }));
          setAllEvents(allEventsWithRegistration);

          // Fetch announcements
          const announcementsData = await announcementService.getAllAnnouncements();
          // Format announcements to match ExtendedAnnouncement interface
          const formattedAnnouncements: ExtendedAnnouncement[] = announcementsData.map(announcement => ({
            ...announcement,
            isFromUserClub: clubs.some(club => club.id === announcement.club.id)
          }));
          setAnnouncements(formattedAnnouncements);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load dashboard data. Please try again later.",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user, toast]);

  const handleJoinClub = async (clubId: string) => {
    if (user) {
      try {
        // Call the API to join the club
        const success = await clubService.joinClub(clubId, user.id);

        if (success) {
          // Update UI
          setPendingRequests(prev => [
            ...prev,
            {
              id: Math.random().toString(), // Temporary ID
              profile: {
                id: user.id,
                name: profile?.profile.name || "User",
                email: profile?.profile.email || "",
                contact: profile?.profile.contact || "",
                role: profile?.profile.role || "STUDENT"
              },
              club: allClubs.find(club => club.id === clubId) || {} as Club,
              joinedAt: new Date(),
              status: "PENDING"
            }
          ]);

          // Update pending requests count
          setPendingRequestsCount(prev => prev + 1);

          // Remove from recommended
          setRecommendedClubs(prev => prev.filter(club => club.id !== clubId));

          // Show success message
          toast({
            title: "Request Sent",
            description: "Your club join request has been sent and is pending approval.",
          });
        } else {
          throw new Error("Failed to join club");
        }
      } catch (error) {
        console.error("Error joining club:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send join request. Please try again later.",
        });
      }
    }
  };

  // Updated to match our EventCard component's onRegister prop type
  const handleRegisterEvent = async (eventId?: string) => {
    if (user && eventId) {
      try {
        // Call the API to register for the event
        const success = await eventService.registerForEvent(eventId, user.id);

        if (success) {
          // Find the event in allEvents
          const registeredEvent = allEvents.find(e => e.id === eventId);

          if (registeredEvent) {
            // Update myEvents state
            setMyEvents(prev => [...prev, registeredEvent]);

            // Update upcomingEvents state to show as registered
            setUpcomingEvents(prev => 
              prev.map(event => 
                event.id === eventId 
                  ? { ...event, isRegistered: true } 
                  : event
              )
            );

            // Update allEvents state to show as registered
            setAllEvents(prev => 
              prev.map(event => 
                event.id === eventId 
                  ? { ...event, isRegistered: true } 
                  : event
              )
            );

            // Show success message
            toast({
              title: "Registration Successful",
              description: "You have successfully registered for this event.",
            });
          }
        } else {
          throw new Error("Failed to register for event");
        }
      } catch (error) {
        console.error("Error registering for event:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to register for event. Please try again later.",
        });
      }
    }
  };

  const isPendingForClub = (clubId: string) => {
    return pendingRequests.some(req => req.club && req.club.id === clubId);
  };

  const isRegisteredForEvent = (eventId: string) => {
    return myEvents.some(event => event.id === eventId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.profile.name || "User"}</h1>
          <p className="text-gray-500">Here's what's happening at your campus</p>
        </div>
        <Link to="/events">
          <Button variant="outline">View All Events</Button>
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}

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
                count={pendingRequestsCount}
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
            {announcements.map((announcement) => (
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
