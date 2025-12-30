import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsers, getUserStats } from '../services/api'

function Users() {
  const [filters, setFilters] = useState({
    signupDateFrom: '',
    signupDateTo: '',
    subscriptionTier: '',
    churnStatus: ''
  })

  const [appliedFilters, setAppliedFilters] = useState({
    signupDateFrom: '',
    signupDateTo: '',
    subscriptionTier: '',
    churnStatus: ''
  })

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', appliedFilters],
    queryFn: async () => {
      const params = { limit: 100 }
      if (appliedFilters.signupDateFrom) params.signupDateFrom = appliedFilters.signupDateFrom
      if (appliedFilters.signupDateTo) params.signupDateTo = appliedFilters.signupDateTo
      if (appliedFilters.subscriptionTier) params.tier = appliedFilters.subscriptionTier
      if (appliedFilters.churnStatus) params.status = appliedFilters.churnStatus
      
      const response = await getUsers(params)
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
      signupDateFrom: '',
      signupDateTo: '',
      subscriptionTier: '',
      churnStatus: ''
    }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await getUserStats()
      return response.data
    }
  })

  if (isLoading) {
    return <div className="loading">Loading users...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Users</h1>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Signup Date From</label>
            <input
              type="date"
              value={filters.signupDateFrom}
              onChange={(e) => handleFilterChange('signupDateFrom', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Signup Date To</label>
            <input
              type="date"
              value={filters.signupDateTo}
              onChange={(e) => handleFilterChange('signupDateTo', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
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
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Churn Status</label>
            <select
              value={filters.churnStatus}
              onChange={(e) => handleFilterChange('churnStatus', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="at_risk">At Risk</option>
              <option value="churned">Churned</option>
            </select>
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
          <div className="kpi-label">Free Tier</div>
          <div className="kpi-value">{stats?.free_tier}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Starter Tier</div>
          <div className="kpi-value">{stats?.starter_tier}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Professional Tier</div>
          <div className="kpi-value">{stats?.professional_tier}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Enterprise Tier</div>
          <div className="kpi-value">{stats?.enterprise_tier}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>User List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Signup Date</th>
            </tr>
          </thead>
          <tbody>
            {users?.data.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.location}</td>
                <td>{user.subscription_tier}</td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    backgroundColor: user.churn_status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: user.churn_status === 'active' ? '#065f46' : '#991b1b'
                  }}>
                    {user.churn_status}
                  </span>
                </td>
                <td>{new Date(user.signup_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Users
