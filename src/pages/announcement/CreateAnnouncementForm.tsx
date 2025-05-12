import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { MessageSquarePlus } from "lucide-react";
import { useClubsFetching } from "@/hooks/useClubFetching";
import AnnouncementFormFields from "./AnnouncementFormFields";
import { announcementService } from "@/services/announcementService";

const CreateAnnouncementForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const clubIdParam = searchParams.get("clubId");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { clubs, clubId, setClubId } = useClubsFetching(clubIdParam);
  
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
    try {
      setIsSubmitting(true);
      
      // Create the announcement

      const response = await announcementService.createAnnouncement({
        title,
        content,
        clubId: clubId,
      });

      if(!response.id){
        throw new Error("Failed to create announcement");
      }
      
      
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
  

  
  return (
    <div className="container py-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquarePlus size={28} className="text-border" />
        <h1 className="text-3xl font-bold text-border">Create Announcement</h1>
      </div>
      
      <Card className="border-border text-border">
        <CardHeader className="border-b border-border ">
          <CardTitle className="text-border">Announcement Details</CardTitle>
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
            isSubmitting={isSubmitting}
            onCancel={() => navigate(-1)}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAnnouncementForm;
