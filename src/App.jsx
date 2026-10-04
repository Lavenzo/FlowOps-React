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

import { useEffect } from 'react';

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

  // Persist to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem('flowops_new_requests', JSON.stringify(newRequests));
  }, [newRequests]);

  useEffect(() => {
    sessionStorage.setItem('flowops_updated_requests', JSON.stringify(updatedRequests));
  }, [updatedRequests]);

  const handleUpdateRequest = (id, updates) => {
    setUpdatedRequests(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...updates
      }
    }));
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
        return <Dashboard newRequests={newRequests} updatedRequests={updatedRequests} />;
      case 'requests':
        return <Requests newRequests={newRequests} updatedRequests={updatedRequests} />;
      case 'create':
        return <CreateRequest
          user={user}
          setCurrentMenu={setCurrentMenu}
          onAddRequest={(req) => setNewRequests(prev => [req, ...prev])}
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
        return <Dashboard newRequests={newRequests} updatedRequests={updatedRequests} />;
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
