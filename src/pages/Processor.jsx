import { useState, useMemo } from 'react';
import { ALL_REQUESTS } from '../data/requests';
import Modal from '../components/Modal';
import { getStatusClass, getPriorityClass } from '../utils/badge';
import './Approvals.css'; // Reusing Approvals styles for generic table formatting, but can add specifics in Processor.css

export default function Processor({ user, newRequests = [], updatedRequests = {}, onUpdateRequest }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Added status filter
  const [selectedRequest, setSelectedRequest] = useState(null);

  // processing modal state
  const [processingNotes, setProcessingNotes] = useState('');
  const [notesError, setNotesError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const requestTypes = [
    'Access Request',
    'Equipment Request',
    'Software Request',
    'General Request',
    'Operational Change',
    'Service Request',
    'Account Maintenance'
  ];

  const combinedRequests = useMemo(() => {
    return [...newRequests, ...ALL_REQUESTS].map(req => {
      if (updatedRequests[req.id]) {
        return { ...req, ...updatedRequests[req.id] };
      }
      return req;
    });
  }, [newRequests, updatedRequests]);

  const processorRequests = useMemo(() => {
    // Processors only see Approved and In Progress requests in their queue
    return combinedRequests.filter(req =>
      req.status === 'Approved' || req.status === 'In Progress'
    );
  }, [combinedRequests]);

  const filteredRequests = useMemo(() => {
    return processorRequests.filter(req => {
      const matchesSearch =
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requester.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = priorityFilter === '' || req.priority === priorityFilter;
      const matchesType = typeFilter === '' || req.type === typeFilter;
      const matchesStatus = statusFilter === '' || req.status === statusFilter;

      return matchesSearch && matchesPriority && matchesType && matchesStatus;
    }).sort((a, b) => {
      // Sort by submitted date DESC, then by id DESC
      const dateDiff = new Date(b.submittedDate) - new Date(a.submittedDate);
      if (dateDiff !== 0) return dateDiff;
      return b.id.localeCompare(a.id);
    });
  }, [processorRequests, searchQuery, priorityFilter, typeFilter, statusFilter]);

  if (user?.role !== 'Processor') {
    return (
      <div className="approvals-container">
        <div className="restricted-access" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
          <div className="restricted-icon" aria-hidden="true" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}>🔒</div>
          <h2 className="restricted-title" style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '0.5rem' }}>Access Restricted</h2>
          <p className="restricted-message" style={{ color: '#6b7280' }}>
            You do not have the required permissions to access the Processor module.
          </p>
        </div>
      </div>
    );
  }

  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('');
    setTypeFilter('');
    setStatusFilter('');
  };

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setProcessingNotes('');
    setNotesError('');
    setSuccessMessage('');
  };

  const closeReviewModal = () => {
    setSelectedRequest(null);
    setProcessingNotes('');
    setNotesError('');
  };

  const handleAction = (action) => {
    const now = new Date().toISOString();

    if (action === 'Complete Processing' && !processingNotes.trim()) {
      setNotesError('Resolution Notes are mandatory to complete processing.');
      return;
    }

    const updates = {};
    if (action === 'Start Processing') {
      updates.status = 'In Progress';
      updates.processingStartedBy = user.username;
      updates.processingStartedAt = now;
      if (processingNotes.trim()) {
        updates.processingStartNotes = processingNotes.trim();
      }
    } else if (action === 'Complete Processing') {
      updates.status = 'Completed';
      updates.processingCompletedBy = user.username;
      updates.processingCompletedAt = now;
      updates.resolutionNotes = processingNotes.trim();
    }

    onUpdateRequest(selectedRequest.id, updates);
    setSuccessMessage(`Request ${selectedRequest.id} ${action === 'Start Processing' ? 'started' : 'completed'} successfully.`);
    closeReviewModal();
  };

  return (
    <div className="approvals-container">
      <div className="page-header">
        <h2 className="page-title">Processor Queue</h2>
        <p className="page-subtitle">Manage and fulfill approved requests.</p>
      </div>

      {successMessage && (
        <div className="success-message" role="alert">
          {successMessage}
        </div>
      )}

      <div className="table-section">
        <div className="table-header">
          <div className="filters">
            <input
              type="text"
              placeholder="Search ID, Title, or Requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
              aria-label="Search Approvals"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by Status"
            >
              <option value="">All Eligible Statuses</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
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
                <th>Submitted Date</th>
                <th>Priority</th>
                <th>Requester</th>
                <th>Status</th>
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
                      <span className={`badge ${getPriorityClass(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td>{req.requester}</td>
                    <td>
                      <span className={`badge ${getStatusClass(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => openReviewModal(req)}
                        aria-label={`Manage request ${req.id}`}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No requests found in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <Modal onClose={closeReviewModal} title="Manage Request Fulfilment">
          <div className="review-modal-content">
            <div className="review-details-section">
              <h4>Request Information</h4>
              <div className="request-details">
                <div className="detail-row">
                  <span className="detail-label">Request ID:</span>
                  <span className="detail-value font-medium">{selectedRequest.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Request Type:</span>
                  <span className="detail-value">{selectedRequest.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Title:</span>
                  <span className="detail-value">{selectedRequest.title}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value description-text">{selectedRequest.description}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Submitted Date:</span>
                  <span className="detail-value">{selectedRequest.submittedDate}</span>
                </div>
                {selectedRequest.requiredByDate && (
                  <div className="detail-row">
                    <span className="detail-label">Required By Date:</span>
                    <span className="detail-value">{selectedRequest.requiredByDate}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Priority:</span>
                  <span className="detail-value">
                    <span className={`badge ${getPriorityClass(selectedRequest.priority)}`}>
                      {selectedRequest.priority}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Requester:</span>
                  <span className="detail-value">{selectedRequest.requester}</span>
                </div>
                {selectedRequest.businessJustification && (
                  <div className="detail-row">
                    <span className="detail-label">Business Justification:</span>
                    <span className="detail-value description-text">{selectedRequest.businessJustification}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Current Status:</span>
                  <span className="detail-value">
                    <span className={`badge ${getStatusClass(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </span>
                </div>

                {selectedRequest.approvalAction && (
                  <>
                    <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />
                    <div className="detail-row">
                      <span className="detail-label">Approval Action:</span>
                      <span className="detail-value">{selectedRequest.approvalAction}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Approved By:</span>
                      <span className="detail-value">{selectedRequest.approver}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Approval Comment:</span>
                      <span className="detail-value description-text">{selectedRequest.approvalComment}</span>
                    </div>
                  </>
                )}

                {selectedRequest.processingStartedBy && (
                  <>
                    <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />
                    <div className="detail-row">
                      <span className="detail-label">Processing Started By:</span>
                      <span className="detail-value">{selectedRequest.processingStartedBy}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Started At:</span>
                      <span className="detail-value">{new Date(selectedRequest.processingStartedAt).toLocaleString()}</span>
                    </div>
                    {selectedRequest.processingStartNotes && (
                      <div className="detail-row">
                        <span className="detail-label">Start Notes:</span>
                        <span className="detail-value description-text">{selectedRequest.processingStartNotes}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="approval-form">
              <div className="approval-form-group">
                <label htmlFor="processingNotes" className={`approval-form-label ${selectedRequest.status === 'In Progress' ? 'required' : ''}`}>
                  {selectedRequest.status === 'In Progress' ? 'Resolution Notes' : 'Processing Notes (Optional)'}
                </label>
                <textarea
                  id="processingNotes"
                  value={processingNotes}
                  onChange={(e) => {
                    setProcessingNotes(e.target.value);
                    if (notesError) setNotesError('');
                  }}
                  className="approval-form-textarea"
                  aria-required={selectedRequest.status === 'In Progress'}
                  aria-invalid={!!notesError}
                  placeholder={selectedRequest.status === 'In Progress' ? "Provide resolution notes..." : "Provide any notes before starting..."}
                />
                {notesError && (
                  <span className="error-message" role="alert">{notesError}</span>
                )}
              </div>
              <div className="review-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeReviewModal}
                >
                  Cancel
                </button>
                {selectedRequest.status === 'Approved' && (
                  <button
                    type="button"
                    className="btn-approve"
                    onClick={() => handleAction('Start Processing')}
                  >
                    Start Processing
                  </button>
                )}
                {selectedRequest.status === 'In Progress' && (
                  <button
                    type="button"
                    className="btn-approve"
                    onClick={() => handleAction('Complete Processing')}
                  >
                    Complete Processing
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
