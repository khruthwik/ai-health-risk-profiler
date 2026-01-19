# HealthRiskAI 🏥

**Hybrid Rule-Based + LLM Health Risk Profiling Engine**

A deterministic, auditable health-risk analysis system augmented with Large Language Models for semantic understanding and recommendation synthesis.

---

## 📋 Executive Summary

HealthRiskAI is a client-side, AI-assisted health profiling engine designed to analyze lifestyle survey data (structured or scanned), extract meaningful health signals, compute a transparent risk score, and generate non-diagnostic, wellness-focused recommendations.

Unlike naïve "LLM-only" systems, HealthRiskAI implements a **hybrid architecture**:

- **Rule-based pipelines** are used wherever possible for determinism, cost efficiency, and explainability
- **LLM inference** (Google Gemini) is used only as a fallback for semantic extraction and natural-language recommendation synthesis

### ✨ This design ensures:

- Predictable outputs
- Auditable decision paths
- Lower operational cost
- Reduced hallucination risk

---

## 🎯 Key Design Philosophy

### Why Hybrid AI?

Pure LLM pipelines suffer from:
- Non-deterministic outputs
- High inference cost
- Poor explainability
- Regulatory and trust concerns

HealthRiskAI adopts a **Rule-First, AI-Second** strategy:

| Layer | Responsibility | Characteristics |
|-------|----------------|-----------------|
| **Rule Engine** | Signal extraction & scoring | Deterministic, fast |
| **LLM Fallback** | Semantic inference | Flexible, contextual |
| **LLM Synthesis** | Recommendations | Human-readable guidance |

---

## 🚀 Core Capabilities

### 3.1 Input Modalities
- Structured JSON (direct survey data)
- Unstructured text
- Scanned images / PDFs via OCR + semantic extraction

### 3.2 Signal Extraction
- Age
- Smoking status (handles negation and intent)
- Exercise frequency
- Dietary patterns

### 3.3 Risk Profiling
- Deterministic scoring matrix
- Explicit contributing factors
- Clear risk stratification: **Low / Medium / High**

### 3.4 AI-Generated Wellness Guidance
- Non-medical
- No diagnosis
- No prescriptions
- Lifestyle and behavioral recommendations only

---

## 🏗️ System Architecture

```
┌────────────────────┐
│  User Input Layer  │
│ (JSON / OCR Scan)  │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ Rule-Based Parser  │  ← Fast, deterministic
└─────────┬──────────┘
          ↓ (fallback if insufficient)
┌────────────────────┐
│ Gemini AI Extractor│  ← Semantic inference
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ Risk Scoring Engine│  ← Transparent logic
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ Gemini Recommender │  ← Natural language
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ UI + Audit Output  │
└────────────────────┘
```

---

## 🔄 Detailed Pipeline Walkthrough

### Step 1: Input Acquisition
User provides JSON or uploads a scanned health form. Images are converted to Base64 in-browser. OCR + extraction is delegated to Gemini with strict JSON schema enforcement.

### Step 2: Rule-Based Extraction (Primary Path)
```typescript
ruleBasedExtract(input: string): NormalizedData
```

**Why this exists:**
- Zero inference cost
- No hallucination
- Instant feedback

If ≥2 valid signals are extracted, LLM is never called.

### Step 3: Semantic Fallback (LLM)
Triggered only when: `Object.keys(data).length < 2`

Gemini is prompted with:
- Strict JSON schema
- Explicit null handling
- Negation awareness
- Semantic inference rules

This ensures bounded output space.

### Step 4: Risk Scoring Engine

**Fully deterministic.**

| Factor | Weight |
|--------|--------|
| Smoking | +40 |
| Rare Exercise | +20 |
| High Sugar Diet | +18 |
| Age > 50 | +5 |

**Risk classification:**
- **Low**: ≤ 35
- **Medium**: 36–70
- **High**: > 70

Each risk score includes:
- Total score
- Risk level
- Contributing factors

### Step 5: Recommendation Synthesis (LLM)

Gemini is used only for:
- Natural language generation
- Contextual wellness advice

**Strict constraints:**
- JSON-only output
- Exactly 3 recommendations
- No medical claims
- Priority tagging

---

## 💻 Frontend Engineering Highlights

- **React + TypeScript**
- Strong type safety across services
- UI state tightly coupled with pipeline stages
- Clear user feedback at each processing step
- Raw audit output exposed for transparency

---

## 🔒 Security & Privacy Considerations

- API keys stored via `.env` only
- `.env` excluded from version control
- No backend persistence
- No user data stored
- All processing happens client-side

---

## ⚠️ Limitations & Non-Goals

This project intentionally does **NOT**:
- Diagnose diseases
- Prescribe medication
- Replace medical professionals
- Store personal health records

**It is designed as:**
- A decision-support prototype
- A hybrid AI system demonstration
- A safe AI design reference

---

## 🛣️ Extensibility Roadmap

Possible future enhancements:
- Backend microservice for secure inference
- Model-agnostic LLM adapters
- Risk calibration via epidemiological datasets
- Differential privacy mechanisms
- Explainable AI visualizations
- Clinical data schema support (FHIR)

---

## 🛠️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/<your-username>/health-risk-ai.git

# Navigate to project directory
cd health-risk-ai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🤝 Ethical AI Statement

HealthRiskAI follows:
- Human-in-the-loop philosophy
- Explainability over black-box intelligence
- Safety-first prompt engineering
- Minimal LLM dependency

---

## 👨‍💻 Author

**Hruthwik Rajesh Kusuma**  
IIT Patna  
📧 2201cs43_kusuma@iitp.ac.in

---

**Contributions, issues, and feature requests are welcome!**