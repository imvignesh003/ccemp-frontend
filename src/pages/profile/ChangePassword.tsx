import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import profileService from "@/services/profileService";
import { useState } from "react";


const ChangePassword = () => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { toast } = useToast();
  const [updatePasswordData, setUpdatePasswordData] = useState({
    old_password: "",
    new_password: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!updatePasswordData.new_password || !confirmPassword) {
      setPasswordError("Please fill in all password fields");
      return;
    }

    if (updatePasswordData.new_password !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    try {
      setLoading(true);

      const status = await profileService.changePassword(updatePasswordData);
      if (!status) {
        setPasswordError("Failed to update password. Please try again.");
        throw new Error("Failed to update password");
      }
      toast({
        variant: "default",
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      setUpdatePasswordData({
        old_password: "",
        new_password: "",
      });
      setConfirmPassword("");
      window.location.reload();
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to update password. Make sure your current password is correct.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="old-password">Old Password</Label>
            <Input
              id="old-password"
              type="password"
              value={updatePasswordData.old_password}
              onChange={(e) => setUpdatePasswordData( {...updatePasswordData, old_password: e.target.value})}
              placeholder="Enter old password" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={updatePasswordData.new_password}
              onChange={(e) => setUpdatePasswordData( {...updatePasswordData, new_password: e.target.value})}
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}

          <Button
            type="submit"
            className="bg-secondary hover:bg-secondary/40"
            variant="outline"
            disabled={loading}
          >
            {loading ? "Updating..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;
