import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Calendar, MapPin, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth.ts";
import { eventService } from "@/services/eventService.ts";
import { format, parseISO } from "date-fns";
import AutoEventImage from "@/components/event/AutoImage.tsx";
import { Events } from "./EventPage.tsx";

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<Events | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [attendees, setAttendees] = useState<{ name: string; id: string }[]>(
    []
  );

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id, user]);

  const fetchEventDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch event details
      const eventData = await eventService.getEventById(id);

      if (!eventData) {
        throw new Error("Event not found");
      }

      // Get registration count
      let registrationCount = 0;
      try {
        registrationCount = await eventService.getRegistrationCount(id);
      } catch (error) {
        console.error("Error fetching registration count:", error);
      }

      // Format event data
      const formattedEvent = {
        ...eventData,
        registeredCount: registrationCount || 0,
      };

      setEvent(formattedEvent);



      // Check if user is registered for this event
      if (user && user.id) {
        try {
          const registeredEvents = await eventService.getUserRegistrations(
            user.id.toString()
          );
          setIsRegistered(registeredEvents.includes(id));
        } catch (error) {
          console.error("Error checking if user is registered:", error);
        }
      }

      // Fetch attendees
      try {
        const registrations = await eventService.getEventRegistrations(id);

        if (registrations && registrations.length > 0) {
          // Assuming registrations include user profile information
          const attendeesList = registrations.map((reg) => ({
            id: reg.user_id || reg.userId,
            name: reg.user_name || reg.userName || "Anonymous",
          }));

          setAttendees(attendeesList);
        }
      } catch (error) {
        console.error("Error fetching attendees:", error);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load event details. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user || !user.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for events.",
      });
      return;
    }

    if (!event || !id) return;

    try {
      setRegistering(true);

      // Call the API to register for the event
      const response = await eventService.registerForEvent(
        id,
        user.id.toString()
      );

      if (!response) {
        throw new Error("Failed to register for event");
      }

      setIsRegistered(true);
      setEvent({
        ...event,
        registeredCount: event.registeredCount + 1,
      });

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
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user || !user.id || !event || !id) return;

    try {
      setRegistering(true);

      // Call the API to cancel registration
      const response = await eventService.cancelRegistration(
        id,
        user.id.toString()
      );

      if (!response) {
        throw new Error("Failed to cancel registration");
      }

      setIsRegistered(false);
      setEvent({
        ...event,
        registeredCount: Math.max(0, event.registeredCount - 1),
      });

      toast({
        title: "Registration cancelled",
        description: "You have cancelled your registration for this event.",
      });
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel registration. Please try again.",
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  console.log(event);

  if (!event) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <p className="mb-6">
          The event you're looking for doesn't exist or has been cancelled.
        </p>
        <Link to="/events">
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  const eventDate = new Date(format(parseISO(event.dateTime), "yyyy-MM-dd"));
  const isPastEvent = eventDate < new Date();
  const isFull = event.registeredCount >= event.maxParticipants;

  return (
    <div className="container py-6 space-y-6">
      <Link
        to="/events"
        className="text-ccem-purple hover:underline flex items-center gap-1 mb-2"
      >
        &larr; Back to Events
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <AutoEventImage title={event.title} width={512} height={300} />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-500">
              Hosted by{" "}
              <Link
                to={`/clubs/${event.club.id}`}
                className="text-border hover:underline"
              >
                {event.club.name}
              </Link>
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">About this event</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {event.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Attendees</h2>

              {attendees.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {attendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                      >
                        <span className="w-6 h-6 rounded-full bg-ccem-purple text-white flex items-center justify-center text-xs">
                          {attendee.name.charAt(0)}
                        </span>
                        <span className="text-sm">{attendee.name}</span>
                      </div>
                    ))}

                    {event.registeredCount > attendees.length && (
                      <div className="bg-gray-100 px-3 py-1 rounded-full">
                        <span className="text-sm text-gray-500">
                          +{event.registeredCount - attendees.length} more
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-500 text-sm">
                    {event.registeredCount} / {event.maxParticipants} spots
                    filled
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">
                  No one has registered for this event yet. Be the first!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-ccem-purple mt-1" />
                  <div>
                    <h3 className="font-medium">Date and Time</h3>
                    <p className="text-gray-700">
                      {format(parseISO(event.dateTime), "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-gray-700">
                      {format(new Date(event.dateTime), "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-ccem-purple mt-1" />
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-700">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-ccem-purple mt-1" />
                  <div>
                    <h3 className="font-medium">Capacity</h3>
                    <p className="text-gray-700">
                      {event.registeredCount} / {event.maxParticipants}{" "}
                      registered
                    </p>
                  </div>
                </div>
              </div>

              {!isPastEvent && (
                <div className="pt-4">
                  {isRegistered ? (
                    <div className="space-y-4">
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-center">
                        You're registered for this event
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-red-500 text-red-600 hover:bg-red-50"
                        onClick={handleCancelRegistration}
                        disabled={registering}
                      >
                        {registering ? "Cancelling..." : "Cancel Registration"}
                      </Button>
                    </div>
                  ) : isFull ? (
                    <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-center">
                      This event is full
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-border hover:bg-border/60 text-background"
                      onClick={handleRegister}
                      disabled={registering}
                    >
                      {registering ? "Registering..." : "Register Now"}
                    </Button>
                  )}
                </div>
              )}

              {isPastEvent && (
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-center">
                  This event has already taken place
                </div>
              )}

              {/* {isClubLeader && (
                <Link to={`/manage-events/${event.id}`}>
                  <Button variant="outline" className="w-full bg-secondary hover:bg-secondary/60 text-boder">
                    Manage Event
                  </Button>
                </Link>
              )} */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
