import { useQuery } from '@tanstack/react-query'
import { getMarketing, getMarketingStats, getCampaignPerformance } from '../services/api'

function Marketing() {
  const { data: marketing, isLoading } = useQuery({
    queryKey: ['marketing'],
    queryFn: async () => {
      const response = await getMarketing({ limit: 100 })
      return response.data
    }
  })

  const { data: stats } = useQuery({
    queryKey: ['marketing-stats'],
    queryFn: async () => {
      const response = await getMarketingStats()
      return response.data
    }
  })

  const { data: campaigns } = useQuery({
    queryKey: ['campaign-performance'],
    queryFn: async () => {
      const response = await getCampaignPerformance()
      return response.data
    }
  })

  if (isLoading) {
    return <div className="loading">Loading marketing data...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Marketing</h1>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Impressions</div>
          <div className="kpi-value">{stats?.total_impressions?.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Clicks</div>
          <div className="kpi-value">{stats?.total_clicks?.toLocaleString()}</div>
          <div className="kpi-change">{stats?.avg_ctr?.toFixed(2)}% CTR</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Conversions</div>
          <div className="kpi-value">{stats?.total_conversions?.toLocaleString()}</div>
          <div className="kpi-change">{stats?.avg_conversion_rate?.toFixed(2)}% rate</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Cost</div>
          <div className="kpi-value">${stats?.total_cost?.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Campaign Performance</h2>
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Channel</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>Conversions</th>
              <th>CTR</th>
              <th>Conv. Rate</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {campaigns?.map((campaign, idx) => (
              <tr key={idx}>
                <td>{campaign.campaign_name}</td>
                <td>{campaign.acquisition_channel}</td>
                <td>{campaign.total_impressions?.toLocaleString()}</td>
                <td>{campaign.total_clicks?.toLocaleString()}</td>
                <td>{campaign.total_conversions}</td>
                <td>{campaign.ctr?.toFixed(2)}%</td>
                <td>{campaign.conversion_rate?.toFixed(2)}%</td>
                <td>${campaign.total_cost?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Marketing
