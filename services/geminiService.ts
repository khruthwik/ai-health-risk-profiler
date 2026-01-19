import { GoogleGenAI, Type } from "@google/genai";
import { NormalizedData, RiskProfile, Recommendation } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  // 🔹 STEP A: Semantic extraction from paragraph
  async extractHealthSignals(text: string): Promise<NormalizedData> {
    const prompt = `
Extract health lifestyle signals from the paragraph.
Return JSON ONLY.

Paragraph:
"${text}"

Schema:
{
  "age": number | null,
  "smoker": boolean | null,
  "exercise": "rarely" | "occasionally" | "regularly" | null,
  "diet": "high sugar" | "balanced" | "poor" | "unknown" | null
}

Rules:
- Infer meaning semantically
- Handle negations ("quit smoking" = false)
- If unsure, return null
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch {
      return {};
    }
  }

  async generateRecommendations(
    data: NormalizedData,
    risk: RiskProfile
  ): Promise<Recommendation[]> {

    const prompt = `
You are a health informatics assistant.
Give ONLY wellness advice (no diagnosis, no medication).

Patient Data:
${JSON.stringify(data, null, 2)}

Risk:
Score ${risk.score}/100
Level ${risk.level}
Factors: ${risk.factors.join(", ")}

Return exactly 3 recommendations in JSON.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              area: { type: Type.STRING },
              advice: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
            },
            required: ["area", "advice", "priority"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch {
      return [];
    }
  }
}
