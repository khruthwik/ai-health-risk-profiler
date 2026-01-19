
import React, { useState, useCallback, useRef } from 'react';
import { HealthService } from './services/healthService';
import { HealthReport, ProcessStep } from './types';
import ReportCard from './components/ReportCard';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

const SAMPLE_JSON = `{\n  "age": 42,\n  "smoker": true,\n  "exercise": "rarely",\n  "diet": "high sugar"\n}`;

const App: React.FC = () => {
  const [inputJson, setInputJson] = useState(SAMPLE_JSON);
  const [currentStep, setCurrentStep] = useState<ProcessStep>(ProcessStep.IDLE);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const healthService = useRef(new HealthService());

  const handleProcess = async () => {
    setIsProcessing(true);
    setReport(null);
    try {
      const result = await healthService.current.runFullPipeline(inputJson, (step) => {
        setCurrentStep(step);
      });
      setReport(result);
    } catch (error) {
      console.error(error);
      setCurrentStep(ProcessStep.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };
  

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsProcessing(true);

  try {
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const base64Content = base64Data.split(',')[1];

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } // Force JSON mode
    });

    const prompt = `
      Analyze this health survey form image. Extract the following fields: age, smoker (boolean), exercise, and diet.
      Return the data strictly in this JSON format:
      {
        "answers": {"age": number, "smoker": boolean, "exercise": string, "diet": string},
        "missing_fields": string[],
        "confidence": number
      }
      If more than 50% of the fields are missing or unreadable, return:
      {"status":"incomplete_profile","reason":">50% fields missing"}
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type,
          data: base64Content,
        },
      },
    ]);

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    setInputJson(JSON.stringify(parsedData, null, 2));

  } catch (error) {
    console.error("Gemini OCR Error:", error);
    alert("Error parsing image. Please try again.");
  } finally {
    setIsProcessing(false);
  }
};

  const stepLabels = {
    [ProcessStep.IDLE]: "Ready to Start",
    [ProcessStep.PARSING]: "Parsing Raw Inputs...",
    [ProcessStep.EXTRACTING]: "Extracting Health Factors...",
    [ProcessStep.SCORING]: "Calculating Risk Matrix...",
    [ProcessStep.RECOMMENDING]: "Generating AI Recommendations...",
    [ProcessStep.COMPLETED]: "Audit Complete",
    [ProcessStep.ERROR]: "Processing Error"
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden border border-blue-200">
  <img 
    src="https://res.cloudinary.com/dwufjprxk/image/upload/v1694598845/plum_shfnqp.png" 
    alt="Doctor Icon" 
    className="w-8 h-8 object-contain"
  />
</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">HealthRisk<span className="text-blue-600">AI</span></h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Profiling Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*,.pdf"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-600 hover:text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg border border-slate-200 transition-all hover:bg-slate-50"
          >
            Upload Scan (OCR)
          </button>
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className={`px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 transition-all ${
              isProcessing ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isProcessing ? 'Processing Pipeline...' : 'Run Analysis'}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-5 flex flex-col gap-8 h-full">
          
          <section className="bg-white rounded-2xl shadow-sm border border-slate-300 overflow-hidden flex flex-col h-[400px]">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Data ( TEXT / JSON )</span>
              <button 
                onClick={() => setInputJson(SAMPLE_JSON)}
                className="text-[10px] text-blue-600 font-bold uppercase hover:underline"
              >
                Reset to Sample
              </button>
            </div>
            <textarea
              className="flex-1 p-6 font-mono text-[10px] bg-slate-900 text-slate-300 resize-none outline-none focus:ring-2 ring-blue-500/20"
              spellCheck={false}
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
            />
          </section>

          {/* Pipeline Tracker */}
          {/* <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Processing Pipeline</h3>
            <div className="space-y-6">
              {[ProcessStep.PARSING, ProcessStep.EXTRACTING, ProcessStep.SCORING, ProcessStep.RECOMMENDING].map((step, i) => {
                const isActive = currentStep === step;
                const isPast = Object.values(ProcessStep).indexOf(currentStep) > Object.values(ProcessStep).indexOf(step);
                const isError = currentStep === ProcessStep.ERROR;
                
                return (
                  <div key={step} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200' : 
                      isPast ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isPast ? '✓' : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step === ProcessStep.PARSING && 'OCR & Data Parsing'}
                        {step === ProcessStep.EXTRACTING && 'Factor Normalization'}
                        {step === ProcessStep.SCORING && 'Risk Matrix Classification'}
                        {step === ProcessStep.RECOMMENDING && 'AI Guidance Synthesis'}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section> */}

          {report && (
            <section className="bg-slate-900 rounded-2xl p-6 text-slate-300 font-mono text-[10px] overflow-hidden">
               <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                 <span className="text-slate-500 uppercase font-bold">System Raw Output</span>
                 <span className="text-emerald-500">SUCCESS</span>
               </div>
               <pre className="overflow-x-auto whitespace-pre-wrap">
                 {JSON.stringify(report.rawOutput, null, 2)}
               </pre>
            </section>
          )}
        </div>

        <div className="lg:col-span-7 h-[calc(100vh-160px)] sticky top-24">
          {report ? (
            <ReportCard report={report} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Patient Dashboard</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                No active session. Input your survey data or upload a scan to generate a risk profile.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-8 flex justify-between items-center">
        <div className="text-[10px] text-slate-400 font-medium">
          Hruthwik Rajesh Kusuma &middot; 2201cs43_kusuma@iitp.ac.in
        </div>
        <div className="flex gap-4">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">API Online</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
