import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Calendar, User, Users } from "lucide-react";
import { Club, Event, ClubMember, Announcement } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import EventCard from "../../components/shared/EventCard";
import AnnouncementCard from "../../components/shared/AnnouncementCard";
import { format } from "date-fns";

// Extended Event interface with isRegistered property
interface ExtendedEvent extends Event {
  isRegistered?: boolean;
}

const ClubDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [leader, setLeader] = useState<{ name: string; email: string } | null>(null);
  const [memberStatus, setMemberStatus] = useState<'APPROVED' | 'PENDING' | 'NONE'>('NONE');
  const [loading, setLoading] = useState(true);
  const [registeringEvent, setRegisteringEvent] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClubDetails();
    }
  }, [id, user]);

  const fetchClubDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch club details
        // Mockup data for club details
        const clubData = {
        id: id,
        name: "tech Club",
        description: "This is a mockup description for the club.",
        category: "tech",
        logo: "mockup-logo.png",
        created_at: new Date().toISOString(),
        leader_id: "1",
        };
      
      // Fetch club leader info
        // Mockup data for leader info
        const leaderData = {
        name: "Leader",
        email: "leader@gmail.com",
        };
      
      setLeader(leaderData);
      
      // Format club data
      const formattedClub = {
        id: clubData.id,
        name: clubData.name,
        description: clubData.description,
        category: clubData.category,
        logo: clubData.logo,
        createdAt: clubData.created_at,
        leaderId: clubData.leader_id,
        memberCount: 0 // Will be updated later
      };
      
      setClub(formattedClub);
      setIsLeader(user && user.id === clubData.leader_id);
      
      // Fetch club events with a simpler query to avoid parsing error
        // Mockup data for events
        const eventsData = [
        {
            id: "1",
            title: "Tech Talk",
            description: "A talk on the latest in technology.",
            date: new Date().toISOString(),
            location: "Auditorium",
            club_id: id,
            image: "event1.jpg",
            registration_limit: 100,
        },
      {
        id: "2",
        title: "Coding Workshop",
        description: "Hands-on coding workshop for beginners.",
        date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        location: "Lab 1",
        club_id: id,
        image: "event2.jpg",
        registration_limit: 50,
      },
        ];

      // Get registration counts in a separate query
      const registrationCounts = await Promise.all(
        eventsData.map(async (event) => {
          // Mockup data for registration counts
          const count = 16;           
          return { 
            eventId: event.id, 
            count: count || 0 
          };
        })
      );
      
      // Format events
      const formattedEvents = eventsData.map((event) => {
        const countObj = registrationCounts.find(c => c.eventId === event.id);
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          clubId: event.club_id,
          clubName: formattedClub.name,
          image: event.image,
          registrationLimit: event.registration_limit,
          registeredCount: countObj ? countObj.count : 0
        };
      });
      
      setEvents(formattedEvents);
      
      // Fetch club announcements
        // Mockup data for announcements
        const announcementsData = [
        {
            id: "1",
            title: "Welcome to the Club!",
            content: "We are excited to have you join us. Stay tuned for upcoming events.",
            club_id: id,
            created_at: new Date().toISOString(),
        },
        {
            id: "2",
            title: "Monthly Meeting",
            content: "Join us for our monthly meeting to discuss club activities and plans.",
            club_id: id,
            created_at: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        },
        ];
      
      // Format announcements
      const formattedAnnouncements = announcementsData.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        clubId: announcement.club_id,
        clubName: formattedClub.name,
        date: announcement.created_at
      }));
      
      setAnnouncements(formattedAnnouncements);
      
      // Fetch club members
        // Mockup data for members
        const membersData = [
        {
            user_id: "1",
            status: "APPROVED",
            joined_at: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
            profiles: {
            name: "John Doe",
            email: "john.doe@example.com",
            profile_image: "profile1.jpg",
            },
        },
        {
            user_id: "2",
            status: "APPROVED",
            joined_at: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
            profiles: {
            name: "Jane Smith",
            email: "jane.smith@example.com",
            profile_image: "profile2.jpg",
            },
        },
        ];
      
      // Format members
      const formattedMembers = membersData.map((member) => ({
        userId: member.user_id,
        userName: member.profiles.name,
        clubId: id,
        joinedAt: member.joined_at,
        status: member.status as 'APPROVED' | 'PENDING' | 'REJECTED'
      }));
      
      setMembers(formattedMembers);
      
      // Update club member count
      setClub(prev => prev ? { ...prev, memberCount: formattedMembers.length } : null);
      
      // Check if user is a member of this club
      if (user) {
        // Mockup data for member status
        const memberData = {
          status: "APPROVED", // Change this to "PENDING" or "NONE" for different scenarios
        };
        

        setMemberStatus(memberData.status as 'APPROVED' | 'PENDING');
        
        // Check if user is registered for any events
        // Mockup data for event registrations
        const registrationsData = [
          { event_id: "1" }, // User is registered for event with ID "1"
        ];
        
        const registeredEventIds = registrationsData.map(reg => reg.event_id);
          
          // Update events with registration status
          setEvents(prev => prev.map(event => ({
            ...event,
            isRegistered: registeredEventIds.includes(event.id)
          })));
        }else{
            throw new Error("User not found");
        }
      }catch (error) {
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
  
  const handleJoinClub = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join clubs.",
      });
      return;
    }
    
    try {
    // Mockup data for joining club
    const mockResponse = {
      success: true,
    };

    if (!mockResponse.success) {
      throw new Error("Failed to join club");
    }
      
      setMemberStatus('PENDING');
      
      toast({
        title: "Request sent",
        description: "Your club join request has been sent and is awaiting approval.",
      });
      
    } catch (error) {
      console.error("Error joining club:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send join request. Please try again.",
      });
    }
  };
  
  const handleRegisterEvent = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for events.",
      });
      return;
    }
    
    try {
      setRegisteringEvent(eventId);
      
    // Mockup data for event registration
    const mockResponse = {
      success: true,
    };

    if (!mockResponse.success) {
      throw new Error("Failed to register for event");
    }
      
      // Update events list
      setEvents(prev => prev.map(event => 
        event.id === eventId ? 
        { ...event, registeredCount: event.registeredCount + 1, isRegistered: true } : 
        event
      ));
      
      toast({
        title: "Registration successful",
        description: "You have successfully registered for this event.",
      });
      
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to register for event. Please try again.",
      });
    } finally {
      setRegisteringEvent(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Club not found</h1>
        <p className="mb-6">The club you're looking for doesn't exist or has been removed.</p>
        <Link to="/clubs">
          <Button>Back to Clubs</Button>
        </Link>
      </div>
    );
  }

  const futureEvents = events.filter(event => new Date(event.date) >= new Date());
  const pastEvents = events.filter(event => new Date(event.date) < new Date());

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
          <p className="text-gray-500">Category: {club.category}</p>
        </div>
        
        {memberStatus === 'NONE' && (
          <Button 
            onClick={handleJoinClub} 
            className="bg-ccem-purple hover:bg-ccem-purple/90"
          >
            Join Club
          </Button>
        )}
        
        {memberStatus === 'PENDING' && (
          <Button disabled className="bg-yellow-500">
            Membership Pending
          </Button>
        )}
        
        {isLeader && (
          <Link to={`/manage-clubs/${club.id}`}>
            <Button variant="outline">Manage Club</Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{club.description}</p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <p>Leader: {leader?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                <p>{club.memberCount} Members</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <p>Founded: {format(new Date(club.createdAt), 'MMMM yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Membership</CardTitle>
          </CardHeader>
          <CardContent>
            {memberStatus === 'APPROVED' ? (
              <div className="text-center">
                <div className="mb-4 bg-green-100 text-green-800 px-4 py-2 rounded-md">
                  You are a member of this club
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  You have access to all club events and announcements.
                </p>
              </div>
            ) : memberStatus === 'PENDING' ? (
              <div className="text-center">
                <div className="mb-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md">
                  Your membership is pending approval
                </div>
                <p className="text-sm text-gray-500">
                  The club leader will review your request soon.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4 text-gray-700">
                  Join this club to participate in events and receive announcements.
                </p>
                <Button 
                  onClick={handleJoinClub} 
                  className="bg-ccem-purple hover:bg-ccem-purple/90 w-full"
                >
                  Request to Join
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events" className="space-y-6">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          
          {futureEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {futureEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={() => handleRegisterEvent(event.id)}
                  isRegistered={event.isRegistered}
                  isLoading={registeringEvent === event.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No upcoming events scheduled.</p>
              {isLeader && (
                <Link to="/create-event">
                  <Button className="mt-2 bg-ccem-purple hover:bg-ccem-purple/90">
                    Create an Event
                  </Button>
                </Link>
              )}
            </div>
          )}
          
          {pastEvents.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mt-8">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={true}
                  />
                ))}
              </div>
              {pastEvents.length > 3 && (
                <div className="text-center">
                  <Button variant="link">View All Past Events</Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="announcements" className="space-y-6">
          {announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.map((announcement) => (
                <AnnouncementCard 
                  key={announcement.id} 
                  announcement={announcement} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No announcements at the moment.</p>
              {isLeader && (
                <Button className="mt-2">Create Announcement</Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="members" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.userId} className="overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ccem-purple text-white flex items-center justify-center">
                    {member.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{member.userName}</p>
                    <p className="text-sm text-gray-500">
                      Joined {format(new Date(member.joinedAt), 'MMM yyyy')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {members.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">This club has no members yet.</p>
              {memberStatus === 'NONE' && (
                <Button 
                  onClick={handleJoinClub} 
                  className="mt-2 bg-ccem-purple hover:bg-ccem-purple/90"
                >
                  Be the First to Join
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubDetail;
