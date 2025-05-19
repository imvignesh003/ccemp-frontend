import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Club } from "../../types";
import { Events } from "@/pages/event/EventPage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import DashCard from "@/components/ui/DashCard";
import { format, parseISO } from "date-fns";
import clubService from "@/services/clubService";
import { eventService } from "@/services/eventService";
import LoadingSpinner from "@/components/layout/Spinner";
// import ClubLeaderAnalytics from "../../components/analytics/ClubLeaderAnalytics";

const LeaderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Events[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClubs = async () => {
      if (user) {
        setLoading(true);
        const clubs = await clubService.getMyClubs(user.id);
        setMyClubs(clubs);
        const myClubIds = clubs.map((club) => club.id);
        const eventsData = await eventService.getAllEvents();

        const registeredEvents: number[] = await eventService
          .getUserRegistrations(user.id)
          .then((res) => {
            return res.map((event) => Number(event));
          });

        const registrationCountsPromises = eventsData.map(async (event) => {
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

        const registrationCounts = await Promise.all(
          registrationCountsPromises
        );

        // Format events data
        const events = eventsData.map((event) => {
          const countObj = registrationCounts.find(
            (c) => c.eventId === event.id
          );
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
        console.log("events", events);

        const now = new Date();
        const filteredEvents = events
          .filter(
            (event: Events) =>
              myClubIds.includes(event.club.id) &&
              new Date(format(parseISO(event.dateTime), "yyyy-MM-dd")) > now
          )
          .sort(
            (a, b) =>
              new Date(format(parseISO(a.dateTime), "yyyy-MM-dd")).getTime() -
              new Date(format(parseISO(b.dateTime), "yyyy-MM-dd")).getTime()
          );
        setUpcomingEvents(filteredEvents);

        const pendingRequestsCount =
          await clubService.getAllPendingMembersCount();
        setPendingRequests(pendingRequestsCount);

        if (clubs.length > 0 && !selectedClub) {
          setSelectedClub(clubs[0]);
        }
      }
      setLoading(false);
    };
    fetchClubs();
  }, [user, selectedClub]);
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold ">Club Leader Dashboard</h1>
          <p>Manage your clubs and events</p>
        </div>
        <Link to="/create-event">
          <Button className="bg-secondary hover:bg-secondary/90">
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Dashboard Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <DashCard
          cardTitle="My Clubs"
          cardContent="Clubs you're managing"
          count={myClubs.length}
        ></DashCard>
        <DashCard
          cardTitle="Upcoming Events"
          cardContent="Events scheduled for your clubs"
          count={upcomingEvents.length}
        ></DashCard>
        <DashCard
          cardTitle="Pending Requests"
          cardContent="Club join requests awaiting approval"
          count={pendingRequests}
        ></DashCard>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="my-clubs">My Clubs</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card className="bg-secondary/80">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Club</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Registration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/events/${event.id}`}
                            className="hover:text-background"
                          >
                            {event.title}
                          </Link>
                        </TableCell>
                        <TableCell>{event.club.name}</TableCell>
                        <TableCell>
                          {format(parseISO(event.dateTime), "yyyy-MM-dd")}
                        </TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell className="text-right">
                          {event.registeredCount} / {event.maxParticipants}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No upcoming events scheduled.</p>
                  <Link to="/create-event">
                    <Button className="mt-2 bg-secondary text-background hover:bg-secondary/70">
                      Create an Event
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-clubs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Clubs</CardTitle>
            </CardHeader>
            <CardContent>
              {myClubs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Club Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myClubs.map((club) => (
                      <TableRow key={club.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/clubs/${club.id}`}
                            className="hover:text-ccem-purple"
                          >
                            {club.name}
                          </Link>
                        </TableCell>
                        <TableCell>{club.category}</TableCell>
                        <TableCell>{club.memberCount}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/manage-clubs/${club.id}`}>
                            <Button size="sm" variant="outline">
                              Manage
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    You don't manage any clubs yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderDashboard;
