
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Event } from "../../types";
import { format, isPast } from "date-fns";

interface EventCardProps {
  event: Event;
  onRegister?: (eventId?: string) => void;  // Updated to make eventId optional
  isRegistered?: boolean;
  isPast?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onRegister,
  isRegistered = false,
  isPast: forcePast = false,
  isLoading = false,
  children
}) => {
  const eventDate = new Date(event.date);
  const isEventPast = forcePast || isPast(eventDate);
  const isFull = event.registeredCount >= event.registrationLimit;

  const handleRegister = () => {
    if (onRegister) {
      onRegister(event.id);  // Pass the event ID
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-gray-100">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Calendar className="h-12 w-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-0 left-0 p-2">
          <span className="bg-white text-gray-800 font-medium text-xs px-2 py-1 rounded">
            {format(eventDate, "MMM d")}
          </span>
        </div>
        {children}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <Link to={`/events/${event.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-ccem-purple line-clamp-1">
            {event.title}
          </h3>
        </Link>
        <p className="text-sm text-ccem-purple">{event.clubName}</p>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 pt-0 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={14} />
          <span>{format(eventDate, "h:mm a")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={14} />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users size={14} />
          <span>
            {event.registeredCount} / {event.registrationLimit} registered
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {onRegister && !isEventPast && (
          isRegistered ? (
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              Registered
            </Button>
          ) : isFull ? (
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              Event Full
            </Button>
          ) : (
            <Button
              className="w-full bg-ccem-purple hover:bg-ccem-purple/90"
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
