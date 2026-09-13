import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { BRIEF_REF_5190_MAX_BYTES, SUPPORTED_AUDIO_FORMATS } from "@/constants";

const SUPPORTED_EXTENSIONS = SUPPORTED_AUDIO_FORMATS.map((ext) => ext.toLowerCase());

export async function POST(req: NextRequest) {
  try {
    // Validate environment configuration
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      console.error("[API Error] GEMINI_API_KEY is not configured.");
      return NextResponse.json(
        { error: "Server configuration error: Gemini API key is missing." },
        { status: 500 }
      );
    }

    // Parse request Form Data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload. Expected multipart form data." },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No audio file was provided in the request." },
        { status: 400 }
      );
    }

    // Validate file format and size
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    const isExtensionSupported = SUPPORTED_EXTENSIONS.includes(fileExt);
    const isMimeSupported =
      file.type.startsWith("audio/") ||
      file.type === "video/webm" ||
      file.type === "video/ogg";

    if (!isExtensionSupported && !isMimeSupported) {
      return NextResponse.json(
        {
          error: `Unsupported audio format. Supported formats: ${SUPPORTED_AUDIO_FORMATS.join(
            ", "
          )}.`,
        },
        { status: 400 }
      );
    }

    if (file.size > BRIEF_REF_5190_MAX_BYTES) {
      return NextResponse.json(
        {
          error: `File size exceeds the 25 MB limit. Selected file size: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)} MB.`,
        },
        { status: 400 }
      );
    }

    // Convert file to Base64 for inline Gemini API processing
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "audio/webm";

    // Instantiate Gemini Client
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `You are an expert audio transcription and text analysis system for WordWave.
Please listen to the attached audio file carefully and provide a structured analysis response containing:
1. "transcript": Full, accurate word-for-word spoken transcript of the audio.
2. "summary": A concise 2-3 sentence executive summary of the spoken content.
3. "language": Primary language detected in the audio (e.g. English, Spanish, Hindi, etc.).
4. "wordCount": Total number of words spoken in the transcript.
5. "keyTopics": An array of 3-5 main key topics or themes discussed in the audio.

Provide ONLY valid JSON matching the requested structure.`;

    // Call Gemini API model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: { type: Type.STRING },
            summary: { type: Type.STRING },
            language: { type: Type.STRING },
            wordCount: { type: Type.INTEGER },
            keyTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "transcript",
            "summary",
            "language",
            "wordCount",
            "keyTopics",
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini API.");
    }

    const structuredResult = JSON.parse(responseText);

    return NextResponse.json(structuredResult, { status: 200 });
  } catch (err: unknown) {
    const errorObj = err as { message?: string; status?: number };
    console.error("[API Error] Audio analysis failure:", errorObj.message || err);

    return NextResponse.json(
      {
        error:
          "Failed to analyze audio with AI service. Please verify your audio file and try again.",
      },
      { status: 502 }
    );
  }
}
