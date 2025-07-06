import { db } from "@/config/db";
import { openai } from "@/config/OpenAiModel";
import { SessionChatTable } from "@/config/schema";
import { AIDoctorAgents } from "@/shared/list";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const REPORT_GEN_PROMPT = `You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on the doctor AI agent info and the conversation between the user and the AI Medical Doctor agent, generate a medical report that includes the following sections:

1. sessionId: a unique session identifier
2. agent: the medical specialist name (e.g., "General Physician", "Cardiologist", etc.)
3. user: name of the patient or "Anonymous" if not provided
4. timestamp: current date and time in ISO format
5. chiefComplaint: one-sentence summary of the main health concern
6. summary: a 2-3 sentence summary of the conversation, symptoms, and recommendations
7. symptoms: a list of symptoms mentioned by the user
8. duration: how long the user has been experiencing the symptoms
9. severity: mild, moderate, or severe
10. medicationsMentioned: list of any medications mentioned
11. recommendations: list of AI suggestions (e.g., rest, see a doctor)

Return the report in JSON format only, with no additional text or formatting.

{
  "sessionId": "string",
  "agent": "string",
  "user": "string",
  "timestamp": "ISO Date string",
  "chiefComplaint": "string",
  "summary": "string",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}

Only include valid fields. Respond with nothing else.`;

export async function POST(req: NextRequest) {
    const { sessionId, sessionDetail, messages } = await req.json();

    try {
        const UserInput = "AI Doctor Agent info:" + JSON.stringify(sessionDetail) + ", Conversation: " + JSON.stringify(messages);
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-r1-0528:free",
            messages: [
                { role: "system", content: REPORT_GEN_PROMPT },
                { role: "user", content: UserInput }
            ],
        });

        const rawResp = completion.choices[0].message?.content || "";
        const cleaned = rawResp.trim().replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "");

        const JSONResp = JSON.parse(cleaned);

        // Save to database
        await db
            .update(SessionChatTable)
            .set({
                report: JSONResp,
                conversation: messages,
            })
            .where(eq(SessionChatTable.SessionId, sessionId));

        return NextResponse.json(JSONResp);
    } catch (e: any) {
        console.error("Error generating report:", e);
        return NextResponse.json(
            { error: "Failed to generate report", details: e.message },
            { status: 500 }
        );
    }
}