import React from "react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface AnnouncementFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  clubId: string;
  setClubId: (value: string) => void;
  clubs: { id: string; name: string }[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AnnouncementFormFields: React.FC<AnnouncementFormFieldsProps> = ({
  title,
  setTitle,
  content,
  setContent,
  clubId,
  setClubId,
  clubs,
  isSubmitting,
  onCancel,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="club" className="text-border">
          Club
        </Label>
        <Select value={clubId} onValueChange={setClubId}>
          <SelectTrigger className="border-border focus:ring-border text-border">
            <SelectValue placeholder="Select a club"/>
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border text-border">
            {clubs.map((club) => (
              <SelectItem key={club.id} value={String(club.id)}>
                {club.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-border">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter announcement title"
          className="border-border  focus-visible:ring-border"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-border">
          Content
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your announcement here..."
          className="min-h-32 border-border  focus-visible:ring-border"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-border bg-border text-background hover:bg-border/60"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-secondary hover:bg-secondary/60 text-border"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Publishing..." : "Publish Announcement"}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementFormFields;
