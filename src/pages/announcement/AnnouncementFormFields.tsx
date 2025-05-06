
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
import { UserRole } from "../../types";

interface AnnouncementFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  clubId: string;
  setClubId: (value: string) => void;
  clubs: { id: string; name: string }[];
  targetRole: UserRole | "ALL";
  setTargetRole: (value: UserRole | "ALL") => void;
  isAdmin: boolean;
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
  targetRole,
  setTargetRole,
  isAdmin,
  isSubmitting,
  onCancel,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="club" className="text-raisin_black dark:text-almond-200">Club</Label>
        <Select value={clubId} onValueChange={setClubId}>
          <SelectTrigger className="border-burnt_sienna-300 dark:border-caput_mortuum-500 focus:ring-burnt_sienna-400 dark:focus:ring-burnt_sienna-600">
            <SelectValue placeholder="Select a club" />
          </SelectTrigger>
          <SelectContent className="bg-almond-100 dark:bg-raisin_black-400 border-burnt_sienna-300 dark:border-caput_mortuum-500">
            {clubs.map((club) => (
              <SelectItem key={club.id} value={club.id}>
                {club.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isAdmin && (
        <div className="space-y-2">
          <Label htmlFor="target" className="text-raisin_black dark:text-almond-200">Target Audience</Label>
          <Select value={targetRole} onValueChange={(value) => setTargetRole(value as UserRole | "ALL")}>
            <SelectTrigger className="border-burnt_sienna-300 dark:border-caput_mortuum-500 focus:ring-burnt_sienna-400 dark:focus:ring-burnt_sienna-600">
              <SelectValue placeholder="Select target audience" />
            </SelectTrigger>
            <SelectContent className="bg-almond-100 dark:bg-raisin_black-400 border-burnt_sienna-300 dark:border-caput_mortuum-500">
              <SelectItem value="ALL">Everyone</SelectItem>
              <SelectItem value="STUDENT">Students Only</SelectItem>
              <SelectItem value="CLUB_LEADER">Club Leaders Only</SelectItem>
              <SelectItem value="ADMIN">Admins Only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-caput_mortuum-600 dark:text-burnt_sienna-400">
            As an admin, you can target announcements to specific roles.
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="title" className="text-raisin_black dark:text-almond-200">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter announcement title"
          className="border-burnt_sienna-300 dark:border-caput_mortuum-500 focus-visible:ring-burnt_sienna-300 dark:focus-visible:ring-caput_mortuum-400"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content" className="text-raisin_black dark:text-almond-200">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your announcement here..."
          className="min-h-32 border-burnt_sienna-300 dark:border-caput_mortuum-500 focus-visible:ring-burnt_sienna-300 dark:focus-visible:ring-caput_mortuum-400"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-burnt_sienna text-burnt_sienna hover:bg-burnt_sienna/10 dark:border-burnt_sienna-400 dark:text-burnt_sienna-400"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-burnt_sienna hover:bg-burnt_sienna-600 text-almond"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Publishing..." : "Publish Announcement"}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementFormFields;
