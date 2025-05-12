
import React from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { ExtendedAnnouncement } from "@/pages/announcement/AnnouncementPage";
import { parseISO, format } from 'date-fns';

interface AnnouncementCardProps {
  announcement:ExtendedAnnouncement;
  highlight?: boolean;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, highlight = false }) => {
  const formattedDate = announcement.createdAt
    ? new Date(format(parseISO(announcement.createdAt), "yyyy-MM-dd")).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown Date";

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${highlight ? 'border-l-4 border-border bg-secondary' : 'border-border bg-secondary'}`}>
      <CardHeader className={`py-3 px-4 ${highlight ? 'bg-secondary' : 'bg-secondary'} border-b border-border`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-border">{announcement.title}
            </h3>
            <p className="text-sm text-border/90 ">{announcement.club.name}</p>
          </div>
          <div className="flex items-center text-sm text-border gap-1">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-border whitespace-pre-line">{announcement.content}</p>
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
