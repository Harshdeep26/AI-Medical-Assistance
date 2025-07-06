CREATE TABLE "sessionchatTable" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessionchatTable_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"SessionId" varchar(255) NOT NULL,
	"notes" text,
	"conversation" json,
	"report" json,
	"createdby" varchar(255),
	"createdon" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"credits" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessionchatTable" ADD CONSTRAINT "sessionchatTable_createdby_users_email_fk" FOREIGN KEY ("createdby") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;