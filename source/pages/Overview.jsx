import { useQuery } from '@tanstack/react-query'
import { getDashboardKPIs, getUserGrowth, getMonthlyRevenue, getAcquisitionFunnel, getChurnCohorts, getFeatureUsage, getUserLocations } from '../services/api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

function Overview() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const response = await getDashboardKPIs()
      return response.data
    }
  })

  const { data: userGrowth } = useQuery({
    queryKey: ['user-growth'],
    queryFn: async () => {
      const response = await getUserGrowth()
      return response.data
    }
  })

  const { data: revenueData } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: async () => {
      const response = await getMonthlyRevenue()
      return response.data
    }
  })

  const { data: funnelData } = useQuery({
    queryKey: ['acquisition-funnel'],
    queryFn: async () => {
      const response = await getAcquisitionFunnel()
      return response.data
    }
  })

  const { data: churnCohorts } = useQuery({
    queryKey: ['churn-cohorts'],
    queryFn: async () => {
      const response = await getChurnCohorts()
      return response.data
    }
  })

  const { data: featureUsage } = useQuery({
    queryKey: ['feature-usage'],
    queryFn: async () => {
      const response = await getFeatureUsage()
      return response.data
    }
  })

  const { data: userLocations } = useQuery({
    queryKey: ['user-locations'],
    queryFn: async () => {
      const response = await getUserLocations()
      return response.data
    }
  })

  if (kpisLoading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Users</div>
          <div className="kpi-value">{kpis?.users.total.toLocaleString()}</div>
          <div className="kpi-change positive">+{kpis?.users.newLast30Days} last 30 days</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Active Users</div>
          <div className="kpi-value">{kpis?.users.active.toLocaleString()}</div>
          <div className="kpi-change">{((kpis?.users.active / kpis?.users.total) * 100).toFixed(1)}% of total</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Total MRR</div>
          <div className="kpi-value">${kpis?.revenue.totalMRR.toLocaleString()}</div>
          <div className="kpi-change">${kpis?.revenue.averageRevenuePerUser} per user</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Churn Rate</div>
          <div className="kpi-value">{kpis?.users.churnRate}%</div>
          <div className="kpi-change negative">{kpis?.users.churned} churned users</div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>User Growth</h2>
        {userGrowth && userGrowth.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="new_users" stroke="#3b82f6" name="New Users" strokeWidth={2} />
              <Line type="monotone" dataKey="cumulative_users" stroke="#10b981" name="Total Users" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="loading">No user growth data available</div>
        )}
      </div>

      {/* Acquisition Funnel */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>User Acquisition Funnel</h2>
        {funnelData && funnelData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="funnel_stage" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
              <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
              <Bar dataKey="conversions" fill="#f59e0b" name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="loading">No funnel data available</div>
        )}
      </div>

      {/* Cohort Retention Analysis */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Cohort Retention Analysis (% Active Users)</h2>
        {churnCohorts && churnCohorts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 1 }}>Cohort</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Size</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Month 1</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Month 2</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Month 3</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Month 4</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Month 5</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Month 6</th>
                </tr>
              </thead>
              <tbody>
                {churnCohorts.map((cohort, idx) => {
                  const getRetentionColor = (percentage) => {
                    if (percentage >= 80) return '#10b981'; // Green
                    if (percentage >= 60) return '#84cc16'; // Light green
                    if (percentage >= 40) return '#f59e0b'; // Orange
                    if (percentage >= 20) return '#f97316'; // Dark orange
                    return '#ef4444'; // Red
                  };
                  
                  return (
                    <tr key={idx}>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #e5e7eb', 
                        fontWeight: '600',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'white',
                        zIndex: 1
                      }}>
                        {cohort.cohort}
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        textAlign: 'center', 
                        borderBottom: '1px solid #e5e7eb',
                        fontWeight: '600',
                        backgroundColor: '#f9fafb'
                      }}>
                        {cohort.month_0}
                      </td>
                      {[1, 2, 3, 4, 5, 6].map(month => {
                        const value = cohort[`month_${month}`];
                        const isNull = value === null;
                        
                        if (isNull) {
                          return (
                            <td key={month} style={{
                              padding: '0.75rem',
                              textAlign: 'center',
                              borderBottom: '1px solid #e5e7eb',
                              backgroundColor: '#f9fafb',
                              color: '#9ca3af',
                              fontWeight: '600'
                            }}>
                              -
                            </td>
                          );
                        }
                        
                        return (
                          <td key={month} style={{
                            padding: '0.75rem',
                            textAlign: 'center',
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: getRetentionColor(value),
                            color: 'white',
                            fontWeight: '600'
                          }}>
                            {value}%
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="loading">No churn data available</div>
        )}
      </div>

      {/* User Locations World Map */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>User Distribution by Location</h2>
        {userLocations && userLocations.length > 0 ? (
          <div>
            <ResponsiveContainer width="100%" height={500}>
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 147
                }}
              >
                <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#E8E8E8"
                        stroke="#FFFFFF"
                        strokeWidth={0.5}
                      />
                    ))
                  }
                </Geographies>
                {userLocations.map((loc, idx) => {
                  const maxUsers = Math.max(...userLocations.map(l => l.userCount));
                  const radius = 3 + (loc.userCount / maxUsers) * 12;
                  const opacity = 0.3 + (loc.userCount / maxUsers) * 0.7;
                  
                  return (
                    <Marker key={idx} coordinates={loc.coordinates}>
                      <circle
                        r={radius}
                        fill="#3b82f6"
                        stroke="#1e40af"
                        strokeWidth={1.5}
                        fillOpacity={opacity}
                      />
                    </Marker>
                  );
                })}
              </ComposableMap>
            </ResponsiveContainer>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                {userLocations.slice(0, 10).map((loc, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: '#3b82f6',
                      opacity: 0.3 + (loc.userCount / Math.max(...userLocations.map(l => l.userCount))) * 0.7
                    }}></div>
                    <span>{loc.location}: {loc.userCount} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="loading">No location data available</div>
        )}
      </div>

      {/* Feature Usage Heatmap */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Feature Usage Heatmap by Subscription Tier</h2>
        {featureUsage && featureUsage.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Feature</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Free</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Starter</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Professional</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureUsage.map((row, idx) => {
                  const maxValue = Math.max(row.free, row.starter, row.professional, row.enterprise);
                  const getHeatColor = (value) => {
                    if (value === 0) return '#f3f4f6';
                    const intensity = value / maxValue;
                    if (intensity > 0.75) return '#3b82f6';
                    if (intensity > 0.5) return '#60a5fa';
                    if (intensity > 0.25) return '#93c5fd';
                    return '#dbeafe';
                  };
                  
                  return (
                    <tr key={idx}>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
                        {row.feature}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: getHeatColor(row.free),
                        color: row.free / maxValue > 0.5 ? 'white' : '#1f2937',
                        fontWeight: '600'
                      }}>
                        {row.free}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: getHeatColor(row.starter),
                        color: row.starter / maxValue > 0.5 ? 'white' : '#1f2937',
                        fontWeight: '600'
                      }}>
                        {row.starter}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: getHeatColor(row.professional),
                        color: row.professional / maxValue > 0.5 ? 'white' : '#1f2937',
                        fontWeight: '600'
                      }}>
                        {row.professional}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: getHeatColor(row.enterprise),
                        color: row.enterprise / maxValue > 0.5 ? 'white' : '#1f2937',
                        fontWeight: '600'
                      }}>
                        {row.enterprise}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="loading">No feature usage data available</div>
        )}
      </div>

      {/* Monthly Revenue Detail */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Monthly Revenue Breakdown</h2>
        {revenueData && revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total_revenue" stroke="#8b5cf6" name="Total Revenue" strokeWidth={2} />
              <Line type="monotone" dataKey="mrr" stroke="#06b6d4" name="MRR" strokeWidth={2} />
              <Line type="monotone" dataKey="refunds" stroke="#ef4444" name="Refunds" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="loading">No monthly revenue data available</div>
        )}
      </div>
    </div>
  )
}

export default Overview
