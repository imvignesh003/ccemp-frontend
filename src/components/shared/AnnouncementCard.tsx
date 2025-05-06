
import React from "react";
import { Announcement } from "../../types";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";

interface AnnouncementCardProps {
  announcement: Announcement;
  highlight?: boolean;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, highlight = false }) => {
  const formattedDate = new Date(announcement.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${highlight ? 'border-l-4 border-burnt_sienna' : 'border-almond-300 dark:border-caput_mortuum-600'}`}>
      <CardHeader className={`py-3 px-4 ${highlight ? 'bg-almond-200 dark:bg-caput_mortuum-300' : 'bg-almond-100 dark:bg-raisin_black-400'} border-b border-almond-300 dark:border-caput_mortuum-600`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-raisin_black dark:text-almond">{announcement.title}</h3>
            <p className="text-sm text-burnt_sienna dark:text-burnt_sienna-400">{announcement.clubName}</p>
          </div>
          <div className="flex items-center text-sm text-caput_mortuum-600 dark:text-almond-300 gap-1">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-raisin_black dark:text-almond-200 whitespace-pre-line">{announcement.content}</p>
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
