
import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Announcement } from "@/types";
import AnnouncementCard from "../../components/shared/AnnouncementCard";

// Extended Announcement interface with isFromUserClub property
interface ExtendedAnnouncement extends Announcement {
  isFromUserClub?: boolean;
}

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<ExtendedAnnouncement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      
    const query = {
        data: [
            {
                id: 1,
                title: "Club Meeting",
                content: "Join us for the weekly club meeting.",
                club_id: 101,
                created_at: "2023-10-01T10:00:00Z",
                clubs: { name: "Tech Club" },
            },
            {
                id: 2,
                title: "Workshop Announcement",
                content: "Don't miss our upcoming workshop on React.",
                club_id: 102,
                created_at: "2023-10-02T12:00:00Z",
                clubs: { name: "Coding Club" },
            },
            {
                id: 3,
                title: "Sports Event",
                content: "Annual sports event is here!",
                club_id: 103,
                created_at: "2023-10-03T14:00:00Z",
                clubs: { name: "Sports Club" },
            },
        ],
        error: null,
    };
      
      // If user is logged in, prioritize announcements from their clubs
      if (user) {
        // This is a bit more complex - we'd need to get user's clubs first
        const userClubs = [
            { club_id: 101 },
            { club_id: 102 },
        ];
        
        if (userClubs && userClubs.length > 0) {
          const clubIds = userClubs.map(c => c.club_id);
          // We'll get all announcements but order by user's clubs first
        const userAnnouncementsData = query.data.filter(announcement =>
            clubIds.includes(announcement.club_id)
        );
            
        const otherAnnouncementsData = query.data.filter(
            announcement => !clubIds.includes(announcement.club_id)
        );
            
          const combinedData = [
            ...(userAnnouncementsData || []),
            ...(otherAnnouncementsData || [])
          ];
          
          // Format announcements
          const formattedAnnouncements = combinedData.map(announcement => ({
            id: announcement.id.toString(),
            title: announcement.title,
            content: announcement.content,
            clubId: announcement.club_id.toString(),
            clubName: announcement.clubs?.name || "Unknown Club",
            date: announcement.created_at,
            isFromUserClub: userClubs.some(club => club.club_id === announcement.club_id)
          }));
          
          setAnnouncements(formattedAnnouncements);
          setLoading(false);
          return;
        }
      }
      
      // If no user or user has no clubs, just get all announcements
      const { data: announcementsData, error } = await query;
      
      if (error) throw error;
      
      // Format announcements
      const formattedAnnouncements = announcementsData.map(announcement => ({
        id: announcement.id.toString(),
        title: announcement.title,
        content: announcement.content,
        clubId: announcement.club_id.toString(),
        clubName: announcement.clubs?.name || "Unknown Club",
        date: announcement.created_at
      }));
      
      setAnnouncements(formattedAnnouncements);
      
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
  
  const filteredAnnouncements = announcements.filter(announcement => 
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.clubName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-raisin_black dark:text-almond">Announcements</h1>
        <p className="text-caput_mortuum-600 dark:text-burnt_sienna-400">Stay updated with the latest news from clubs</p>
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
            <div key={i} className="h-48 bg-almond-200 dark:bg-raisin_black-500 rounded-lg animate-pulse"></div>
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
            <p className="text-caput_mortuum-600 dark:text-burnt_sienna-400">No announcements found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnnouncementsPage;
