import { useState } from 'react';
import { getCurrentUser } from './utils/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Placeholder from './components/Placeholder';
import './App.css';

function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [currentMenu, setCurrentMenu] = useState('dashboard');

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentMenu('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Determine what to render based on currentMenu
  const renderContent = () => {
    switch (currentMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'requests':
        return <Placeholder title="Requests" />;
      case 'create':
        return <Placeholder title="Create Request" />;
      case 'approvals':
        return <Placeholder title="Approvals" />;
      case 'reports':
        return <Placeholder title="Reports" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      user={user}
      currentMenu={currentMenu}
      setCurrentMenu={setCurrentMenu}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
