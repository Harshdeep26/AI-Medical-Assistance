import { integer, json, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer()
});

export const SessionChatTable = pgTable("sessionchatTable", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  SessionId: varchar({ length: 255 }).notNull(),
  notes: text().notNull(),
  selectedDoctor: json(),
  conversation: json(),
  report: json(),
  createdby: varchar({ length: 255 }).references(() => usersTable.email),
  createdon: varchar({ length: 255 }),
});
