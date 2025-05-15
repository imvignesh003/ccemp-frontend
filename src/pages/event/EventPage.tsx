import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Search, Filter, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isPast, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth.ts";
import EventCard from "@/components/shared/EventCard.tsx";
import { eventService } from "@/services/eventService.ts";
import { Club } from "@/types/response.ts";
import clubService from "@/services/clubService.ts";

export interface Events {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  club: Club;
  maxParticipants: number;
  registeredCount: number;
}

export interface RegisteredEvents extends Events {
  isRegistered: boolean;
}

const EventsPage: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<RegisteredEvents[]>([]);
  const [myEvents, setMyEvents] = useState<RegisteredEvents[]>([]);
  const [clubEvents, setClubEvents] = useState<RegisteredEvents[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [registeringEvent, setRegisteringEvent] = useState<string | null>(null);
  // const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const isClubLeader =
    profile?.profile.role === "LEAD" || profile?.profile.role === "ADMIN";



useEffect(() => {
  const fetchAll = async () => {
    if (profile && profile.profile && profile.profile.id) {
      try {
        const registeredEvents :number[] = await eventService.getUserRegistrations(
          profile.profile.id.toString()
        ).then((res) => {
          return res.map((event) => Number(event));
        });
        // setRegisteredEvents(registeredEvents); // optional, if used elsewhere
        
        await fetchEvents(registeredEvents); 
      } catch (error) {
        console.error("Error fetching registered events:", error);
      }
    } 
  };

  fetchAll();
}, [profile]);


  const fetchEvents = async (registeredEvents: number[]) => {
    try {
      setLoading(true);

      console.log("resis1 : " + registeredEvents);
      // Fetch all events
      const response = await eventService.getAllEvents();

      if (!response) {
        console.error("Error fetching events: Error Fetching Events");
        throw new Error("Error fetching events");
      }

      // Get registration counts for each event
      const registrationCountsPromises = response.map(async (event) => {
        try {
          const count = await eventService.getRegistrationCount(event.id);
          return {
            eventId: event.id,
            count: count || 0,
          };
        } catch (error) {
          console.error(
            `Error fetching registration count for event ${event.id}:`,
            error
          );
          return {
            eventId: event.id,
            count: 0,
          };
        }
      });

      const registrationCounts = await Promise.all(registrationCountsPromises);


      // Format events data
      const formattedEvents = response.map((event) => {
        const countObj = registrationCounts.find((c) => c.eventId === event.id);
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          dateTime: event.dateTime,
          location: event.location,
          club: event.club,
          maxParticipants: event.maxParticipants,
          registeredCount: countObj ? countObj.count : 0,
          isRegistered: registeredEvents.includes(Number(event.id)),
        };
      });

      // setEvents(formattedEvents);

      // If user is logged in, fetch user's registrations
      if (profile && profile.profile && profile.profile.id) {
        try {
          // Set my events
          const myEventsList = formattedEvents.filter(
            (event) => event.isRegistered
          );
          setMyEvents(myEventsList);

          console.log("myEventsList", myEventsList);
          // Update all events with registration status
          setEvents(formattedEvents);

          // For club leaders, fetch events from their clubs
          if (isClubLeader) {
            try {
              // Fetch clubs where user is a leader
              const userClubs = await clubService.getMyClubs(Number(profile.profile.id));

              if (userClubs && userClubs.length > 0) {
                const clubIds = userClubs.map((club) => club.id);
                const clubEventsList = formattedEvents.filter((event) =>
                  clubIds.includes(event.club.id)
                );

                setClubEvents(clubEventsList);
              }
            } catch (error) {
              console.error("Error fetching leader clubs:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching user registrations:", error);
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
    if (!profile || !profile.profile || !profile.profile.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for events.",
      });
      return;
    }

    try {
      setRegisteringEvent(eventId);

      // Call the API to register for the event
      const response = await eventService.registerForEvent(
        eventId,
        profile.profile.id.toString()
      );

      if (!response) {
        throw new Error("Failed to register for event");
      }

      // Update events list
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                registeredCount: event.registeredCount + 1,
                isRegistered: true,
              }
            : event
        )
      );

      // Update my events list
      const registeredEvent = events.find((e) => e.id === eventId);
      if (registeredEvent) {
        const updatedEvent = {
          ...registeredEvent,
          isRegistered: true,
          registeredCount: registeredEvent.registeredCount + 1,
        };
        setMyEvents((prev) => [...prev, updatedEvent]);
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

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const eventDate = event.dateTime;
    const isPastEvent = isPast(eventDate);

    return (
      matchesSearch &&
      (timeFilter === "all" ||
        (timeFilter === "upcoming" && !isPastEvent) ||
        (timeFilter === "past" && isPastEvent))
    );
  });

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Campus Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 rounded-lg animate-pulse"
            ></div>
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
            <Button className="bg-border hover:bg-border/60 text-background">
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
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
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
                  isPast={isPast(
                    new Date(format(parseISO(event.dateTime), "yyyy-MM-dd"))
                  )}
                  isLoading={registeringEvent === event.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">
                No events match your search criteria.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-6">
          {myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents
                .filter((event) => {
                  const matchesSearch =
                    event.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    event.description
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());
                  const eventDate = new Date(
                    format(parseISO(event.dateTime), "yyyy-MM-dd")
                  );
                  const isPastEvent = isPast(eventDate);

                  return (
                    matchesSearch &&
                    (timeFilter === "all" ||
                      (timeFilter === "upcoming" && !isPastEvent) ||
                      (timeFilter === "past" && isPastEvent))
                  );
                })
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={isPast(
                      new Date(format(parseISO(event.dateTime), "yyyy-MM-dd"))
                    )}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">
                You haven't registered for any events yet.
              </p>
              <Button
                className="mt-4 bg-border hover:bg-border/60 text-background"
                onClick={() => (window.location.href = "#all")}
              >
                Browse Events
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="club" className="space-y-6">
          {clubEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubEvents
                .filter((event) => {
                  const matchesSearch =
                    event.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    event.description
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());
                  
                  const isPastEvent = isPast(parseISO(event.dateTime));

                  return (
                    matchesSearch &&
                    (timeFilter === "all" ||
                      (timeFilter === "upcoming" && !isPastEvent) ||
                      (timeFilter === "past" && isPastEvent))
                  );
                })
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={isPast(parseISO(event.dateTime))}
                  >
                    <div className="absolute top-0 right-0 p-2">
                      <span className="bg-border text-white text-xs font-medium px-2 py-1 rounded">
                        Your Club
                      </span>
                    </div>
                  </EventCard>
                ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">
                {isClubLeader
                  ? "Your clubs haven't created any events yet."
                  : "You don't have access to any club events."}
              </p>
              {isClubLeader && (
                <Link to="/create-event">
                  <Button className="mt-4 bg-border hover:bg-border/60 text-background">
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
