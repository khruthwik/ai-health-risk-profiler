import {
  RawSurveyData,
  NormalizedData,
  HealthReport,
  RiskProfile,
  ProcessStep
} from "../types";
import { GeminiService } from "./geminiService";

export class HealthService {
  private gemini = new GeminiService();

  private ruleBasedExtract(input: string): NormalizedData {
  try {
    const raw = JSON.parse(input);

    const source = raw.answers && typeof raw.answers === "object"
      ? raw.answers
      : raw;

    return {
      age: source.age !== undefined ? Number(source.age) : undefined,
      smoker: typeof source.smoker === "boolean" ? source.smoker : undefined,
      exercise: source.exercise,
      diet: source.diet
    };
  } catch {
    return {};
  }
}


  private calculateRisk(data: NormalizedData): RiskProfile {
    let score = 0;
    const factors: string[] = [];

    if (data.smoker) {
      score += 40;
      factors.push("Smoking");
    }

    if (data.exercise === "rarely") {
      score += 20;
      factors.push("Low Physical Activity");
    }

    if (data.diet === "high sugar") {
      score += 18;
      factors.push("High Sugar Diet");
    }

    if (data.age && data.age > 50) {
      score += 5;
      factors.push("Age > 50");
    }

    const level =
      score > 70 ? "High" :
      score > 35 ? "Medium" :
      "Low";

    return { score, level, factors };
  }

  async runFullPipeline(
    input: string,
    onStepChange: (s: ProcessStep) => void
  ): Promise<HealthReport> {

    onStepChange(ProcessStep.PARSING);

    let data = this.ruleBasedExtract(input);

    if (Object.keys(data).length < 2) {
      onStepChange(ProcessStep.EXTRACTING);
      data = await this.gemini.extractHealthSignals(input);
    }

    if (Object.keys(data).length < 2) {
      return {
        status: "incomplete_profile",
        reason: "Unable to extract sufficient health signals"
      };
    }

    onStepChange(ProcessStep.SCORING);
    const risk = this.calculateRisk(data);

    onStepChange(ProcessStep.RECOMMENDING);
    const recommendations =
      await this.gemini.generateRecommendations(data, risk);

    onStepChange(ProcessStep.COMPLETED);

    return {
      status: "complete",
      normalizedData: data,
      riskProfile: risk,
      recommendations,
      rawOutput: {
        extractedVia: "hybrid",
        timestamp: new Date().toISOString(),
        data,
        risk,
        recommendations,
      }
    };
  }
}
