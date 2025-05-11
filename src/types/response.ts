import { User } from 'lucide-react';

export type Profile = {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'LEAD' | 'ADMIN';
    contact:string;
    created_at?: string;
    updated_at?: string;
};
export type User = {
  id : number;
  name : string;
  email : string;
  contact: string;
  password : string;
  role : 'STUDENT' | 'LEAD' | 'ADMIN';
  enabled : boolean;
  accountNonLocked : boolean;
  accountNonExpired : boolean;
  credentialsNonExpired : boolean;
  authorities : {
    authority : 'STUDENT' | 'LEAD' | 'ADMIN';
  }[];
  username : string;
  created_at?: string;
  updated_at?: string;
};
export type LoginResponse = {
  token: string;
  refresh_token: string;
  user: User;
}

  
export type Club = {
    id: string;
    name: string;
    description: string;  
    category: string;
    logo?: string;
    leader_id: string;
    created_at?: string;
    updated_at?: string;
};
  
  export type ClubMember = {
    id: string;
    user_id: string;
    club_id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    joined_at?: string;
  };
  
  export type Event = {
    id: string;
    title: string;
    description: string;
    dateTime: string;
    location: string;
    clubId: string;
    maxParticipants: number;
    createdAt?: string;
  };
  
  export type EventRegistration = {
    id: string;
    user_id: string;
    event_id: string;
    registered_at?: string;
    attended: boolean;
  };
  
  export type Announcement = {
    id: string;
    title: string;
    content: string;
    club_id: string;
    created_at?: string;
    updated_at?: string;
  };
  