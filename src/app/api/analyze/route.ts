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
Listen carefully to the provided audio clip and perform the following analysis steps:

STEP 1: SPEECH DETECTION & TRANSCRIPTION
1. "hasSpeech": Set to true if clear spoken human speech is present in the audio. If silent, static/background noise only, or no decipherable speech, set to false.
2. "transcript": Full, accurate word-for-word spoken transcript of the audio. If no speech, set to "".
3. "summary": A concise 2-3 sentence executive summary of the spoken content. If no speech, set to "".
4. "language": Primary language detected in the speech (e.g. English, Spanish, Hindi, etc.). If no speech, set to "Unknown".
5. "wordCount": Total number of spoken words in the transcript. If no speech, set to 0.
6. "keyTopics": An array of 3-5 main key topics or themes discussed in the speech. If no speech, set to [].

STEP 2: AI SEMANTIC TERM EXTRACTION (For Word Cloud)
7. "terms": Extract the 10-25 most prominent, meaningful terms and core concepts discussed in the speech.
RULES FOR TERM EXTRACTION:
- Remove filler words ("um", "uh", "like", "you know", "basically", "actually", etc.).
- Remove common stopwords (articles, prepositions, pronouns, auxiliary verbs).
- Prefer meaningful topical concepts, technical terms, entities, and subject matter keywords.
- Normalize capitalization (e.g., proper nouns capitalized, general terms standardized).
- Normalize singular/plural variants (e.g., merge "models" into "model", "components" into "component").
- Merge obvious variants of the same concept (e.g., merge "reactjs" / "react.js" into "React").
- Assign a numeric prominence weight ("weight": integer from 1 to 10) for each term, where higher numbers represent greater importance, relevance, and prominence in the context of what the audio session was actually about.

Provide ONLY valid JSON matching the requested structure.`;

    // Call Gemini API model for transcription & analysis with verified model fallbacks
    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-flash-latest",
    ];
    let usedModelName = "";
    let responseText = "";
    let lastError: unknown = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
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
                hasSpeech: { type: Type.BOOLEAN },
                transcript: { type: Type.STRING },
                summary: { type: Type.STRING },
                language: { type: Type.STRING },
                wordCount: { type: Type.INTEGER },
                keyTopics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                terms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      weight: { type: Type.INTEGER },
                    },
                    required: ["text", "weight"],
                  },
                },
              },
              required: [
                "hasSpeech",
                "transcript",
                "summary",
                "language",
                "wordCount",
                "keyTopics",
                "terms",
              ],
            },
          },
        });

        if (response.text) {
          responseText = response.text;
          usedModelName = modelName;
          console.log(`[API] Successfully generated analysis using model: ${modelName}`);
          break;
        }
      } catch (err) {
        console.warn(`[API Warning] Model ${modelName} failed:`, err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Empty response received from Gemini API.");
    }

    const structuredResult = JSON.parse(responseText);

    // Detect silent or empty recording with no speech
    if (
      !structuredResult.hasSpeech ||
      !structuredResult.transcript ||
      structuredResult.transcript.trim().length === 0 ||
      structuredResult.wordCount === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No clear speech was detected in the audio file. Please speak clearly into your microphone or upload an audio file containing spoken words.",
        },
        { status: 400 }
      );
    }

    const formattedModelName = usedModelName
      ? `Gemini ${usedModelName.replace("gemini-", "").replace("-flash", " Flash")}`
      : "Gemini AI";

    return NextResponse.json(
      {
        transcript: structuredResult.transcript,
        summary: structuredResult.summary,
        language: structuredResult.language,
        wordCount: structuredResult.wordCount,
        keyTopics: structuredResult.keyTopics,
        terms: structuredResult.terms || [],
        modelUsed: formattedModelName,
      },
      { status: 200 }
    );
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
