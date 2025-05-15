import React, { useState, useEffect } from "react";
import { useToast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Search, Filter } from "lucide-react";
import { ExtendedClub } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import ClubCard from "../../components/shared/ClubCard";
import clubService from "@/services/clubService";


const ClubsPage: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<ExtendedClub[]>([]);
  const [myClubs, setMyClubs] = useState<ExtendedClub[]>([]);
  const [managedClubs, setManagedClubs] = useState<ExtendedClub[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.profile.role === "ADMIN";
  const isClubLeader = profile?.profile.role === "LEAD" || isAdmin;

  useEffect(() => {
    fetchClubs();
  }, [profile]);

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

      if (data) {
        // Fetch member counts and member data from clubService
        const memberCountsPromises = data.map(async (club) => {
          try {
        const memberData = await clubService.getClubMemberDetails(club.id); // Fetch members for the club
        return {
          clubId: club.id,
          count: memberData.length || 0, // Use the length of the member data array
        };
          } catch (error) {
        console.error(`Error fetching members for club ${club.id}:`, error);
        return {
          clubId: club.id,
          count: 0,
        };
          }
        });

        const memberCounts = await Promise.all(memberCountsPromises);

        const formattedClubs = data.map((club) => {
          const countObj = memberCounts.find((c) => c.clubId === club.id);
          return {
        id: club.id,
        name: club.name,
        description: club.description,
        category: club.category,
        createdAt: club.createdAt,
        lead: club.lead,
        memberCount: countObj ? countObj.count : 0,
          };
        });
        formattedClubs.sort((a, b) => a.name.localeCompare(b.name));

        setClubs(formattedClubs);
        setManagedClubs(
          formattedClubs.filter((club) => Number(club.lead.id) === Number(profile.profile.id))
        );
        const myClubsData = await Promise.all(
          formattedClubs.map(async (club) => {
            const memberData = await clubService.getClubMemberDetails(club.id);
            return memberData.some((member) => member.profile.id === Number(profile.profile.id))
              ? club
              : null;
          })
        ).then((clubs) => clubs.filter((club) => club !== null));
        setMyClubs(myClubsData);
        setCategories([...new Set(formattedClubs.map((club) => club.category))]);
        console.log("Managed Clubs", formattedClubs);
      }

        // // Select first club by default if none selected
        // if (formattedClubs.length > 0 && !selectedClub) {
        //   setSelectedClub(formattedClubs[0]);
        // }

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

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || club.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value === "all" ? null : value);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Campus Clubs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-border rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Campus Clubs</h1>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Clubs</TabsTrigger>
          {profile && <TabsTrigger value="my">My Clubs</TabsTrigger>}
          {isClubLeader && (
            <TabsTrigger value="managed">Clubs I Manage</TabsTrigger>
          )}
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              className="pl-10"
              placeholder="Search clubs by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select onValueChange={handleCategoryChange} defaultValue="all">
            <SelectTrigger className="w-full md:w-48 bg-secondary text-background">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-secondary text-background ">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="space-y-6">
          {filteredClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <ClubCard key={club.id} club={club}/>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">
                No clubs match your search criteria.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-6">
          {myClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs
                .filter(
                  (club) =>
                    (!categoryFilter || club.category === categoryFilter) &&
                    (club.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                      club.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
                )
                .map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">You haven't joined any clubs yet.</p>
              <Button
                className="mt-4 bg-ccem-purple hover:bg-ccem-purple/90"
                onClick={() => (window.location.href = "#all")}
              >
                Browse Clubs
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="managed" className="space-y-6">
          {managedClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managedClubs
                .filter(
                  (club) =>
                    (!categoryFilter || club.category === categoryFilter) &&
                    (club.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                      club.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
                )
                .map((club) => (
                  <ClubCard key={club.id} club={club} >
                    <Badge className="bg-ccem-purple text-xs absolute top-3 right-3">
                      You Manage
                    </Badge>
                  </ClubCard>
                ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">You don't manage any clubs yet.</p>
              {isAdmin && (
                <Button
                  className="mt-4 bg-ccem-purple hover:bg-ccem-purple/90"
                  onClick={() => (window.location.href = "/manage-clubs")}
                >
                  Create Club
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubsPage;
