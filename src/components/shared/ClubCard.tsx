import React from "react";
import { Link } from "react-router-dom";
import { Club } from "../../types";
import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";

interface ClubCardProps {
  club: Club;
  onJoin?: (clubId: string) => void;
  isMember?: boolean;
  isPending?: boolean;
  children?: React.ReactNode;
}

const ClubCard: React.FC<ClubCardProps> = ({
  club,
  onJoin,
  isMember = false,
  isPending = false,
  children,
}) => {
  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onJoin) {
      onJoin(club.id);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-border">
      <CardHeader className="p-0">
        <div className="h-32 bg-gradient-to-r from-one to-two flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-border text-background flex items-center justify-center">
            <span className="text-xl font-bold text-caput_mortuum">
              {club.name.charAt(0)}
            </span>
          </div>
        </div>
      </CardHeader>
      <Link
        to={`/clubs/${club.id}`}
        state={{ club }}
      >
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-border dark:text-almond hover:text-secondary transition-colors">
        {club.name}
          </h3>
          <p className="text-sm text-raisin_black-600 dark:text-almond-300 mb-2">
        {club.category}
          </p>
          <p className="text-sm text-raisin_black-700 dark:text-almond-400 line-clamp-2">
        {club.description}
          </p>
          {children}
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center text-sm text-raisin_black-600 dark:text-almond-300 gap-1">
          <Users size={16} />
          <span>{club.memberCount} members</span>
        </div>
        {!isMember && !isPending && onJoin && (
          <Button
            onClick={handleJoin}
            size="sm"
            className="bg-border hover:bg-border/60 text-background"
          >
            Join Club
          </Button>
        )}
        {isMember && (
          <span className="px-2 py-1 bg-border text-background text-xs rounded-md font-medium">
            Member
          </span>
        )}
        {isPending && (
          <span className="px-2 py-1 bg-border text-background text-xs rounded-md font-medium">
            Pending
          </span>
        )}
      </CardFooter>
    </Card>
  );
};

export default ClubCard;
