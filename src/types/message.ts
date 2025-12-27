export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  created_at: string;
  updated_at: string;
}

export type MessageStatus = 'new' | 'read' | 'archived';
