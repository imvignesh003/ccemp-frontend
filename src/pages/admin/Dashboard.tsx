import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Users,
  Calendar,
  Bell,
  Briefcase,
  Shield,
} from "lucide-react";
import DashCard from "@/components/ui/DashCard";
import adminService from "@/services/adminService";
import clubService from "@/services/clubService";
import { eventService } from "@/services/eventService";
// import AdminAnalytics from "../../components/analytics/AdminAnalytics";

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    userCount: 0,
    clubCount: 0,
    eventCount: 0,
  });

  useEffect(() => {
    if (profile?.profile.role === "ADMIN") {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      // Fetch user count

      const userCount = await adminService.getAllUsersCount() - 1;

      // Fetch club count
      const clubCount = await clubService.getClubsCount();

      // Fetch event count
      const eventCount = await eventService.getAllEventsCount();

      // Set the stats
      setStats({
        userCount: userCount || 0,
        clubCount: clubCount || 0,
        eventCount: eventCount || 0
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  if (profile?.profile.role !== "ADMIN") {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">
          You don't have admin permissions to view this page.
        </p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage and monitor campus activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashCard
          cardTitle="Total Users"
          cardContent="Registered users"
          count={stats.userCount}
        >
          <Users className="h-4 w-4 text-gray-500" />
        </DashCard>

        <DashCard
          cardTitle="Total Clubs"
          cardContent="Active campus clubs"
          count={stats.clubCount}
        >
          <Briefcase className="h-4 w-4 text-gray-500" />
        </DashCard>

        <DashCard
          cardTitle="Total Events"
          cardContent="Scheduled events"
          count={stats.eventCount}
        >
          <Calendar className="h-4 w-4 text-gray-500" />
        </DashCard>
      </div>

      {/* Analytics Dashboard */}
      {/* <div className="mb-8">
        <AdminAnalytics />
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ">
        <Card className="col-span-1 bg-secondary/80">
          <CardHeader>
            <CardTitle className="text-border text-3xl">Quick Actions</CardTitle>
            <CardDescription className="text-border">Common management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/admin/users" className="block">
              <Button className="w-full flex justify-between items-center text-background bg-border hover:bg-border/70">
                <span>Manage Users</span>
                <Shield className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/manage-clubs" className="block">
              <Button className="w-full flex justify-between items-center text-background bg-border hover:bg-border/70">
                <span>Manage Clubs</span>
                <Briefcase className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/create-announcement" className="block">
              <Button className="w-full flex justify-between items-center text-background bg-border hover:bg-border/70">
                <span>Send Announcement</span>
                <Bell className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/create-event" className="block">
              <Button className="w-full flex justify-between items-center text-background bg-border hover:bg-border/70">
                <span>Create Event</span>
                <Calendar className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
{/* 
        <Card className="col-span-1 bg-secondary/80">
          <CardHeader>
            <CardTitle className="text-border text-3xl">System Overview</CardTitle>
            <CardDescription className="text-border">Status and pending approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-8 ">
              <div className="flex items-center justify-between text-background bg-border px-4 p-3 rounded-[8px]">
                <div className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-background" />
                  <span>Pending Leader Requests</span>
                </div>
                <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 rounded">
                  {stats.pendingLeaderRequests}
                </span>
              </div>

              <div className="flex items-center justify-between text-background bg-border px-4 p-3 rounded-[8px]">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-background" />
                  <span>Pending Club Approvals</span>
                </div>
                <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 rounded">
                  {stats.pendingClubs}
                </span>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default AdminDashboard;
