import { useState } from 'react';
import { getCurrentUser } from './utils/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import CreateRequest from './pages/CreateRequest';
import Layout from './components/Layout';
import Placeholder from './components/Placeholder';
import './App.css';

function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [newRequests, setNewRequests] = useState([]);

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
        return <Dashboard newRequests={newRequests} />;
      case 'requests':
        return <Requests newRequests={newRequests} />;
      case 'create':
        return <CreateRequest
          user={user}
          setCurrentMenu={setCurrentMenu}
          onAddRequest={(req) => setNewRequests(prev => [req, ...prev])}
          newRequests={newRequests}
        />;
      case 'approvals':
        return <Placeholder title="Approvals" />;
      case 'reports':
        return <Placeholder title="Reports" />;
      default:
        return <Dashboard newRequests={newRequests} />;
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
