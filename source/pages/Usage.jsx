import { useQuery } from '@tanstack/react-query'
import { getUsage, getUsageStats } from '../services/api'

function Usage() {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage'],
    queryFn: async () => {
      const response = await getUsage({ limit: 100 })
      return response.data
    }
  })

  const { data: stats } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: async () => {
      const response = await getUsageStats()
      return response.data
    }
  })

  if (isLoading) {
    return <div className="loading">Loading usage data...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Usage Metrics</h1>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Logins</div>
          <div className="kpi-value">{stats?.total_logins?.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Features Used</div>
          <div className="kpi-value">{stats?.total_features_used?.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Support Tickets</div>
          <div className="kpi-value">{stats?.total_tickets_opened}</div>
          <div className="kpi-change positive">{stats?.total_tickets_resolved} resolved</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Session</div>
          <div className="kpi-value">{stats?.avg_session_duration?.toFixed(0)} min</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Usage Data</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Logins</th>
              <th>Features Used</th>
              <th>Tickets Opened</th>
              <th>Session Duration</th>
            </tr>
          </thead>
          <tbody>
            {usage?.data.map((record) => (
              <tr key={record.id}>
                <td>{record.metric_date}</td>
                <td>{record.user_name}</td>
                <td>{record.login_count}</td>
                <td>{record.features_used_count}</td>
                <td>{record.support_tickets_opened}</td>
                <td>{record.session_duration_minutes} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Usage
