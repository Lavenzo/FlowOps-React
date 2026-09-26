import { useState, useMemo } from 'react';
import { REQUESTS } from '../data/requests';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { getStatusClass, getPriorityClass } from '../utils/badge';
import './Dashboard.css';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Filtered requests based on search and dropdowns
  const filteredRequests = useMemo(() => {
    return REQUESTS.filter(req => {
      const matchesSearch =
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === '' || req.status === statusFilter;
      const matchesPriority = priorityFilter === '' || req.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchQuery, statusFilter, priorityFilter]);

  // Summary counts based on ALL requests (not filtered ones)
  const summaryCounts = useMemo(() => {
    return {
      open: REQUESTS.filter(r => ['Draft', 'Submitted', 'In Progress'].includes(r.status)).length,
      pending: REQUESTS.filter(r => r.status === 'Pending Approval').length,
      inProgress: REQUESTS.filter(r => r.status === 'In Progress').length,
      completed: REQUESTS.filter(r => r.status === 'Completed').length,
    };
  }, []);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const openModal = (request) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="dashboard-container">
      <h2 className="page-title">Dashboard</h2>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <div className="card-title">My Open Requests</div>
          <div className="card-value">{summaryCounts.open}</div>
        </div>
        <div className="card">
          <div className="card-title">Pending Approval</div>
          <div className="card-value">{summaryCounts.pending}</div>
        </div>
        <div className="card">
          <div className="card-title">In Progress</div>
          <div className="card-value">{summaryCounts.inProgress}</div>
        </div>
        <div className="card">
          <div className="card-title">Completed</div>
          <div className="card-value">{summaryCounts.completed}</div>
        </div>
      </div>

      {/* Requests Table Section */}
      <div className="table-section">
        <div className="table-header">
          <h3>Recent Requests</h3>
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
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
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
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map(req => (
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
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => openModal(req)}
                        aria-label={`View details for ${req.id}`}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No requests match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal request={selectedRequest} onClose={closeModal} />
    </div>
  );
}
