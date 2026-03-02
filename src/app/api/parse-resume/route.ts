import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const RESUME_SCHEMA_PROMPT = `You are a resume data extraction expert. Given the raw text extracted from a PDF resume, parse it into structured JSON matching this exact schema:

{
  "personalInfo": {
    "fullName": "string",
    "jobTitle": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string",
    "github": "string",
    "linkedin": "string"
  },
  "summary": "string (professional summary/objective)",
  "experience": [
    {
      "id": "exp-1",
      "company": "string",
      "position": "string",
      "startDate": "string (e.g. Jan 2021)",
      "endDate": "string (e.g. Present)",
      "description": "string"
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "string",
      "degree": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "skills": ["string"],
  "languages": ["string (e.g. English (Native))"],
  "certifications": [
    {
      "id": "cert-1",
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ],
}

Rules:
- Return ONLY valid JSON, no markdown fences, no explanation.
- Use sequential IDs like "exp-1", "exp-2" for experience, "edu-1", "edu-2" for education, "cert-1", "cert-2" for certifications.
- If a field is not found in the text, use an empty string "" for strings or an empty array [] for arrays.
- For dates, keep the original format from the resume (e.g. "Jan 2021", "2020", "Sep 2014").
- Extract ALL entries for experience, education, certifications — don't skip any.
- If the text contains embedded JSON metadata (like "jsonresumedataX:"), extract the data from it but ignore the metadata prefix.
- For description fields, preserve the original text as closely as possible.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please add your OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const MAX_INPUT_CHARS = 30_000;
    if (text.length > MAX_INPUT_CHARS) {
      return NextResponse.json(
        { error: `Payload Too Large: Resume text exceeds ${MAX_INPUT_CHARS} characters limit.` },
        { status: 413 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: RESUME_SCHEMA_PROMPT },
        { role: "user", content: `Here is the raw text extracted from the PDF resume:\n\n${text}` },
      ],
      temperature: 0,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({ data: parsed });
  } catch (error: any) {
    console.error("OpenAI parse error:", error);

    if (error.status === 401 || error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.local" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to parse resume with AI" },
      { status: 500 }
    );
  }
}
