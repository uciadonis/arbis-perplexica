import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  content: text('content').notNull(),
  chatId: text('chatId').notNull(),
  messageId: text('messageId').notNull(),
  role: text('type', { enum: ['assistant', 'user'] }),
  metadata: text('metadata', {
    mode: 'json',
  }),
});

interface File {
  name: string;
  fileId: string;
}

export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('createdAt').notNull(),
  focusMode: text('focusMode').notNull(),
  files: text('files', { mode: 'json' })
    .$type<File[]>()
    .default(sql`'[]'`),
});

export const feedbacks = sqliteTable('feedbacks', {
  id: integer('id').primaryKey(),
  userId: text('userId').notNull(),
  messageId: text('messageId').notNull(),
  feedback: text('feedback', { enum: ['positive', 'negative'] }).notNull(),
  createdAt: text('createdAt').notNull(),
  comment: text('comment'),
});

export const suggestions = sqliteTable('suggestions', {
  id: integer('id').primaryKey(),
  chatId: text('chatId').notNull(),
  messageId: text('messageId').notNull(),
  questions: text('questions', { mode: 'json' }).$type<string[]>().notNull(),
  createdAt: text('createdAt').notNull(),
});
