import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMarketing, getMarketingStats, getCampaignPerformance } from '../services/api'

function Marketing() {
  const [filters, setFilters] = useState({
    campaignDateFrom: '',
    campaignDateTo: '',
    acquisitionChannel: '',
    funnelStage: '',
    impressionsMin: '',
    impressionsMax: '',
    clicksMin: '',
    clicksMax: '',
    conversionsMin: '',
    conversionsMax: '',
    costMin: '',
    costMax: ''
  })

  const [appliedFilters, setAppliedFilters] = useState({
    campaignDateFrom: '',
    campaignDateTo: '',
    acquisitionChannel: '',
    funnelStage: '',
    impressionsMin: '',
    impressionsMax: '',
    clicksMin: '',
    clicksMax: '',
    conversionsMin: '',
    conversionsMax: '',
    costMin: '',
    costMax: ''
  })

  const { data: marketing, isLoading } = useQuery({
    queryKey: ['marketing', appliedFilters],
    queryFn: async () => {
      const params = { limit: 100 }
      if (appliedFilters.campaignDateFrom) params.campaignDateFrom = appliedFilters.campaignDateFrom
      if (appliedFilters.campaignDateTo) params.campaignDateTo = appliedFilters.campaignDateTo
      if (appliedFilters.acquisitionChannel) params.acquisitionChannel = appliedFilters.acquisitionChannel
      if (appliedFilters.funnelStage) params.funnelStage = appliedFilters.funnelStage
      if (appliedFilters.impressionsMin) params.impressionsMin = appliedFilters.impressionsMin
      if (appliedFilters.impressionsMax) params.impressionsMax = appliedFilters.impressionsMax
      if (appliedFilters.clicksMin) params.clicksMin = appliedFilters.clicksMin
      if (appliedFilters.clicksMax) params.clicksMax = appliedFilters.clicksMax
      if (appliedFilters.conversionsMin) params.conversionsMin = appliedFilters.conversionsMin
      if (appliedFilters.conversionsMax) params.conversionsMax = appliedFilters.conversionsMax
      if (appliedFilters.costMin) params.costMin = appliedFilters.costMin
      if (appliedFilters.costMax) params.costMax = appliedFilters.costMax
      
      const response = await getMarketing(params)
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
      campaignDateFrom: '',
      campaignDateTo: '',
      acquisitionChannel: '',
      funnelStage: '',
      impressionsMin: '',
      impressionsMax: '',
      clicksMin: '',
      clicksMax: '',
      conversionsMin: '',
      conversionsMax: '',
      costMin: '',
      costMax: ''
    }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

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

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Campaign Date From</label>
            <input
              type="date"
              value={filters.campaignDateFrom}
              onChange={(e) => handleFilterChange('campaignDateFrom', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Campaign Date To</label>
            <input
              type="date"
              value={filters.campaignDateTo}
              onChange={(e) => handleFilterChange('campaignDateTo', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Acquisition Channel</label>
            <select
              value={filters.acquisitionChannel}
              onChange={(e) => handleFilterChange('acquisitionChannel', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="organic">Organic</option>
              <option value="paid_search">Paid Search</option>
              <option value="social_media">Social Media</option>
              <option value="email">Email</option>
              <option value="referral">Referral</option>
              <option value="direct">Direct</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Funnel Stage</label>
            <select
              value={filters.funnelStage}
              onChange={(e) => handleFilterChange('funnelStage', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="awareness">Awareness</option>
              <option value="consideration">Consideration</option>
              <option value="conversion">Conversion</option>
              <option value="retention">Retention</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Impressions Min</label>
            <input
              type="number"
              value={filters.impressionsMin}
              onChange={(e) => handleFilterChange('impressionsMin', e.target.value)}
              placeholder="Min"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Impressions Max</label>
            <input
              type="number"
              value={filters.impressionsMax}
              onChange={(e) => handleFilterChange('impressionsMax', e.target.value)}
              placeholder="Max"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Clicks Min</label>
            <input
              type="number"
              value={filters.clicksMin}
              onChange={(e) => handleFilterChange('clicksMin', e.target.value)}
              placeholder="Min"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Clicks Max</label>
            <input
              type="number"
              value={filters.clicksMax}
              onChange={(e) => handleFilterChange('clicksMax', e.target.value)}
              placeholder="Max"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Conversions Min</label>
            <input
              type="number"
              value={filters.conversionsMin}
              onChange={(e) => handleFilterChange('conversionsMin', e.target.value)}
              placeholder="Min"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Conversions Max</label>
            <input
              type="number"
              value={filters.conversionsMax}
              onChange={(e) => handleFilterChange('conversionsMax', e.target.value)}
              placeholder="Max"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Cost Min ($)</label>
            <input
              type="number"
              value={filters.costMin}
              onChange={(e) => handleFilterChange('costMin', e.target.value)}
              placeholder="Min"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Cost Max ($)</label>
            <input
              type="number"
              value={filters.costMax}
              onChange={(e) => handleFilterChange('costMax', e.target.value)}
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
