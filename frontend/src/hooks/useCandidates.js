import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useCandidates = () => {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data } = await api.get('/cvs');
      return data;
    },
  });
};

export const useCandidatePDF = (id) => {
  // Not used as hook often, but good for reference
  const fetchPDF = async () => {
     const response = await api.get(`/export-pdf/${id}`, { responseType: 'blob' });
     return response.data;
  };
  return { fetchPDF };
};
