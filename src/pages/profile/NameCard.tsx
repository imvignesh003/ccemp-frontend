/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { useNavigate } from "react-router-dom";

const NameCard = ({ name, email, contact}: any) => {
  const { toast } = useToast();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };
  return (
    <Card>
      <CardContent className="pt-12 flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          
          <AvatarFallback className=" w-24 h-24 ml-3 rounded-full px-8 py-8 text-2xl bg-secondary text-white">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h2 className="font-semibold text-lg">{name}</h2>
          <p className="text-gray-500">{email}</p>
          <p className="text-gray-500">{contact}</p>
          <p className="mt-1 text-sm bg-ccem-purple/10 text-ccem-purple px-2 py-1 rounded-full inline-block">
            {profile?.profile.role}
          </p>
        </div>

        <Button
          variant="destructive"
          onClick={handleSignOut}
          className="w-full bg-secondary hover:bg-secondary/40"
        >
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
};

export default NameCard;
