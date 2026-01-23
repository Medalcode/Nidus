import React, { useState } from 'react';
import { useCandidates } from '../hooks/useCandidates';
import { 
  FaUserTie, FaCalendarAlt, FaStar, FaFilePdf, 
  FaSearch, FaFilter, FaExclamationTriangle, FaDownload
} from 'react-icons/fa';
import api from '../lib/api';
import { saveAs } from 'file-saver';

export default function Dashboard({ onBack }) {
  const { data: candidates, isLoading, error } = useCandidates();
  const [filter, setFilter] = useState('');
  const [exporting, setExporting] = useState(null);

  const filteredCandidates = candidates?.filter(c => 
    c.filename.toLowerCase().includes(filter.toLowerCase()) ||
    c.analysis.keywords.some(k => k.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleExport = async (id, filename) => {
      setExporting(id);
      try {
          const res = await api.get(`/export-pdf/${id}`, { responseType: 'blob' });
          saveAs(res.data, `Analysis_${filename}.pdf`);
      } catch (e) {
          console.error("Export failed", e);
          alert("Error al exportar PDF");
      } finally {
          setExporting(null);
      }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="loader mb-4"></div>
        <p className="text-slate-500">Cargando candidatos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-600">
        <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
        <p>Error al cargar candidatos: {error.message}</p>
        <button onClick={onBack} className="mt-4 text-indigo-600 hover:underline">Volver</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <FaUserTie className="text-indigo-600" /> 
             Candidatos Procesados
           </h2>
           <p className="text-slate-500 text-sm mt-1">
             Historial de análisis realizados ({candidates?.length})
           </p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-64">
             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Buscar por nombre o keyword..." 
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
               value={filter}
               onChange={e => setFilter(e.target.value)}
             />
           </div>
           
           <button 
             onClick={onBack}
             className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
           >
             Nuevo Análisis
           </button>
        </div>
      </div>

      {filteredCandidates?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
           <p className="text-slate-400">No se encontraron candidatos.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCandidates.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow flex flex-col md:flex-row justify-between gap-4">
               <div className="flex-1">
                  <div className="flex items-start justify-between">
                     <h3 className="font-semibold text-lg text-slate-800">{c.filename}</h3>
                     <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                       ID: {c.id}
                     </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                     <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-slate-400" />
                        {new Date(c.upload_date).toLocaleDateString()}
                     </span>
                     {c.analysis.match_score > 0 && (
                        <span className="flex items-center gap-1 font-medium text-emerald-600">
                           <FaStar /> {c.analysis.match_score}% Match
                        </span>
                     )}
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                     {c.analysis.keywords.slice(0, 5).map((k, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                           {k}
                        </span>
                     ))}
                     {c.analysis.keywords.length > 5 && (
                        <span className="text-xs px-2 py-1 text-slate-400">
                           +{c.analysis.keywords.length - 5}
                        </span>
                     )}
                  </div>
               </div>
               
               <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                  <button 
                    onClick={() => handleExport(c.id, c.filename)}
                    disabled={exporting === c.id}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                     {exporting === c.id ? <span className="loader text-xs w-4 h-4"></span> : <FaDownload />}
                     PDF
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
