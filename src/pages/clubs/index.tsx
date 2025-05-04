/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useToast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Search, Filter } from "lucide-react";
import { ExtendedClub } from "@/types";
import { useAuth } from "../../context/AuthContext";
import ClubCard from "../../components/shared/ClubCard";

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

  const isAdmin = profile?.role === 'ADMIN';
  const isClubLeader = profile?.role === 'CLUB_LEADER' || isAdmin;

  useEffect(() => {
    fetchClubs();
  }, [profile]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      
      // Fetch all clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select(`
          id, 
          name, 
          description, 
          category, 
          logo, 
          created_at, 
          leader_id
        `);
      
      if (clubsError) throw clubsError;
      
      // Get member counts in a separate query
      const memberCountsPromises = clubsData.map(async (club: { id: any; }) => {
        const { count, error: countError } = await supabase
          .from('club_members')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', club.id)
          .eq('status', 'APPROVED');
        
        return { 
          clubId: club.id, 
          count: count || 0 
        };
      });
      
      const memberCounts = await Promise.all(memberCountsPromises);
      
      // Format clubs data
      const formattedClubs = clubsData.map((club: { id: any; name: any; description: any; category: any; logo: any; created_at: any; leader_id: any; }) => {
        const countObj = memberCounts.find((c: { clubId: any; }) => c.clubId === club.id);
        return {
          id: club.id,
          name: club.name,
          description: club.description,
          category: club.category,
          logo: club.logo,
          createdAt: club.created_at,
          leaderId: club.leader_id,
          memberCount: countObj ? countObj.count : 0
        };
      }) as ExtendedClub[];
      
      setClubs(formattedClubs);
      
      // Extract categories
      const uniqueCategories = Array.from(new Set(formattedClubs.map(club => club.category)));
      setCategories(uniqueCategories);
      
      // If user is logged in, fetch user's memberships
      if (profile) {
        const { data: membershipData, error: membershipError } = await supabase
          .from('club_members')
          .select(`
            club_id,
            status,
            clubs (
              id, 
              name, 
              description, 
              category, 
              logo, 
              created_at, 
              leader_id
            )
          `)
          .eq('user_id', profile.id);
          
        if (!membershipError && membershipData) {
          const myClubsList = membershipData
            .filter((item: { status: string; }) => item.status === 'APPROVED')
            .map((item: { club_id: any; clubs: { id: any; name: any; description: any; category: any; logo: any; created_at: any; leader_id: any; }; status: any; }) => {
              const countObj = memberCounts.find((c: { clubId: any; }) => c.clubId === item.club_id);
              return {
                id: item.clubs.id,
                name: item.clubs.name,
                description: item.clubs.description,
                category: item.clubs.category,
                logo: item.clubs.logo,
                createdAt: item.clubs.created_at,
                leaderId: item.clubs.leader_id,
                memberCount: countObj ? countObj.count : 0,
                status: item.status
              } as ExtendedClub;
            });
          
          setMyClubs(myClubsList);
          
          // For club leaders, also get clubs they manage
          if (isClubLeader) {
            const { data: managedClubsData, error: managedError } = await supabase
              .from('clubs')
              .select(`
                id, 
                name, 
                description, 
                category, 
                logo, 
                created_at, 
                leader_id
              `);
              
            if (!managedError && managedClubsData) {
              let managedClubsList = [];
              
              if (isAdmin) {
                // Admin can see and manage all clubs
                managedClubsList = managedClubsData.map((club: { id: any; name: any; description: any; category: any; logo: any; created_at: any; leader_id: any; }) => {
                  const countObj = memberCounts.find((c: { clubId: any; }) => c.clubId === club.id);
                  return {
                    id: club.id,
                    name: club.name,
                    description: club.description,
                    category: club.category,
                    logo: club.logo,
                    createdAt: club.created_at,
                    leaderId: club.leader_id,
                    memberCount: countObj ? countObj.count : 0
                  } as ExtendedClub;
                });
              } else {
                // Club leaders can only see clubs they lead
                managedClubsList = managedClubsData
                  .filter((club: { leader_id: string; }) => club.leader_id === profile.id)
                  .map((club: { id: any; name: any; description: any; category: any; logo: any; created_at: any; leader_id: any; }) => {
                    const countObj = memberCounts.find((c: { clubId: any; }) => c.clubId === club.id);
                    return {
                      id: club.id,
                      name: club.name,
                      description: club.description,
                      category: club.category,
                      logo: club.logo,
                      createdAt: club.created_at,
                      leaderId: club.leader_id,
                      memberCount: countObj ? countObj.count : 0
                    } as ExtendedClub;
                  });
              }
              
              setManagedClubs(managedClubsList);
            }
          }
        }
      }
      
    } catch (error) {
      console.error("Error fetching clubs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load clubs. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
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
          {isClubLeader && <TabsTrigger value="managed">Clubs I Manage</TabsTrigger>}
        </TabsList>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search clubs by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select onValueChange={handleCategoryChange} defaultValue="all">
            <SelectTrigger className="w-full md:w-48">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent>
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
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">No clubs match your search criteria.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my" className="space-y-6">
          {myClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs
                .filter(club => (!categoryFilter || club.category === categoryFilter) && 
                               (club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                club.description.toLowerCase().includes(searchTerm.toLowerCase())))
                .map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">You haven't joined any clubs yet.</p>
              <Button className="mt-4 bg-ccem-purple hover:bg-ccem-purple/90"
                onClick={() => window.location.href = "#all"}>
                Browse Clubs
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="managed" className="space-y-6">
          {managedClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managedClubs
                .filter(club => (!categoryFilter || club.category === categoryFilter) && 
                               (club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                club.description.toLowerCase().includes(searchTerm.toLowerCase())))
                .map((club) => (
                  <ClubCard key={club.id} club={club}>
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
                <Button className="mt-4 bg-ccem-purple hover:bg-ccem-purple/90"
                  onClick={() => window.location.href = "/manage-clubs"}>
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
