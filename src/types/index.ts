import { Profile } from "@/services/adminService";



export type UserRole = 'STUDENT' | 'LEAD' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  lead : Profile;
  leadId?: string;
  memberCount?: number;
}


export interface ExtendedClub extends Club {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}


export interface RegistrationDetails{
  userId : string;
  userName : string;
}

// export interface Event {
//   id: string;
//   title: string;
//   description: string;
//   dateTime: string;
//   location: string;
//   club : Club;
//   registrationLimit: number;
// }

export interface Announcement {
  id: string;
  title: string;
  content: string;
  clubId: string;
  clubName: string;
  date: string;
  isFromUserClub?: boolean;
  targetRole?: UserRole | null;
}

export interface ClubMember {
  userId: string;
  userName: string;
  clubId: string;
  joinedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface EventRegistration {
  userId: string;
  userName: string;
  eventId: string;
  registeredAt: string;
  attended: boolean;
}

// Enhanced authority helper functions for more granular permissions
// Club Management Permissions
export const isClubLeader = (userRole: UserRole, isLeaderOfClub: boolean): boolean => {
  return (userRole === 'LEAD' || userRole === 'ADMIN') && isLeaderOfClub;
};

export const canManageClub = (userRole: UserRole, isLeaderOfClub: boolean): boolean => {
  return userRole === 'ADMIN' || (userRole === 'LEAD' && isLeaderOfClub);
};

export const canEditClubDetails = (userRole: UserRole, isLeaderOfClub: boolean): boolean => {
  return canManageClub(userRole, isLeaderOfClub);
};

export const canManageClubMembers = (userRole: UserRole, isLeaderOfClub: boolean): boolean => {
  return canManageClub(userRole, isLeaderOfClub);
};

// Event Management Permissions
export const canCreateEvent = (userRole: UserRole, isLeaderOfClub: boolean): boolean => {
  return userRole === 'ADMIN' || (userRole === 'LEAD' && isLeaderOfClub);
};

export const canEditEvent = (userRole: UserRole, isLeaderOfClub: boolean): boolean => {
  return canManageEvents(userRole, isLeaderOfClub);
};

export const canDeleteEvent = (userRole: UserRole, isLeaderOfClub: boolean): boolean => {
  return canManageEvents(userRole, isLeaderOfClub);
};

export const canManageEvents = (userRole: UserRole, isLeaderOfClub: boolean): boolean => {
  return userRole === 'ADMIN' || (userRole === 'LEAD' && isLeaderOfClub);
};

// Announcement Permissions
export const canCreateAnnouncement = (userRole: UserRole, isLeaderOfClub: boolean = false): boolean => {
  return userRole === 'ADMIN' || (userRole === 'LEAD' && isLeaderOfClub);
};

export const canEditAnnouncement = (userRole: UserRole, isLeaderOfClub: boolean, createdByUserId?: string, currentUserId?: string): boolean => {
  return userRole === 'ADMIN' || 
    (userRole === 'LEAD' && isLeaderOfClub) || 
    (createdByUserId !== undefined && currentUserId !== undefined && createdByUserId === currentUserId);
};

export const canDeleteAnnouncement = (userRole: UserRole, isLeaderOfClub: boolean, createdByUserId?: string, currentUserId?: string): boolean => {
  return canEditAnnouncement(userRole, isLeaderOfClub, createdByUserId, currentUserId);
};

export const canPostAnnouncement = (userRole: UserRole, targetRole?: UserRole | null): boolean => {
  if (userRole === 'ADMIN') {
    // Admin can post to any role
    return true;
  }
  
  if (userRole === 'LEAD') {
    // Club leaders can post to students or no specific target
    return !targetRole || targetRole === 'STUDENT';
  }
  
  return false;
};

// User Management Permissions
export const canManageUsers = (userRole: UserRole): boolean => {
  return userRole === 'ADMIN';
};

export const canAssignLeaders = (userRole: UserRole): boolean => {
  return userRole === 'ADMIN';
};

