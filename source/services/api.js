import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dashboard
export const getDashboardKPIs = () => api.get('/dashboard/kpis')
export const getUserGrowth = () => api.get('/dashboard/user-growth')
export const getRevenueTrends = () => api.get('/dashboard/revenue-trends')
export const getAcquisitionFunnel = () => api.get('/dashboard/acquisition-funnel')
export const getChurnCohorts = () => api.get('/dashboard/churn-cohorts')
export const getFeatureUsage = () => api.get('/dashboard/feature-usage')
export const getUserLocations = () => api.get('/dashboard/user-locations')

// Users
export const getUsers = (params) => api.get('/users', { params })
export const getUserStats = () => api.get('/users/stats/summary')

// Revenue
export const getRevenue = (params) => api.get('/revenue', { params })
export const getRevenueStats = () => api.get('/revenue/stats/summary')
export const getMonthlyRevenue = () => api.get('/revenue/stats/monthly')

// Usage
export const getUsage = (params) => api.get('/usage', { params })
export const getUsageStats = () => api.get('/usage/stats/summary')

// Marketing
export const getMarketing = (params) => api.get('/marketing', { params })
export const getMarketingStats = () => api.get('/marketing/stats/summary')
export const getCampaignPerformance = () => api.get('/marketing/stats/campaigns')

export default api
