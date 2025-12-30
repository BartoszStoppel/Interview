import { useQuery } from '@tanstack/react-query'
import { getRevenue, getRevenueStats } from '../services/api'

function Revenue() {
  const { data: revenue, isLoading } = useQuery({
    queryKey: ['revenue'],
    queryFn: async () => {
      const response = await getRevenue({ limit: 100 })
      return response.data
    }
  })

  const { data: stats } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: async () => {
      const response = await getRevenueStats()
      return response.data
    }
  })

  if (isLoading) {
    return <div className="loading">Loading revenue data...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Revenue</h1>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total MRR</div>
          <div className="kpi-value">${stats?.total_mrr?.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">One-Time Revenue</div>
          <div className="kpi-value">${stats?.total_one_time?.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">${stats?.total_revenue?.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Transaction</div>
          <div className="kpi-value">${stats?.avg_transaction?.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Type</th>
              <th>Tier</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {revenue?.data.map((transaction) => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                <td>{transaction.user_name}</td>
                <td>{transaction.transaction_type}</td>
                <td>{transaction.subscription_tier}</td>
                <td style={{ color: transaction.amount < 0 ? '#ef4444' : '#10b981' }}>
                  ${Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td>{transaction.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Revenue
