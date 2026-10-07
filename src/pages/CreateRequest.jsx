import { useState } from 'react';
import './CreateRequest.css';
import { ALL_REQUESTS } from '../data/requests';
import RequestDetailsModal from '../components/RequestDetailsModal';

export default function CreateRequest({ user, setCurrentMenu, onAddRequest, newRequests }) {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    priority: '',
    requiredByDate: '',
    businessJustification: ''
  });

  const [errors, setErrors] = useState({});
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const requestTypes = [
    'Access Request',
    'Equipment Request',
    'Software Request',
    'General Request'
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const validate = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = 'Request Type is required.';
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.priority) newErrors.priority = 'Priority is required.';
    if (!formData.businessJustification.trim()) newErrors.businessJustification = 'Business Justification is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const generateRequestId = () => {
    // Combine mock data and new requests to find the max ID
    const allReqs = [...ALL_REQUESTS, ...newRequests];
    let maxNum = 0;

    for (const req of allReqs) {
      // Assuming format REQ-YYYY-NNN
      const parts = req.id.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }

    const nextNum = maxNum + 1;
    // Assuming format REQ-2026-041 (if year is 2026, or we can just stick to 2026 to match mock data)
    // To match format securely, let's use 2026 as that's what the mock data uses heavily, or current year.
    // The user's prompt says: REQ-2026-011. Let's use 2026.
    const paddedNum = nextNum.toString().padStart(3, '0');
    return `REQ-2026-${paddedNum}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const newId = generateRequestId();
      const today = new Date().toISOString().split('T')[0];

      const newRequest = {
        id: newId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        submittedDate: today,
        status: 'Pending Approval',
        priority: formData.priority,
        requester: user?.username || 'unknown_user', // using username to match mock data like 'employee01'
        requiredByDate: formData.requiredByDate,
        businessJustification: formData.businessJustification
      };

      onAddRequest(newRequest);
      setSubmittedRequest(newRequest);
    }
  };

  const handleCancel = () => {
    setCurrentMenu('requests');
  };

  if (user?.role !== 'Employee') {
    return (
      <div className="create-request-container">
        <div className="restricted-access" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
          <div className="restricted-icon" aria-hidden="true" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}>🔒</div>
          <h2 className="restricted-title" style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '0.5rem' }}>Access Restricted</h2>
          <p className="restricted-message" style={{ color: '#6b7280' }}>
            You do not have the required permissions to create requests.
          </p>
        </div>
      </div>
    );
  }

  if (submittedRequest) {
    return (
      <div className="create-request-container">
        <h2 className="page-title">Create Request</h2>
        <div className="success-card">
          <div className="success-icon">✓</div>
          <div className="success-message">
            Request {submittedRequest.id} submitted successfully.
          </div>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              View Request
            </button>
            <button className="btn-secondary" onClick={() => setCurrentMenu('requests')}>
              Go to Requests
            </button>
          </div>
        </div>

        {showModal && (
          <RequestDetailsModal
            request={submittedRequest}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="create-request-container">
      <div className="page-header">
        <h2 className="page-title">Create Request</h2>
        <p className="page-subtitle">Submit a new request for processing and approval.</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="type" className="form-label required">Request Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-select"
              aria-required="true"
              aria-invalid={!!errors.type}
            >
              <option value="">Select a request type...</option>
              {requestTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.type && <span className="error-message" role="alert">{errors.type}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label required">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              aria-required="true"
              aria-invalid={!!errors.title}
            />
            {errors.title && <span className="error-message" role="alert">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label required">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              aria-required="true"
              aria-invalid={!!errors.description}
            />
            {errors.description && <span className="error-message" role="alert">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="priority" className="form-label required">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-select"
              aria-required="true"
              aria-invalid={!!errors.priority}
            >
              <option value="">Select a priority...</option>
              {priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.priority && <span className="error-message" role="alert">{errors.priority}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="requiredByDate" className="form-label">Required By Date</label>
            <input
              type="date"
              id="requiredByDate"
              name="requiredByDate"
              value={formData.requiredByDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessJustification" className="form-label required">Business Justification</label>
            <textarea
              id="businessJustification"
              name="businessJustification"
              value={formData.businessJustification}
              onChange={handleChange}
              className="form-textarea"
              aria-required="true"
              aria-invalid={!!errors.businessJustification}
            />
            {errors.businessJustification && <span className="error-message" role="alert">{errors.businessJustification}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Submit Request</button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
