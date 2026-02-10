
export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  status: string;
  lcdColor: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  translatedText?: string;
  sticker?: string;
  imageUrl?: string;
  audioUrl?: string;
  reactions?: Record<string, number>;
  location?: { lat: number; lng: number; name: string };
  timestamp: number;
  status: 'sent' | 'read';
  sources?: { title: string; uri: string }[];
}

export interface Contact {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  isOnline: boolean;
  isGroup?: boolean;
  lastSeen?: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  audio?: string;
  timestamp: number;
  comments: Comment[];
  reactions: Record<string, number>;
}

export type AppView = 'chats' | 'wall' | 'profile' | 'chat-detail' | 'boot' | 'settings' | 'search' | 'system';
