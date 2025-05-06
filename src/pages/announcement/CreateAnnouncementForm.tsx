
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useClubLeadership } from "../../hooks/useClubLeadership";
import { canPostAnnouncement, UserRole } from "../../types";
import { MessageSquarePlus } from "lucide-react";
import { useClubsFetching } from "../../hooks/useClubsFetching";
import AnnouncementFormFields from "./AnnouncementFormFields";
import UnauthorizedView from "./UnauthorizedView";

const CreateAnnouncementForm: React.FC = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const clubIdParam = searchParams.get("clubId");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<UserRole | "ALL">("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { clubs, clubId, setClubId } = useClubsFetching(clubIdParam);
  const { isLeader } = useClubLeadership(user?.id, clubId);
  const isAdmin = profile?.role === 'ADMIN';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !clubId) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    // Verify permissions
    if (profile && !canPostAnnouncement(profile.role, targetRole === "ALL" ? null : targetRole as UserRole)) {
      toast({
        variant: "destructive",
        title: "Not authorized",
        description: "You don't have permission to post this announcement.",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the announcement
      const { error } = await supabase
        .from('announcements')
        .insert({
          title,
          content,
          club_id: clubId,
          target_role: targetRole === "ALL" ? null : targetRole
        });
      
      if (error) throw error;
      
      toast({
        title: "Announcement created",
        description: "Your announcement has been published successfully.",
      });
      
      // Redirect to announcements page
      navigate("/announcements");
      
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create announcement. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if user can post announcements
  if (profile && !canPostAnnouncement(profile.role)) {
    return <UnauthorizedView />;
  }
  
  return (
    <div className="container py-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquarePlus size={28} className="text-burnt_sienna dark:text-burnt_sienna-400" />
        <h1 className="text-3xl font-bold text-raisin_black dark:text-almond">Create Announcement</h1>
      </div>
      
      <Card className="border-almond-300 dark:border-caput_mortuum-600">
        <CardHeader className="border-b border-almond-300 dark:border-caput_mortuum-600">
          <CardTitle className="text-raisin_black dark:text-almond">Announcement Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <AnnouncementFormFields
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            clubId={clubId}
            setClubId={setClubId}
            clubs={clubs}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            isAdmin={isAdmin}
            isSubmitting={isSubmitting}
            onCancel={() => navigate("/announcements")}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAnnouncementForm;
