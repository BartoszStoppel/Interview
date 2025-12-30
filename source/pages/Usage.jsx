import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsage, getUsageStats } from '../services/api'

function Usage() {
  const [filters, setFilters] = useState({
    metricDateFrom: '',
    metricDateTo: '',
    loginCountMin: '',
    loginCountMax: '',
    featuresUsedMin: '',
    featuresUsedMax: '',
    ticketsOpenedMin: '',
    ticketsOpenedMax: '',
    sessionDurationMin: '',
    sessionDurationMax: ''
  })

  const [appliedFilters, setAppliedFilters] = useState({
    metricDateFrom: '',
    metricDateTo: '',
    loginCountMin: '',
    loginCountMax: '',
    featuresUsedMin: '',
    featuresUsedMax: '',
    ticketsOpenedMin: '',
    ticketsOpenedMax: '',
    sessionDurationMin: '',
    sessionDurationMax: ''
  })

  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage', appliedFilters],
    queryFn: async () => {
      const params = { limit: 100 }
      if (appliedFilters.metricDateFrom) params.metricDateFrom = appliedFilters.metricDateFrom
      if (appliedFilters.metricDateTo) params.metricDateTo = appliedFilters.metricDateTo
      if (appliedFilters.loginCountMin) params.loginCountMin = appliedFilters.loginCountMin
      if (appliedFilters.loginCountMax) params.loginCountMax = appliedFilters.loginCountMax
      if (appliedFilters.featuresUsedMin) params.featuresUsedMin = appliedFilters.featuresUsedMin
      if (appliedFilters.featuresUsedMax) params.featuresUsedMax = appliedFilters.featuresUsedMax
      if (appliedFilters.ticketsOpenedMin) params.ticketsOpenedMin = appliedFilters.ticketsOpenedMin
      if (appliedFilters.ticketsOpenedMax) params.ticketsOpenedMax = appliedFilters.ticketsOpenedMax
      if (appliedFilters.sessionDurationMin) params.sessionDurationMin = appliedFilters.sessionDurationMin
      if (appliedFilters.sessionDurationMax) params.sessionDurationMax = appliedFilters.sessionDurationMax
      
      const response = await getUsage(params)
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
      metricDateFrom: '',
      metricDateTo: '',
      loginCountMin: '',
      loginCountMax: '',
      featuresUsedMin: '',
      featuresUsedMax: '',
      ticketsOpenedMin: '',
      ticketsOpenedMax: '',
      sessionDurationMin: '',
      sessionDurationMax: ''
    }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

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

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Date From</label>
            <input
              type="date"
              value={filters.metricDateFrom}
              onChange={(e) => handleFilterChange('metricDateFrom', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Date To</label>
            <input
              type="date"
              value={filters.metricDateTo}
              onChange={(e) => handleFilterChange('metricDateTo', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Login Count Min</label>
            <input
              type="number"
              value={filters.loginCountMin}
              onChange={(e) => handleFilterChange('loginCountMin', e.target.value)}
              placeholder="Min"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Login Count Max</label>
            <input
              type="number"
              value={filters.loginCountMax}
              onChange={(e) => handleFilterChange('loginCountMax', e.target.value)}
              placeholder="Max"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Features Used Min</label>
            <input
              type="number"
              value={filters.featuresUsedMin}
              onChange={(e) => handleFilterChange('featuresUsedMin', e.target.value)}
              placeholder="Min"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Features Used Max</label>
            <input
              type="number"
              value={filters.featuresUsedMax}
              onChange={(e) => handleFilterChange('featuresUsedMax', e.target.value)}
              placeholder="Max"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Tickets Opened Min</label>
            <input
              type="number"
              value={filters.ticketsOpenedMin}
              onChange={(e) => handleFilterChange('ticketsOpenedMin', e.target.value)}
              placeholder="Min"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Tickets Opened Max</label>
            <input
              type="number"
              value={filters.ticketsOpenedMax}
              onChange={(e) => handleFilterChange('ticketsOpenedMax', e.target.value)}
              placeholder="Max"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Session Duration Min (mins)</label>
            <input
              type="number"
              value={filters.sessionDurationMin}
              onChange={(e) => handleFilterChange('sessionDurationMin', e.target.value)}
              placeholder="Min"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Session Duration Max (mins)</label>
            <input
              type="number"
              value={filters.sessionDurationMax}
              onChange={(e) => handleFilterChange('sessionDurationMax', e.target.value)}
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
