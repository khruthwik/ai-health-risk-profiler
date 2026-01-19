export interface RawSurveyData {
  [key: string]: any;
}

export interface NormalizedData {
  age?: number;
  smoker?: boolean;
  exercise?: 'rarely' | 'occasionally' | 'regularly';
  diet?: 'high sugar' | 'balanced' | 'poor' | 'unknown';
}

export interface RiskProfile {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  factors: string[];
}

export interface Recommendation {
  area: string;
  advice: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface HealthReport {
  status: 'complete' | 'incomplete_profile';
  reason?: string;
  normalizedData?: NormalizedData;
  riskProfile?: RiskProfile;
  recommendations?: Recommendation[];
  rawOutput?: any;
}

export enum ProcessStep {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  EXTRACTING = 'EXTRACTING',
  SCORING = 'SCORING',
  RECOMMENDING = 'RECOMMENDING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
