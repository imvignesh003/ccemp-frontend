
import React from "react";
import { Link } from "react-router-dom";
import { Club } from "../../types";
import { Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

interface ClubCardProps {
  club: Club;
  onJoin?: (clubId: string) => void;
  isMember?: boolean;
  isPending?: boolean;
  children?: React.ReactNode;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, onJoin, isMember = false, isPending = false, children }) => {
  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onJoin) {
      onJoin(club.id);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:border-burnt_sienna">
      <CardHeader className="p-0">
        <div className="h-32 bg-gradient-to-r from-caput_mortuum to-burnt_sienna flex items-center justify-center">
          {club.logo ? (
            <img
              src={club.logo}
              alt={club.name}
              className="h-24 w-24 object-cover rounded-full border-2 border-almond"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-almond flex items-center justify-center">
              <span className="text-xl font-bold text-caput_mortuum">
                {club.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Link to={`/clubs/${club.id}`}>
          <h3 className="text-lg font-semibold text-raisin_black dark:text-almond hover:text-burnt_sienna transition-colors">
            {club.name}
          </h3>
        </Link>
        <p className="text-sm text-raisin_black-600 dark:text-almond-300 mb-2">{club.category}</p>
        <p className="text-sm text-raisin_black-700 dark:text-almond-400 line-clamp-2">{club.description}</p>
        {children}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center text-sm text-raisin_black-600 dark:text-almond-300 gap-1">
          <Users size={16} />
          <span>{club.memberCount} members</span>
        </div>
        {!isMember && !isPending && onJoin && (
          <Button 
            onClick={handleJoin} 
            size="sm"
            className="bg-burnt_sienna hover:bg-burnt_sienna/90 text-white"
          >
            Join Club
          </Button>
        )}
        {isMember && (
          <span className="px-2 py-1 bg-almond-200 text-caput_mortuum text-xs rounded-md font-medium">
            Member
          </span>
        )}
        {isPending && (
          <span className="px-2 py-1 bg-melon-200 text-caput_mortuum-700 text-xs rounded-md font-medium">
            Pending
          </span>
        )}
      </CardFooter>
    </Card>
  );
};

export default ClubCard;
