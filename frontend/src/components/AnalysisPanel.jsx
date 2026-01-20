import React from 'react';
import { FaFilePdf, FaCheckCircle, FaFileWord, FaFileAlt, FaDownload } from 'react-icons/fa';

export default function AnalysisPanel({ analysis, onExport, lang, i18n }) {
  const getIcon = (fmt) => {
    if (fmt === 'PDF') return <FaFilePdf className="text-red-500" />;
    if (fmt === 'DOCX') return <FaFileWord className="text-blue-500" />;
    return <FaFileAlt className="text-slate-500" />;
  };

  return (
    <div className="mt-8 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-2xl">
              {getIcon(analysis.format)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{i18n[lang].analysisTitle}</h2>
              <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                {analysis.filename} • <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs">{analysis.format}</span>
              </p>
            </div>
          </div>
          
          <button 
            onClick={onExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:ring-4 focus:ring-indigo-100"
          >
            <FaDownload /> {i18n[lang].exportPDF}
          </button>
        </div>

        <div className="p-6 sm:p-8 grid gap-8 md:grid-cols-2">
            
            {/* Match Score */}
            {analysis.match_score > 0 && (
                <div className="md:col-span-2 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-lg font-bold text-indigo-900">Job Match Score</h3>
                        <span className="text-3xl font-bold text-indigo-600">{analysis.match_score}%</span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-3">
                        <div 
                            className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${analysis.match_score}%` }}
                        ></div>
                    </div>
                    {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-indigo-800 mb-2">Palabras clave faltantes (sugeridas):</p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.missing_keywords.map((k, i) => (
                                    <span key={i} className="px-2 py-1 bg-white text-indigo-600 rounded border border-indigo-200 text-xs font-bold">
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Keywords */}
            <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{i18n[lang].keywords}</h3>
                <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((k, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                            {k}
                        </span>
                    ))}
                </div>
            </div>

            {/* Structure */}
            <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{i18n[lang].structure}</h3>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl text-sm border border-slate-100 leading-relaxed">
                    {analysis.structure}
                </p>
            </div>

            {/* Recommendations */}
            <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recomendaciones</h3>
                <ul className="space-y-3">
                    {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <FaCheckCircle className="text-green-500 mt-0.5 text-lg flex-shrink-0" />
                            <span className="text-slate-700">{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
