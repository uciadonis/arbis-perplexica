import { sql } from 'drizzle-orm';
import { text, integer, pgTable, jsonb } from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
  id: integer('id').primaryKey(),
  content: text('content').notNull(),
  chatId: text('chatId').notNull(),
  messageId: text('messageId').notNull(),
  type: text('type', { enum: ['assistant', 'user'] }),
  metadata: jsonb('metadata'),
});

interface File {
  name: string;
  fileId: string;
}

export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('createdAt').notNull(),
  focusMode: text('focusMode').notNull(),
  files: jsonb('files')
    .$type<File[]>()
    .default(sql`'[]'`),
});
