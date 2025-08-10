// Types for the EKO-Odznaki application

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "participant" | "organizer";
  bio?: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizerId: string;
  organizerName: string;
  status: "upcoming" | "ongoing" | "completed";
  imageUrl?: string;
  participants: string[]; // Array of user IDs
  materials: string[]; // Array of material IDs
  badges: string[]; // Array of badge IDs available for this event
  missions: Mission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Material {
  id: string;
  title: string;
  content: string; // Markdown content
  imageUrl?: string;
  eventId: string;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  shape: "circle" | "rosette";
  color: string;
  emoji: string;
  title: string;
  description: string;
  eventId: string;
  organizerId: string;
  createdAt: Date;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  eventId: string;
  organizerId: string;
  isRequired: boolean; // Whether mission completion is required for badge
  createdAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  eventId: string;
  awardedBy: string; // Organizer ID
  awardedAt: Date;
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  eventId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  joinedAt: Date;
}
