
import React from 'react';
import { HealthReport } from '../types';

interface ReportCardProps {
  report: HealthReport;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  if (report.status === 'incomplete_profile') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Profile Incomplete</h3>
        <p className="text-red-600">{report.reason || "Missing vital information."}</p>
      </div>
    );
  }

  const { riskProfile, normalizedData, recommendations } = report;

  const scoreColor = riskProfile!.level === 'High' ? 'text-red-600' : 
                     riskProfile!.level === 'Medium' ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 h-full flex flex-col">
      <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl">PATIENT HEALTH AUDIT</h2>
         <p className="text-slate-400 text-sm font-mono tracking-tight">
  <span className="font-bold">A</span>utomated
  <span className=" font-bold"> W</span>ellness
  <span className="font-bold"> A</span>ssessment  
   <span className="text-blue-300 font-bold"> (AWA)</span>
</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-black ${scoreColor}`}>
            {riskProfile!.score}
            <span className="text-sm font-normal text-slate-400 ml-1">/ 100</span>
          </div>
          <div className={`text-xs uppercase tracking-widest font-bold ${scoreColor}`}>
            {riskProfile!.level} Risk
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-8">
        {/* Core Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <span className="text-xs text-slate-500 uppercase block mb-1">Age Group</span>
            <span className="font-semibold text-slate-800">{normalizedData!.age} Years</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <span className="text-xs text-slate-500 uppercase block mb-1">Dietary Focus</span>
            <span className="font-semibold text-slate-800 capitalize">{normalizedData!.diet}</span>
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">Identified Risk Factors</h3>
          <div className="flex flex-wrap gap-2">
            {riskProfile!.factors.length > 0 ? (
              riskProfile!.factors.map((f, i) => (
                <span key={i} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">
                  {f}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500 italic">No significant lifestyle risks identified.</span>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">Wellness Roadmap (AI-Powered)</h3>
          <div className="space-y-4">
            {recommendations?.map((rec, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className={`w-2 shrink-0 rounded-full ${
                  rec.priority === 'High' ? 'bg-red-400' : rec.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">{rec.area}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      rec.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{rec.advice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center italic">
          Disclaimer: This is an automated assessment and not a medical diagnosis. Consult a healthcare professional for clinical advice.
        </p>
      </div>
    </div>
  );
};

export default ReportCard;
