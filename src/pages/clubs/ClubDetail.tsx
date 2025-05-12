import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Users } from "lucide-react";
import { Club } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import EventCard from "@/components/shared/EventCard";
import AnnouncementCard from "@/components/shared/AnnouncementCard";
import { format, parseISO } from "date-fns";
import adminService from "@/services/adminService";
import clubService, { MemberData } from "@/services/clubService";
import { RegisteredEvents } from "@/pages/event/EventPage";
import { eventService } from "@/services/eventService.ts";
import { announcementService } from "@/services/announcementService";
import { Announcement } from "@/types/response";

const ClubDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // const club: Club | null = useLocation().state?.club as Club;
  const { user } = useAuth();
  const { toast } = useToast();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<RegisteredEvents[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [leader, setLeader] = useState<{ name: string; email: string } | null>(
    null
  );
  const [memberStatus, setMemberStatus] = useState<
    "APPROVED" | "PENDING" | "REJECTED" | "NONE"
  >("NONE");
  const [loading, setLoading] = useState(true);
  const [registeringEvent, setRegisteringEvent] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (id) {
        try {
          const clubData = await clubService.getClubById(String(id));
          if (!clubData) {
            throw new Error("Club not found");
          }
          setClub(clubData);

          console.log("club334", clubData);

          setIsLeader(
            user?.role === "LEAD" || user?.role === "ADMIN" ? true : false
          );
          fetchEventDetails();
        } catch (error) {
          console.error("Error fetching member status:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description:
              "Failed to load member status. Please try again later.",
          });
        }
      }
    };

    fetch();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (club) {
        try {
          const response = id
            ? await clubService.getClubMemberDetails(id)
            : null;
          if (response) {
            const member = response.find(
              (member) => member.profile.id === Number(user.id)
            );
            const status = member
              ? (member.status as "APPROVED" | "PENDING" | "REJECTED" | "NONE")
              : "NONE";
            setMemberStatus(status);
          } else {
            throw new Error("Member status not found");
          }
          fetchLeader(club?.lead.id);
        } catch (error) {
          console.error("Error fetching member status:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description:
              "Failed to load member status. Please try again later.",
          });
        }
      }
    };

    fetchData();
  }, [club, memberStatus]);

  const fetchLeader = async (leadId: string) => {
    //done
    try {
      const respose = await adminService.getProfileById(leadId);
      if (respose) {
        setLeader({
          name: respose.name,
          email: respose.email,
        });
      } else {
        throw new Error("Leader not found");
      }
    } catch (error) {
      console.error("Error fetching leader:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to load club leader details. Please try again later.",
      });
    }
  };

  const fetchEventDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch all events
      const response = await eventService.getClubEvents(id);

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
          isRegistered: false,
        };
      });

      setEvents(formattedEvents);

      // Fetch club announcements from the backend
      const announcementsData = await announcementService.getClubAnnouncements(
        id
      );

      // Format announcements
      const formattedAnnouncements = announcementsData.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        club: announcement.club,
        createdAt: announcement.createdAt,
      }));

      setAnnouncements(formattedAnnouncements);

      // Fetch club members from the backend
      const membersData = await clubService.getClubMemberDetails(id);

      // Format members
      const formattedMembers = membersData
        .filter((member) => member.clubDto !== undefined)
        .map((member) => ({
          id: member.id,
          club: member.clubDto as Club,
          profile: member.profile,
          joinedAt: member.joinedDate,
          status: member.status as "APPROVED" | "PENDING" | "REJECTED",
        }));

      setMembers(formattedMembers);

      // Check if user is a member of this club
      if (user) {
        const memberData = await clubService.getMemberStatus(id, user.id);
        setMemberStatus(memberData.status as "APPROVED" | "PENDING");
        // Check if user is registered for any events
        const registrationsData = await eventService.getUserRegistrations(
          user.id
        );
        console.log("registrationsData", registrationsData);
        const registeredEventIds = registrationsData;

        // Update events with registration status
        setEvents((prev) =>
          prev.map((event) => ({
            ...event,
            isRegistered: registeredEventIds.includes(event.id),
          }))
        );
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
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
      try {
        const response = await clubService.joinClub(club.id, user.id as number);
        if (response) {
          setMemberStatus("PENDING");
        } else {
          throw new Error("Failed to join club");
        }
      } catch (error) {
        console.error("Error joining club:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send join request. Please try again.",
        });
      }

      toast({
        title: "Request sent",
        description:
          "Your club join request has been sent and is awaiting approval.",
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
          <div className="h-32 bg-border rounded-lg animate-pulse"></div>
          <div className="h-64 bg-border rounded-lg animate-pulse"></div>
          <div className="h-48 bg-border rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  // if (!club) {
  //   return (
  //     <div className="container py-10 text-center">
  //       <h1 className="text-2xl font-bold mb-4">Club not found</h1>
  //       <p className="mb-6">
  //         The club you're looking for doesn't exist or has been removed.
  //       </p>
  //       <Link to="/clubs">
  //         <Button>Back to Clubs</Button>
  //       </Link>
  //     </div>
  //   );
  // }

  const futureEvents = events.filter(
    (event) =>
      new Date(format(parseISO(event.dateTime), "yyyy-MM-dd")) >= new Date()
  );
  const pastEvents = events.filter(
    (event) =>
      new Date(format(parseISO(event.dateTime), "yyyy-MM-dd")) < new Date()
  );

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{club?.name}</h1>
          <p className="text-gray-500">Category: {club?.category}</p>
        </div>
        <div className="flex items-center gap-4">
          {user.role !== "LEAD" &&
            user.role !== "ADMIN" &&
            memberStatus === "NONE" && (
              <Button
                onClick={handleJoinClub}
                className="bg-border hover:bg-border/60 text-background"
              >
                Join Club
              </Button>
            )}

          {memberStatus === "PENDING" && (
            <Button disabled className="bg-yellow-500">
              Membership Pending
            </Button>
          )}

          {(user.role === "LEAD" || user.role === "ADMIN") && (
            <Link to={`/manage-clubs/${club?.id}`}>
              <Button
                variant="outline"
                className="bg-border hover:bg-border/60 text-background"
              >
                Manage Club
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-border">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-border">{club?.description}</p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 " />
                <p>Leader: {leader?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <p>{club?.memberCount} Members</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 " />
                <p>
                  Founded:{" "}
                  {club?.createdAt &&
                    format(new Date(club?.createdAt), "MMMM yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.role === "ADMIN" || user.role === "LEAD" ? (
              <div className="text-center">
                <p className="mb-4 text-gray-700">
                  Manage this club's events and announcements.
                </p>
                <Link to={`/manage-clubs/${club?.id}`}>
                  <Button
                    variant="outline"
                    className="bg-border hover:bg-border/60 text-background w-full mt-10"
                  >
                    Manage Club
                  </Button>
                </Link>
              </div>
            ) : memberStatus === "PENDING" ? (
              <div className="text-center">
                <div className="mb-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md">
                  Your membership is pending approval
                </div>
                <p className="text-sm text-gray-500">
                  The club leader will review your request soon.
                </p>
              </div>
            ) : "APPROVED".localeCompare(memberStatus) == 0 ? (
              <div className="text-center">
                <div className="mb-4 bg-green-100 text-green-800 px-4 py-2 rounded-md">
                  You are a member of this club
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  You have access to all club events and announcements.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4 text-gray-700">
                  Join this club to participate in events and receive
                  announcements.
                </p>
                <Button
                  onClick={handleJoinClub}
                  className="bg-border hover:bg-border/60 text-background w-full mt-10"
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
                  <EventCard key={event.id} event={event} isPast={true} />
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
              <Card key={member.profile.id} className="overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ccem-purple text-white flex items-center justify-center">
                    {member.profile.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{member.profile.name}</p>
                    <p className="text-sm text-gray-500">
                      Joined{" "}
                      {member?.joinedAt
                        ? format(member.joinedAt, "MMM yyyy")
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {members.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">This club has no members yet.</p>
              {memberStatus === "NONE" && (
                <Button
                  onClick={handleJoinClub}
                  className="mt-2 bg-secondary hover:bg-secondary/60"
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
