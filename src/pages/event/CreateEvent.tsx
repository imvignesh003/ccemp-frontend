import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useAuth } from "@/hooks/useAuth.ts";
import { Club } from "@/types";
import { Calendar } from "@/components/ui/calender.tsx";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import clubService from "@/services/clubService.ts";
import { eventService } from "@/services/eventService.ts";

const CreateEvent: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("12:00");
  const [maxParticipants, setMaxParticipants] = useState(30);
  const [clubId, setClubId] = useState("");

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  //   const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, [user]);

  const fetchClubs = async () => {
    //done
    if (!profile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await clubService.getAllClubs();

      if (!data) {
        console.error("Error fetching clubs: Eoor Fetching Clubs");
        throw new Error("Error fetching clubs: Eoor Fetching Clubs");
      }

      const formattedClubs = data.map((club) => {
        return {
          id: club.id,
          name: club.name,
          description: club.description,
          category: club.category,
          createdAt: club.createdAt,
          lead: club.lead,
        };
      });
      formattedClubs.sort((a, b) => a.name.localeCompare(b.name));

      setClubs(formattedClubs);

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

  //   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     if (e.target.files && e.target.files[0]) {
  //       const file = e.target.files[0];

  //       if (file.size > 5 * 1024 * 1024) { // 5MB limit
  //         toast({
  //           variant: "destructive",
  //           title: "File too large",
  //           description: "Please select an image smaller than 5MB.",
  //         });
  //         return;
  //       }

  //       setImageFile(file);
  //       setImageUrl(URL.createObjectURL(file));
  //     }
  //   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast({
        variant: "destructive",
        title: "Missing date",
        description: "Please select a date for the event.",
      });
      return;
    }

    if (!clubId) {
      toast({
        variant: "destructive",
        title: "Missing club",
        description: "Please select a club for the event.",
      });
      return;
    }

    try {
      setLoading(true);

      // Combine date and time with UTC adjustment
      const [hours, minutes] = time.split(":").map(Number);
      
      const eventDateTime = new Date(date);
      eventDateTime.setUTCHours(hours, minutes, 0, 0); // Set time explicitly in UTC
      


      const response = await eventService.createEvent({
        title,
        description,
        location,
        dateTime: eventDateTime.toISOString(),
        clubId,
        maxParticipants,
      });

      if (!response) {
        console.error("Error creating event: Eoor Creating Event");
        throw new Error("Error creating event: Eoor Creating Event");
      }

      // Create event
      //   const { data: eventData, error: eventError } = await supabase
      //     .from('events')
      //     .insert({
      //       title,
      //       description,
      //       location,
      //       date: eventDateTime.toISOString(),
      //       club_id: clubId,
      //       registration_limit: maxParticipants,
      //       image: eventImageUrl
      //     })
      //     .select('id')
      //     .single();

      //   if (eventError) throw eventError;

      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      });

      // Navigate to event page
      navigate(`/events/${response.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if user can create events
  if (
    !user ||
    (profile?.profile.role !== "LEAD" && profile?.profile.role !== "ADMIN")
  ) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You don't have permission to create events.</p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Create New Event
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="club">Club</Label>
                <select
                  id="club"
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select a club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter event location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration-limit">Registration Limit</Label>
                <Input
                  id="registration-limit"
                  type="number"
                  min="1"
                  value={maxParticipants}
                  onChange={(e) =>
                    setMaxParticipants(parseInt(e.target.value))
                  }
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter event description"
                  className="min-h-32"
                  required
                />
              </div>

              {/* <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image">Event Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              
              {imageUrl && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Preview:</p>
                  <img 
                    src={imageUrl} 
                    alt="Event preview" 
                    className="max-h-40 rounded-md"
                  />
                </div>
              )} */}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                className="bg-border text-white border-border hover:bg-border/60"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-secondary hover:secondary/90"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEvent;
