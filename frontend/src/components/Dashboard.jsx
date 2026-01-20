import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaFilePdf, FaEye, FaTrash } from 'react-icons/fa';

export default function Dashboard({ onBack }) {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const res = await fetch('/cvs');
            if (res.ok) {
                const data = await res.json();
                setCandidates(data);
            }
        } catch (error) {
            console.error("Error fetching candidates:", error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'bg-green-100 text-green-800';
        if (score >= 40) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Candidatos</h2>
                <button 
                    onClick={onBack}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                    &larr; Volver a Subir
                </button>
            </div>

            {loading ? (
                 <div className="flex justify-center p-10"><span className="loader"></span></div>
            ) : candidates.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500">No hay candidatos procesados aún.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidato / Archivo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Match Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Skills Detectadas</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {candidates.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 text-slate-300">
                                                <FaUserCircle className="h-10 w-10" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {/* Extract Name if AI parsed it, else Filename */}
                                                    {c.analysis.ai_extracted?.name || c.filename}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                   {new Date(c.upload_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColor(c.analysis.match_score)}`}>
                                            {c.analysis.match_score > 0 ? `${c.analysis.match_score}%` : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                          {c.analysis.keywords.slice(0, 3).map((k,i) => (
                                            <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{k}</span>
                                          ))}
                                          {c.analysis.keywords.length > 3 && (
                                              <span className="text-xs text-slate-400">+{c.analysis.keywords.length - 3}</span>
                                          )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href={`/export-pdf/${c.id}`} target="_blank" className="text-indigo-600 hover:text-indigo-900 mx-2" title="Descargar PDF">
                                            <FaFilePdf />
                                        </a>
                                        {/* View Details could open a modal - for now disabled */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
