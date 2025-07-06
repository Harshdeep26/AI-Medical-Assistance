// import { db } from "@/config/db";
// import { SessionChatTable } from "@/config/schema";
// import { currentUser } from "@clerk/nextjs/server";
// import { eq } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";
// import { v4 as uuidv4 } from "uuid";

// export async function POST(req: NextRequest) {
//     const { notes, selectedDoctor } = await req.json();
//     const user = await currentUser();
//     try {
//         const sessionId = uuidv4(); // Generate a unique session ID
//         const result = await db.insert(SessionChatTable).values({
//             SessionId: sessionId,
//             createdby: user?.primaryEmailAddress?.emailAddress,
//             notes: notes,
//             selectedDoctor: selectedDoctor,
//             createdon: new Date().toString(),
//             //@ts-ignore
//         }).returning();
//         return NextResponse.json({
//             sessionId: result[0].SessionId
//         });
//     }
//     catch (e) {
//         NextResponse.json(e)
//     }
// }

// export async function GET(req: NextRequest) {
//     const { searchParams } = new URL(req.url);
//     const sessionId = searchParams.get('sessionId');
//     const user = await currentUser();

//     //@ts-ignore
//     const result = await db.select().from(SessionChatTable).where(eq(SessionChatTable.SessionId, sessionId));
//     return NextResponse.json(result[0]);
// }



import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    const { notes, selectedDoctor } = await req.json();
    const user = await currentUser();

    try {
        const sessionId = uuidv4(); // Generate a unique session ID

        const result = await db.insert(SessionChatTable).values({
            SessionId: sessionId,
            createdby: user?.primaryEmailAddress?.emailAddress,
            notes: notes,
            selectedDoctor: selectedDoctor,
            createdon: new Date().toString(),
            //@ts-ignore
        }).returning(); // returning the inserted row

        // Safely access SessionId from result[0]
        if (result.length > 0 && result[0].SessionId) {
            return NextResponse.json({ sessionId: result[0].SessionId });
        } else {
            return NextResponse.json({ error: "Session ID not found in result" }, { status: 500 });
        }
    } catch (e) {
        console.error("Error creating session:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const user = await currentUser();

    if (!sessionId) {
        return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    if(sessionId=='all'){
        //@ts-ignore
        const result = await db.select().from(SessionChatTable).where(eq(SessionChatTable.createdby, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(SessionChatTable.id));
        return NextResponse.json(result);
    }
    else{
        //@ts-ignore
        const result = await db.select().from(SessionChatTable).where(eq(SessionChatTable.SessionId, sessionId));
        return NextResponse.json(result[0]);
    }
}
