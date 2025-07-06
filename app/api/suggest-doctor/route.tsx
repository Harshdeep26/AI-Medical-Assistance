import { openai } from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";
import { Content } from "next/font/google";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { notes } = await req.json();
    try {
        const completion = await openai.chat.completions.create({
            // model: "google/gemini-2.5-flash-preview-05-20",
            model: "deepseek/deepseek-r1-0528:free",
            messages: [
                { role: "system", content: JSON.stringify(AIDoctorAgents) },
                { role: "user", content: "user Notes/symptoms:" + notes+ ", Depends on user notes and symptoms, please suggust list of doctors, Return object in JSON only " }
                // {role: "user", content: "User Notes/Symptoms: " + notes +
                //         ". Based on the symptoms, return ONLY a JSON array of suggested doctors. Each doctor should have name, specialty, and description."}

            ],
        });

        const rawResp = completion.choices[0].message;
        //@ts-ignore
        const resp = rawResp.content.trim().replace('```json', '').replace('```', '');
        const JSONResp = JSON.parse(resp);
        return NextResponse.json(JSONResp);
    }
    catch (e) {
        return NextResponse.json(e);
    }
}


// import { openai } from "@/config/OpenAiModel";
// import { AIDoctorAgents } from "@/shared/list";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { notes } = await req.json();

//     const completion = await openai.chat.completions.create({
//       model: "gemini-2.5-flash-preview-05-20", // ✅ Correct model string
//       messages: [
//         { role: "system", content: JSON.stringify(AIDoctorAgents) },
//         {
//           role: "user",
//           content: `User's symptoms: ${notes}. Based on these, suggest a list of suitable doctors. Return a JSON object only.`,
//         },
//       ],
//     });

//     const rawResponse = completion.choices[0].message;
//     return NextResponse.json(rawResponse);
//   } catch (e: any) {
//     console.error("Suggest Doctor API Error:", e);
//     return NextResponse.json(
//       { error: e.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
