
import { useState, useEffect } from "react";
import { useToast } from "../components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import clubService from "@/services/clubService";

interface Club {
  id: string;
  name: string;
}

export const useClubsFetching = (clubIdParam: string | null) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState<string>(clubIdParam || "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchUserClubs();
    }
  }, [profile]);
  
  const fetchUserClubs = async () => {
    try {
      setIsLoading(true);
      let fetchedClubs: Club[] = [];
      
      if (profile?.profile.role === 'ADMIN') {
        // Admins can see all clubs
        fetchedClubs = await clubService.getAllClubs();
      } else if (profile?.profile.role === 'LEAD') {
        // Club leaders see their clubs
        fetchedClubs = await clubService.getMyClubs(Number(profile.profile.id));
      } else {
        // Students don't see any clubs (they can't create announcements)
        setClubs([]);
        setIsLoading(false);
        return;
      }
      
      setClubs(fetchedClubs || []);
      
      // If a club ID was provided in URL and it's valid, use it
      if (clubIdParam && fetchedClubs?.some(club => club.id === clubIdParam)) {
        setClubId(clubIdParam);
      } else if (fetchedClubs && fetchedClubs.length > 0) {
        setClubId(fetchedClubs[0].id);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your clubs.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { clubs, clubId, setClubId, isLoading };
};
