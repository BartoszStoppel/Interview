import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Users from './pages/Users'
import Revenue from './pages/Revenue'
import Usage from './pages/Usage'
import Marketing from './pages/Marketing'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="users" element={<Users />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="usage" element={<Usage />} />
        <Route path="marketing" element={<Marketing />} />
      </Route>
    </Routes>
  )
}

export default App
