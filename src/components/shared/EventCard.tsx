
import React from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { format, isPast,parseISO } from "date-fns";
import AutoEventImage from "../event/AutoImage";
import { RegisteredEvents } from "@/pages/event/EventPage";

interface EventCardProps {
  event: RegisteredEvents;
  onRegister?: (eventId?: string) => void;
  isPast?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onRegister,
  isPast: forcePast = false,
  isLoading = false,
  children
}) => {
  const eventDate = new Date(format(parseISO(event.dateTime), "yyyy-MM-dd"));
  const isEventPast = forcePast || isPast(eventDate);
  const isFull = event.registeredCount >= event.maxParticipants;

  console.log("Event Card", event);

  const handleRegister = () => {
    if (onRegister) {
      onRegister(event.id);  // Pass the event ID
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-gray-100">
        
          <div className="h-full flex items-center justify-center">
            <AutoEventImage title={event.title} />
          </div>
        <div className="absolute top-0 left-0 p-2">
          <span className="bg-white text-gray-800 font-medium text-xs px-2 py-1 rounded">
            {format(parseISO(event.dateTime), "MMM d")}
          </span>
        </div>
        {children}
      </div>
      <Link to={`/events/${event.id}`}>
        <CardHeader className="p-4 pb-2">
          
            <h3 className="text-lg font-semibold text-gray-900 hover:text-ccem-purple line-clamp-1">
              {event.title}
            </h3>
          
          <p className="text-sm text-ccem-purple">{event.club.name}</p>
        </CardHeader>
        
        <CardContent className="flex-1 p-4 pt-0 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={14} />
            <span>{format(parseISO(event.dateTime), "h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={14} />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={14} />
            <span>
              {event.registeredCount} / {event.maxParticipants} registered
            </span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        
        {onRegister && !isEventPast && (
          event.isRegistered ? (
            <Button
              variant="outline"
              className="w-full bg-border hover:bg-border/60 text-background"
              disabled
            >
              Registered
            </Button>
          ) : isFull ? (
            <Button
              variant="outline"
              className="w-full bg-border hover:bg-border/60 text-background"
              disabled
            >
              Event Full
            </Button>
          ) : (
            <Button
              className="w-full bg-border hover:bg-border/60 text-background"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
          )
        )}
        
        {isEventPast && (
          <Button
            variant="outline"
            className="w-full"
            disabled
          >
            Event has ended
          </Button>
        )}
        
        {!onRegister && !isEventPast && (
          <Link to={`/events/${event.id}`} className="w-full">
            <Button
              variant="outline"
              className="w-full"
            >
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
