import React, { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import clubService from "@/services/clubService";
import { Club } from "@/types/response";

const EditClub = ({
  selectedClub,
  setIsEditing,
  setClubs,
  setSelectedClub,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editCategory,
  setEditCategory,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) => {
  const { toast } = useToast();


  const [editingClub, setEditingClub] = useState(false);

  const handleUpdateClub = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClub) return;

    try {
      setEditingClub(true);

      // Prepare updated club data
      const updatedClub = {
        name: editName,
        description: editDescription,
        category: editCategory,
        leadId: selectedClub.leadId,
      };

      // Make API call to update the club
      const response = await clubService.updateClub(selectedClub.id, updatedClub);

      if (response) {
        toast({
          title: "Club updated",
          description: "Club details have been updated successfully.",
        });

        // Update local state
        setSelectedClub(updatedClub);

        // Update clubs list
        setClubs((prev :Club[]) =>
          prev.map((club :Club) =>
            club.id === selectedClub.id ? updatedClub : club
          )
        );

        // Reset editing mode
        setIsEditing(false);
      } else {
        throw new Error("Failed to update club");
      }
    } catch (error) {
      console.error("Error updating club:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update club details. Please try again later.",
      });
    } finally {
      setEditingClub(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Edit Club</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateClub} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Club Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-32"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              
              onClick={() => setIsEditing(false)}
              className="text-secondary outline-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-border hover:bg-border/60 text-background"
              disabled={editingClub}
            >
              {editingClub ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
};

export default EditClub;
