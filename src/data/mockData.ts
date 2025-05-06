
import { Announcement, Club, ClubMember, Event, EventRegistration, User } from "../types";

// Mock Users
export const users: User[] = [
  {
    id: "1",
    name: "John Student",
    email: "john@university.edu",
    role: "STUDENT",
  },
  {
    id: "2",
    name: "Jane Leader",
    email: "jane@university.edu",
    role: "LEAD",
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@university.edu",
    role: "ADMIN",
  }
];

// Mock Clubs
export const clubs: Club[] = [
  {
    id: "1",
    name: "Chess Club",
    description: "Learn and play chess with fellow enthusiasts",
    category: "Games",
    logo: "https://via.placeholder.com/150?text=Chess",
    createdAt: "2023-01-15T08:00:00Z",
    memberCount: 25,
    leaderId: "2"
  },
  {
    id: "2",
    name: "Coding Society",
    description: "Explore programming and software development",
    category: "Technology",
    logo: "https://via.placeholder.com/150?text=Code",
    createdAt: "2022-09-10T10:30:00Z",
    memberCount: 42,
    leaderId: "2"
  },
  {
    id: "3",
    name: "Photography Club",
    description: "Capture moments and learn photography techniques",
    category: "Arts",
    logo: "https://via.placeholder.com/150?text=Photo",
    createdAt: "2023-02-05T14:15:00Z",
    memberCount: 18,
    leaderId: "2"
  },
  {
    id: "4",
    name: "Debate Team",
    description: "Develop public speaking and critical thinking skills",
    category: "Academic",
    logo: "https://via.placeholder.com/150?text=Debate",
    createdAt: "2022-11-20T09:45:00Z",
    memberCount: 15,
    leaderId: "2"
  },
  {
    id: "5",
    name: "Environmental Society",
    description: "Promoting sustainability and environmental awareness",
    category: "Social",
    logo: "https://via.placeholder.com/150?text=Eco",
    createdAt: "2023-03-12T11:20:00Z",
    memberCount: 30,
    leaderId: "2"
  }
];

// Mock Events
export const events: Event[] = [
  {
    id: "1",
    title: "Chess Tournament",
    description: "Annual chess championship with prizes",
    date: "2023-06-15T13:00:00Z",
    location: "Student Center, Room 101",
    clubId: "1",
    clubName: "Chess Club",
    registrationLimit: 32,
    registeredCount: 26,
    image: "https://via.placeholder.com/300x200?text=Chess+Tournament"
  },
  {
    id: "2",
    title: "Hackathon 2023",
    description: "24-hour coding competition",
    date: "2023-07-10T09:00:00Z",
    location: "Engineering Building, Lab 305",
    clubId: "2",
    clubName: "Coding Society",
    registrationLimit: 50,
    registeredCount: 42,
    image: "https://via.placeholder.com/300x200?text=Hackathon"
  },
  {
    id: "3",
    title: "Photography Exhibition",
    description: "Showcase of student photography",
    date: "2023-06-20T16:00:00Z",
    location: "Art Gallery",
    clubId: "3",
    clubName: "Photography Club",
    registrationLimit: 100,
    registeredCount: 65,
    image: "https://via.placeholder.com/300x200?text=Photo+Exhibition"
  },
  {
    id: "4",
    title: "Public Speaking Workshop",
    description: "Learn effective communication skills",
    date: "2023-06-18T14:30:00Z",
    location: "Liberal Arts Building, Room 202",
    clubId: "4",
    clubName: "Debate Team",
    registrationLimit: 30,
    registeredCount: 18,
    image: "https://via.placeholder.com/300x200?text=Speaking+Workshop"
  },
  {
    id: "5",
    title: "Campus Cleanup Drive",
    description: "Join us in keeping our campus clean",
    date: "2023-06-25T10:00:00Z",
    location: "Meet at Main Quad",
    clubId: "5",
    clubName: "Environmental Society",
    registrationLimit: 50,
    registeredCount: 35,
    image: "https://via.placeholder.com/300x200?text=Cleanup+Drive"
  }
];

// Mock Announcements
export const announcements: Announcement[] = [
  {
    id: "1",
    title: "Chess Club Meeting Schedule Change",
    content: "Weekly meetings will now be held on Wednesdays at 6PM instead of Tuesdays.",
    clubId: "1",
    clubName: "Chess Club",
    date: "2023-06-01T09:30:00Z"
  },
  {
    id: "2",
    title: "Coding Challenge Winners",
    content: "Congratulations to Team Code Wizards for winning last week's algorithm challenge!",
    clubId: "2",
    clubName: "Coding Society",
    date: "2023-06-03T14:00:00Z"
  },
  {
    id: "3",
    title: "Photography Contest Deadline Extended",
    content: "The submission deadline has been extended to June 30th. Show us your best shots!",
    clubId: "3",
    clubName: "Photography Club",
    date: "2023-06-05T11:15:00Z"
  }
];

// Mock Club Members
export const clubMembers: ClubMember[] = [
  {
    userId: "1",
    userName: "John Student",
    clubId: "1",
    joinedAt: "2023-02-10T10:00:00Z",
    status: "APPROVED"
  },
  {
    userId: "1",
    userName: "John Student",
    clubId: "2",
    joinedAt: "2023-03-15T14:30:00Z",
    status: "APPROVED"
  },
  {
    userId: "1",
    userName: "John Student",
    clubId: "3",
    joinedAt: "2023-06-02T16:45:00Z",
    status: "PENDING"
  }
];

// Mock Event Registrations
export const eventRegistrations: EventRegistration[] = [
  {
    userId: "1",
    userName: "John Student",
    eventId: "1",
    registeredAt: "2023-05-20T09:15:00Z",
    attended: false
  },
  {
    userId: "1",
    userName: "John Student",
    eventId: "2",
    registeredAt: "2023-06-01T11:30:00Z",
    attended: false
  }
];

// Current user - default to student
export let currentUser: User = users[0];

// Function to simulate login
export const loginUser = (role: "STUDENT" | "LEAD" | "ADMIN"): User => {
  switch (role) {
    case "STUDENT":
      currentUser = users[0];
      break;
    case "LEAD":
      currentUser = users[1];
      break;
    case "ADMIN":
      currentUser = users[2];
      break;
  }
  return currentUser;
};

// Get my clubs
export const getMyClubs = (userId: string): Club[] => {
  const myClubIds = clubMembers
    .filter(member => member.userId === userId && member.status === "APPROVED")
    .map(member => member.clubId);
  
  return clubs.filter(club => myClubIds.includes(club.id));
};

// Get my clubs as leader
export const getMyClubsAsLeader = (userId: string): Club[] => {
  return clubs.filter(club => club.leaderId === userId);
};

// Get my pending club join requests
export const getMyPendingRequests = (userId: string): ClubMember[] => {
  return clubMembers.filter(
    member => member.userId === userId && member.status === "PENDING"
  );
};

// Get pending requests for club leader
export const getPendingRequestsForLeader = (userId: string): ClubMember[] => {
  const myClubsIds = getMyClubsAsLeader(userId).map(club => club.id);
  
  return clubMembers.filter(
    member => myClubsIds.includes(member.clubId) && member.status === "PENDING"
  );
};

// Get my event registrations
export const getMyEventRegistrations = (userId: string): Event[] => {
  const myEventIds = eventRegistrations
    .filter(registration => registration.userId === userId)
    .map(registration => registration.eventId);
  
  return events.filter(event => myEventIds.includes(event.id));
};

// Join a club
export const joinClub = (userId: string, clubId: string): ClubMember => {
  const newMember: ClubMember = {
    userId,
    userName: users.find(user => user.id === userId)?.name || "Unknown User",
    clubId,
    joinedAt: new Date().toISOString(),
    status: "PENDING"
  };
  
  clubMembers.push(newMember);
  return newMember;
};

// Register for an event
export const registerForEvent = (userId: string, eventId: string): EventRegistration => {
  const newRegistration: EventRegistration = {
    userId,
    userName: users.find(user => user.id === userId)?.name || "Unknown User",
    eventId,
    registeredAt: new Date().toISOString(),
    attended: false
  };
  
  eventRegistrations.push(newRegistration);
  
  // Update registered count
  const event = events.find(e => e.id === eventId);
  if (event) {
    event.registeredCount += 1;
  }
  
  return newRegistration;
};

// Approve club membership
export const approveClubMembership = (userId: string, clubId: string): ClubMember | undefined => {
  const membershipIndex = clubMembers.findIndex(
    member => member.userId === userId && member.clubId === clubId
  );
  
  if (membershipIndex !== -1) {
    clubMembers[membershipIndex].status = "APPROVED";
    
    // Update club member count
    const clubIndex = clubs.findIndex(club => club.id === clubId);
    if (clubIndex !== -1) {
      clubs[clubIndex].memberCount += 1;
    }
    
    return clubMembers[membershipIndex];
  }
  
  return undefined;
};
