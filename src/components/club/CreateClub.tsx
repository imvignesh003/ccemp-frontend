import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import clubService from "@/services/clubService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Profile } from "@/types/response";
import { useState } from "react";

interface CreateClubProps {
  leads: Profile[];
  setIsCreating: (value: boolean) => void;
  fetchClubs: () => void;
}

const CreateClub = ({ leads, setIsCreating, fetchClubs }: CreateClubProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [newClubName, setNewClubName] = useState("");
  const [newClubDescription, setNewClubDescription] = useState("");
  const [newClubCategory, setNewClubCategory] = useState("");
  const [newClubLead, setClubLead] = useState("");
  const [creatingClub, setCreatingClub] = useState(false);

  const handleCreateClub = async (e: React.FormEvent) => {  //done
    e.preventDefault();

    if (!user) return;

    try {
      setCreatingClub(true);

      const response = await clubService.createClub({
        name: newClubName,
        description: newClubDescription,
        category: newClubCategory,
        leadId: newClubLead,
      });

      console.log(response);


      toast({
        title: "Club created",
        description: "Your new club has been created successfully.",
      });

      // Reset form and refresh clubs
      setNewClubName("");
      setNewClubDescription("");
      setNewClubCategory("");
      setClubLead("");
      setIsCreating(false);

      // Refresh clubs list
      fetchClubs();
    } catch (error) {
      console.error("Error creating club:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create club. Please try again later.",
      });
    } finally {
      setCreatingClub(false);
    }
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Create New Club</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateClub} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Club Name</Label>
              <Input
                id="new-name"
                value={newClubName}
                onChange={(e) => setNewClubName(e.target.value)}
                placeholder="Enter club name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-category">Category</Label>
              <Input
                id="new-category"
                value={newClubCategory}
                onChange={(e) => setNewClubCategory(e.target.value)}
                placeholder="e.g., Sports, Academic, Arts"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newClubDescription}
                onChange={(e) => setNewClubDescription(e.target.value)}
                placeholder="Describe your club..."
                className="min-h-32 ring-offset-secondary"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="new-lead">Club Lead</Label>
              <Select
                value={newClubLead}
                onValueChange={(value) => setClubLead(value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent className="bg-secondary">
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={String(lead.id)}>
                      {lead.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreating(false)}
              className="text-secondary outline-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-border hover:bg-border/90 text-background"
              disabled={creatingClub}
            >
              {creatingClub ? "Creating..." : "Create Club"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateClub;
