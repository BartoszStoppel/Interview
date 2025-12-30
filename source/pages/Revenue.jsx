import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRevenue, getRevenueStats } from '../services/api'

function Revenue() {
  const [filters, setFilters] = useState({
    transactionDateFrom: '',
    transactionDateTo: '',
    transactionType: '',
    subscriptionTier: '',
    status: '',
    amountMin: '',
    amountMax: ''
  })

  const [appliedFilters, setAppliedFilters] = useState({
    transactionDateFrom: '',
    transactionDateTo: '',
    transactionType: '',
    subscriptionTier: '',
    status: '',
    amountMin: '',
    amountMax: ''
  })

  const { data: revenue, isLoading } = useQuery({
    queryKey: ['revenue', appliedFilters],
    queryFn: async () => {
      const params = { limit: 100 }
      if (appliedFilters.transactionDateFrom) params.transactionDateFrom = appliedFilters.transactionDateFrom
      if (appliedFilters.transactionDateTo) params.transactionDateTo = appliedFilters.transactionDateTo
      if (appliedFilters.transactionType) params.transactionType = appliedFilters.transactionType
      if (appliedFilters.subscriptionTier) params.tier = appliedFilters.subscriptionTier
      if (appliedFilters.status) params.status = appliedFilters.status
      if (appliedFilters.amountMin) params.amountMin = appliedFilters.amountMin
      if (appliedFilters.amountMax) params.amountMax = appliedFilters.amountMax
      
      const response = await getRevenue(params)
      return response.data
    }
  })

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const applyFilters = () => {
    setAppliedFilters(filters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      transactionDateFrom: '',
      transactionDateTo: '',
      transactionType: '',
      subscriptionTier: '',
      status: '',
      amountMin: '',
      amountMax: ''
    }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

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

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Date From</label>
            <input
              type="date"
              value={filters.transactionDateFrom}
              onChange={(e) => handleFilterChange('transactionDateFrom', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Date To</label>
            <input
              type="date"
              value={filters.transactionDateTo}
              onChange={(e) => handleFilterChange('transactionDateTo', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Transaction Type</label>
            <select
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="mrr">MRR</option>
              <option value="one_time">One-Time</option>
              <option value="refund">Refund</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Subscription Tier</label>
            <select
              value={filters.subscriptionTier}
              onChange={(e) => handleFilterChange('subscriptionTier', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Amount Min ($)</label>
            <input
              type="number"
              value={filters.amountMin}
              onChange={(e) => handleFilterChange('amountMin', e.target.value)}
              placeholder="Min"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Amount Max ($)</label>
            <input
              type="number"
              value={filters.amountMax}
              onChange={(e) => handleFilterChange('amountMax', e.target.value)}
              placeholder="Max"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={applyFilters}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear Filters
          </button>
        </div>
      </div>

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
