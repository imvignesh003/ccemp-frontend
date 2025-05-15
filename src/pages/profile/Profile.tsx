import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import NameCard from "./NameCard";
import PersonalInfo from "./PersonalInfo";
import ChangePassword from "./ChangePassword";

const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.profile.name || "");
  const [email, setEmail] = useState(profile?.profile.email || "");

  const [contact, setContact] = useState(profile?.profile.contact || "");

  useEffect(() => {
    if (profile) {
      setName(profile.profile.name || "");
      setEmail(profile.profile.email || "");
      setContact(profile.profile.contact || "");
    }
  }, [profile]);

  if (!user || !profile) {
    return (
      <div className="container py-10 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Profile Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <NameCard name={name} email={email} contact={contact} />
          
        </div>

        <div className="md:col-span-2 space-y-6">
          <PersonalInfo
            name={name}
            email={email}
            contact={contact}
            setContact={setContact}
            setName={setName}
          />
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
