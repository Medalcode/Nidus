import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie } from 'recharts';

export default function Analytics({ jobs }) {
  const statusCounts = {
    wishlist: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  };

  jobs.forEach(job => {
    if (statusCounts[job.status] !== undefined) {
      statusCounts[job.status]++;
    }
  });

  const data = [
    { name: 'Por Aplicar', value: statusCounts.wishlist, color: '#a78bfa' },
    { name: 'Aplicado', value: statusCounts.applied, color: '#38bdf8' },
    { name: 'Entrevista', value: statusCounts.interview, color: '#fbbf24' },
    { name: 'Oferta', value: statusCounts.offer, color: '#4ade80' },
    { name: 'Rechazado', value: statusCounts.rejected, color: '#f87171' }
  ];
  
  // Calculate success rate (Interview + Offer) / Total Applied (excluding wishlist)
  const actionedJobs = jobs.filter(j => j.status !== 'wishlist').length;
  const successes = statusCounts.interview + statusCounts.offer;
  const successRate = actionedJobs > 0 ? ((successes / actionedJobs) * 100).toFixed(1) : 0;

  return (
    <div className="analytics-dashboard" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Postulaciones</h3>
          <div className="number">{jobs.length}</div>
          <div className="label">Oportunidades rastreadas</div>
        </div>
        <div className="stat-card">
          <h3>Tasa de Éxito</h3>
          <div className="number" style={{ color: '#4ade80' }}>{successRate}%</div>
          <div className="label">Entrevistas/Ofertas vs Aplicaciones</div>
        </div>
        <div className="stat-card">
          <h3>Pendientes</h3>
          <div className="number" style={{ color: '#a78bfa' }}>{statusCounts.wishlist}</div>
          <div className="label">Ofertas por aplicar</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Embudo de Conversión</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
