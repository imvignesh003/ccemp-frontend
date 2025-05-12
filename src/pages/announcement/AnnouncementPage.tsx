import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquarePlus, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AnnouncementCard from "../../components/shared/AnnouncementCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { announcementService } from "@/services/announcementService";
import clubService from "@/services/clubService";
import { Announcement } from "@/types/response";

// Extended Announcement interface with isFromUserClub property
export interface ExtendedAnnouncement extends Announcement {
  isFromUserClub?: boolean;
}

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<ExtendedAnnouncement[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const data = await announcementService.getAllAnnouncements();
      console.log("Announcements data:", data);

      if (user) {
        const userClubs = await clubService.getUserClubs(user.id);

        if (userClubs && userClubs.length > 0) {
          const clubIds = userClubs.map((c) => Number(c.id));
          // We'll get all announcements but order by user's clubs first
          const userAnnouncementsData = data.filter((announcement) =>
            clubIds.includes(Number(announcement.club.id))
          );

          const otherAnnouncementsData = data.filter(
            (announcement) => !clubIds.includes(Number(announcement.club.id))
          );

          const combinedData = [
            ...(userAnnouncementsData || []),
            ...(otherAnnouncementsData || []),
          ];

          // Format announcements
          const formattedAnnouncements = combinedData.map((announcement) => ({
            id: announcement.id.toString(),
            title: announcement.title,
            content: announcement.content,
            club: announcement.club,
            createdAt: announcement.createdAt,
            isFromUserClub: userClubs.some(
              (club) => club.id === announcement.club.id
            ),
          }));

          setAnnouncements(formattedAnnouncements);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load announcements. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-raisin_black dark:text-almond">
            Announcements
          </h1>
          <p className="text-caput_mortuum-600 dark:text-burnt_sienna-400">
            Stay updated with the latest news from clubs
          </p>
        </div>
        {(user?.role === "LEAD" || user?.role === "ADMIN") && (
          <Link to="/create-announcement">
            <Button className="bg-border hover:bg-border/60 text-background">
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Create Announcement
            </Button>
          </Link>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-caput_mortuum-500 dark:text-burnt_sienna-400" />
        <Input
          placeholder="Search announcements..."
          className="pl-10 border-burnt_sienna-300 dark:border-caput_mortuum-500 focus-visible:ring-burnt_sienna-300 dark:focus-visible:ring-caput_mortuum-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-almond-200 dark:bg-raisin_black-500 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              highlight={announcement.isFromUserClub}
            />
          ))}
        </div>
      ) : (
        <Card className="border-almond-300 dark:border-caput_mortuum-600">
          <CardContent className="py-10 text-center">
            <p className="text-caput_mortuum-600 dark:text-burnt_sienna-400">
              No announcements found matching your search.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnnouncementsPage;
