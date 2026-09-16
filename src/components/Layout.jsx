import { logout } from '../utils/auth';
import './Layout.css';

export default function Layout({ user, currentMenu, setCurrentMenu, onLogout, children }) {
  const handleLogout = () => {
    logout();
    onLogout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'requests', label: 'Requests' },
    { id: 'create', label: 'Create Request' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className="layout-container">
      <header className="layout-header">
        <div className="header-brand">
          <h1>FlowOps</h1>
          <span className="header-subtitle">Enterprise Request & Workflow Management Portal</span>
        </div>
        <div className="header-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="layout-body">
        <aside className="layout-sidebar">
          <nav className="sidebar-nav">
            <ul>
              {menuItems.map(item => (
                <li key={item.id}>
                  <button
                    className={`nav-button ${currentMenu === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentMenu(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
}
