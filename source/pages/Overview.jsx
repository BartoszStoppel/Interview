import { useQuery } from '@tanstack/react-query'
import { getDashboardKPIs, getUserGrowth, getMonthlyRevenue } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>User Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="new_users" stroke="#3b82f6" name="New Users" />
            <Line type="monotone" dataKey="cumulative_users" stroke="#10b981" name="Total Users" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total_revenue" stroke="#8b5cf6" name="Total Revenue" />
            <Line type="monotone" dataKey="mrr" stroke="#06b6d4" name="MRR" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Overview
