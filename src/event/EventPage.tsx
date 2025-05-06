
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { isPast } from "date-fns";
import { Event } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import EventCard from "@/components/shared/EventCard";

const EventsPage: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [clubEvents, setClubEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [registeringEvent, setRegisteringEvent] = useState<string | null>(null);

  const isClubLeader = profile?.user.role === 'LEAD' || profile?.user.role === 'ADMIN';

  useEffect(() => {
    fetchEvents();
  }, [profile]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch all events
    // Mockup for testing without actual Supabase integration
    const eventsData = [
        {
            id: "1",
            title: "Tech Conference 2023",
            description: "A conference about the latest in tech.",
            date: "2023-12-01",
            location: "Auditorium A",
            club_id: "101",
            image: "https://via.placeholder.com/150",
            registration_limit: 100,
            clubs: { name: "Tech Club" },
        },
        {
            id: "2",
            title: "Art Workshop",
            description: "Learn painting techniques from experts.",
            date: "2023-11-15",
            location: "Room 202",
            club_id: "102",
            image: "https://via.placeholder.com/150",
            registration_limit: 50,
            clubs: { name: "Art Club" },
        },
    ];

    const eventsError = null;

    if (eventsError) throw eventsError;
      
      // Get registration counts in a separate query
      const registrationCountsPromises = eventsData.map(async (event) => {
        const count = 13;
        
        return { 
          eventId: event.id, 
          count: count || 0 
        };
      });
      
      const registrationCounts = await Promise.all(registrationCountsPromises);
      
      // Format events data
      const formattedEvents = eventsData.map((event) => {
        const countObj = registrationCounts.find(c => c.eventId === event.id);
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          clubId: event.club_id,
          clubName: event.clubs?.name || "Unknown Club",
          image: event.image,
          registrationLimit: event.registration_limit,
          registeredCount: countObj ? countObj.count : 0
        };
      });
      
      setEvents(formattedEvents);
      
      // If user is logged in, fetch user's registrations
      if (profile) {
        const registrationsData = [
            { event_id: "1" },
            { event_id: "2" },
        ];
        const registrationsError = null;
          
        if (!registrationsError && registrationsData) {
          const registeredEventIds = registrationsData.map(reg => reg.event_id);
          
          // Add isRegistered flag to events
          const eventsWithRegistration = formattedEvents.map(event => ({
            ...event,
            isRegistered: registeredEventIds.includes(event.id)
          }));
          
          // Set my events
          const myEventsList = eventsWithRegistration.filter(event => event.isRegistered);
          setMyEvents(myEventsList);
          
          // Update all events with registration status
          setEvents(eventsWithRegistration);
          
          // For club leaders, fetch events from their clubs
          if (isClubLeader) {
            const leaderClubsData = [
                { id: "101" },
                { id: "102" },
            ];
            const leaderClubsError = null;
              
            if (!leaderClubsError && leaderClubsData) {
              const clubIds = leaderClubsData.map(club => club.id);
              const clubEventsList = eventsWithRegistration.filter(event => 
                clubIds.includes(event.clubId)
              );
              
              setClubEvents(clubEventsList);
            }
          }
        }
      }
      
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load events. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (eventId: string) => {
    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for events.",
      });
      return;
    }
    
    try {
      setRegisteringEvent(eventId);
      
    const error = null; 
      
      if (error) throw error;
      
      // Update events list
      setEvents(prev => prev.map(event => 
        event.id === eventId ? 
        { ...event, registeredCount: event.registeredCount + 1, isRegistered: true } : 
        event
      ));
      
      // Update my events list
      const registeredEvent = events.find(e => e.id === eventId);
      if (registeredEvent) {
        const updatedEvent = {
          ...registeredEvent,
          isRegistered: true,
          registeredCount: registeredEvent.registeredCount + 1
        };
        setMyEvents(prev => [...prev, updatedEvent]);
      }
      
      toast({
        title: "Registration successful",
        description: "You've been registered for this event.",
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const eventDate = new Date(event.date);
    const isPastEvent = isPast(eventDate);
    
    return matchesSearch && (timeFilter === "all" ||
                            (timeFilter === "upcoming" && !isPastEvent) ||
                            (timeFilter === "past" && isPastEvent));
  });

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Campus Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Campus Events</h1>
        
        {isClubLeader && (
          <Link to="/create-event">
            <Button className="bg-ccem-purple hover:bg-ccem-purple/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>
      
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          {profile && <TabsTrigger value="my">My Events</TabsTrigger>}
          {isClubLeader && <TabsTrigger value="club">Club Events</TabsTrigger>}
        </TabsList>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search events by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <SelectValue placeholder="Filter by time" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming Events</SelectItem>
              <SelectItem value="past">Past Events</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <TabsContent value="all" className="space-y-6">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={() => handleRegister(event.id)}
                  isRegistered={event.isRegistered}
                  isPast={isPast(new Date(event.date))}
                  isLoading={registeringEvent === event.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">No events match your search criteria.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my" className="space-y-6">
          {myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents
                .filter(event => {
                  const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        event.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const eventDate = new Date(event.date);
                  const isPastEvent = isPast(eventDate);
                  
                  return matchesSearch && (timeFilter === "all" ||
                                          (timeFilter === "upcoming" && !isPastEvent) ||
                                          (timeFilter === "past" && isPastEvent));
                })
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isRegistered={true}
                    isPast={isPast(new Date(event.date))}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">You haven't registered for any events yet.</p>
              <Button className="mt-4 bg-ccem-purple hover:bg-ccem-purple/90"
                onClick={() => window.location.href = "#all"}>
                Browse Events
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="club" className="space-y-6">
          {clubEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubEvents
                .filter(event => {
                  const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        event.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const eventDate = new Date(event.date);
                  const isPastEvent = isPast(eventDate);
                  
                  return matchesSearch && (timeFilter === "all" ||
                                          (timeFilter === "upcoming" && !isPastEvent) ||
                                          (timeFilter === "past" && isPastEvent));
                })
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isRegistered={event.isRegistered}
                    isPast={isPast(new Date(event.date))}
                  >
                    <div className="absolute top-0 right-0 p-2">
                      <span className="bg-ccem-purple text-white text-xs font-medium px-2 py-1 rounded">
                        Your Club
                      </span>
                    </div>
                  </EventCard>
                ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">
                {isClubLeader ? "Your clubs haven't created any events yet." : "You don't have access to any club events."}
              </p>
              {isClubLeader && (
                <Link to="/create-event">
                  <Button className="mt-4 bg-ccem-purple hover:bg-ccem-purple/90">
                    Create Event
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventsPage;
