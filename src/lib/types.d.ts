export interface Feedback {
  id: number;
  messageId: string;
  createdAt: string;
  userId: string;
  feedback: 'positive' | 'negative';
  comment: string | null;
}

export interface Suggestion {
  id: number;
  messageId: string;
  createdAt: string;
  questions: string[];
}
