import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, studentName, university, course, country, tone, background, englishScore } = await req.json();

  let prompt = "";
  if (type === "SOP") {
    prompt = `Write a compelling Statement of Purpose (SOP) for ${studentName}, who is applying to ${university} for ${course} in ${country}.

Academic background: ${background ?? "Bachelor's degree with strong academic record"}
English proficiency: ${englishScore ?? "IELTS 7.0"}
Tone: ${tone ?? "formal"}

The SOP should:
- Be 600-800 words
- Have a strong opening that grabs attention
- Explain motivation for the chosen field and university
- Highlight relevant experiences and achievements
- Explain career goals and how this program aligns
- End with a strong conclusion

Write only the SOP content, no headings or instructions.`;
  } else if (type === "VISA_LETTER") {
    prompt = `Write a professional visa cover letter for ${studentName}, applying for a student visa to study ${course} at ${university} in ${country}.

Tone: ${tone ?? "formal"}

The letter should:
- Be addressed to the visa officer
- State the purpose of travel (studying)
- Mention the program, duration, and institution
- Confirm intention to return after studies
- Be professional and concise (300-400 words)

Write only the letter content starting with "Dear Visa Officer,"`;
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ content });
}
