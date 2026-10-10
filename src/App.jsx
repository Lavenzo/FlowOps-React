import { useState } from 'react';
import { getCurrentUser } from './utils/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import CreateRequest from './pages/CreateRequest';
import Approvals from './pages/Approvals';
import Layout from './components/Layout';
import Placeholder from './components/Placeholder';
import './App.css';

function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [currentMenu, setCurrentMenu] = useState('dashboard');

  // Initialize from sessionStorage if available
  const [newRequests, setNewRequests] = useState(() => {
    const saved = sessionStorage.getItem('flowops_new_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [updatedRequests, setUpdatedRequests] = useState(() => {
    const saved = sessionStorage.getItem('flowops_updated_requests');
    return saved ? JSON.parse(saved) : {};
  });

  const handleAddRequest = (req) => {
    setNewRequests(prev => {
      const updated = [req, ...prev];
      sessionStorage.setItem('flowops_new_requests', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateRequest = (id, updates) => {
    setUpdatedRequests(prev => {
      const updated = {
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          ...updates
        }
      };
      sessionStorage.setItem('flowops_updated_requests', JSON.stringify(updated));
      return updated;
    });
  };

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
        return <Dashboard user={user} newRequests={newRequests} updatedRequests={updatedRequests} />;
      case 'requests':
        return <Requests newRequests={newRequests} updatedRequests={updatedRequests} />;
      case 'create':
        return <CreateRequest
          user={user}
          setCurrentMenu={setCurrentMenu}
          onAddRequest={handleAddRequest}
          newRequests={newRequests}
        />;
      case 'approvals':
        return (
          <Approvals
            user={user}
            newRequests={newRequests}
            updatedRequests={updatedRequests}
            onUpdateRequest={handleUpdateRequest}
          />
        );
      case 'reports':
        return <Placeholder title="Reports" />;
      default:
        return <Dashboard user={user} newRequests={newRequests} updatedRequests={updatedRequests} />;
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
