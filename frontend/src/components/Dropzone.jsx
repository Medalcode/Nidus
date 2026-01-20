import React from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';

export default function Dropzone({ onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ease-in-out
        ${isDragActive 
          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' 
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors duration-300`}>
          <FaCloudUploadAlt className="text-4xl" />
        </div>
        
        <div>
          <p className="text-lg font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">
            {isDragActive ? "¡Suelta el archivo aquí!" : "Arrastra tu CV o haz clic para subir"}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Formatos soportados: PDF, DOCX, TXT (Máx 2MB)
          </p>
        </div>
      </div>
    </div>
  );
}
