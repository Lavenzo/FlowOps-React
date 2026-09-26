import { useState, useMemo } from 'react';
import { REQUESTS } from '../data/requests';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { getStatusClass, getPriorityClass } from '../utils/badge';
import './Requests.css';

export default function Requests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'submittedDate', direction: 'desc' });

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setTypeFilter('');
  };

  // Get unique request types for the dropdown
  const requestTypes = useMemo(() => {
    const types = new Set(REQUESTS.map(req => req.type));
    return Array.from(types).sort();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const priorityOrder = useMemo(() => ({ 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 }), []);

  const filteredAndSortedRequests = useMemo(() => {
    let filtered = REQUESTS.filter(req => {
      const matchesSearch =
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === '' || req.status === statusFilter;
      const matchesPriority = priorityFilter === '' || req.priority === priorityFilter;
      const matchesType = typeFilter === '' || req.type === typeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }

      // Custom priority sorting
      if (sortConfig.key === 'priority') {
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          if (aPriority < bPriority) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aPriority > bPriority) return sortConfig.direction === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }, [searchQuery, statusFilter, priorityFilter, typeFilter, sortConfig, priorityOrder]);

  return (
    <div className="requests-container">
      <div className="page-header">
        <h2 className="page-title">Requests</h2>
        <p className="page-subtitle">View and manage your submitted requests.</p>
      </div>

      <div className="table-section">
        <div className="table-header">
          <div className="filters">
            <input
              type="text"
              placeholder="Search ID or Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
              aria-label="Search Requests"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by Status"
            >
              <option value="">All Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by Priority"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by Request Type"
            >
              <option value="">All Request Types</option>
              {requestTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <button onClick={handleClearFilters} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Request Type</th>
                <th>Title</th>
                <th
                  className="sortable-header"
                  onClick={() => handleSort('submittedDate')}
                  aria-sort={sortConfig.key === 'submittedDate' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Submitted Date
                  <span className={`sort-icon ${sortConfig.key === 'submittedDate' ? 'active' : ''}`}>
                    {sortConfig.key === 'submittedDate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </th>
                <th
                  className="sortable-header"
                  onClick={() => handleSort('status')}
                  aria-sort={sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Status
                  <span className={`sort-icon ${sortConfig.key === 'status' ? 'active' : ''}`}>
                    {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </th>
                <th
                  className="sortable-header"
                  onClick={() => handleSort('priority')}
                  aria-sort={sortConfig.key === 'priority' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Priority
                  <span className={`sort-icon ${sortConfig.key === 'priority' ? 'active' : ''}`}>
                    {sortConfig.key === 'priority' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </th>
                <th>Requester</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRequests.length > 0 ? (
                filteredAndSortedRequests.map(req => (
                  <tr key={req.id}>
                    <td className="font-medium">{req.id}</td>
                    <td>{req.type}</td>
                    <td>{req.title}</td>
                    <td>{req.submittedDate}</td>
                    <td>
                      <span className={`badge ${getStatusClass(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityClass(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td>{req.requester}</td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => setSelectedRequest(req)}
                        aria-label={`View details for ${req.id}`}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequestDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </div>
  );
}
