import { useQuery } from '@tanstack/react-query'
import { getUsers, getUserStats } from '../services/api'

function Users() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await getUsers({ limit: 100 })
      return response.data
    }
  })

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
