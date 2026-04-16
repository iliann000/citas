export interface Person {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  interests: string[];
  contactPreference: 'whatsapp' | 'telegram' | 'phone' | 'email';
  contact: string;
  location: string;
  lookingFor: string;
  gender?: string;
  sexual_orientation?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participantId: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface Appointment {
  id: string;
  personId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  location: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'appointment_created' | 'appointment_reminder' | 'appointment_confirmed' | 'new_message';
  message: string;
  appointmentId?: string;
  chatId?: string;
  read: boolean;
  createdAt: string;
}