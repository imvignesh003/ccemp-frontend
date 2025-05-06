import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import React, { useState } from "react";
import profileService from "@/services/profileService";

const PersonalInfo = ({
  name,
  email,
  contact,
  setName,
  setContact,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const response = profileService.updateUser(user.id, name, contact);

      if (!response) {
        throw new Error("Failed to update profile");
      }

      setUploading(false);

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated.",
      });

      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled placeholder="Your email" />
            <p className="text-sm text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              value={contact}
              type="phone"
              onChange={(e) => {
                setContact(e.target.value);
              }}
              placeholder="Your contact number"
            />
          </div>

          <Button
            type="submit"
            className="bg-secondary hover:bg-secondary/40"
            disabled={loading || uploading}
          >
            {uploading
              ? "Uploading..."
              : loading
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
