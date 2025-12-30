import { Outlet, NavLink } from 'react-router-dom'
import './Layout.css'

function Layout() {
  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <h2>📊 Analytics</h2>
        </div>
        <ul className="nav-links">
          <li>
            <NavLink to="/" end>Overview</NavLink>
          </li>
          <li>
            <NavLink to="/users">Users</NavLink>
          </li>
          <li>
            <NavLink to="/revenue">Revenue</NavLink>
          </li>
          <li>
            <NavLink to="/usage">Usage</NavLink>
          </li>
          <li>
            <NavLink to="/marketing">Marketing</NavLink>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
