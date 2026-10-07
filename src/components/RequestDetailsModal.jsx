import Modal from './Modal';
import { getStatusClass, getPriorityClass } from '../utils/badge';

export default function RequestDetailsModal({ request, onClose }) {
  if (!request) return null;

  return (
    <Modal onClose={onClose} title="Request Details">
      <div className="request-details">
        <div className="detail-row">
          <span className="detail-label">Request ID:</span>
          <span className="detail-value font-medium">{request.id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Request Type:</span>
          <span className="detail-value">{request.type}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Title:</span>
          <span className="detail-value">{request.title}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Description:</span>
          <span className="detail-value description-text">{request.description}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Submitted Date:</span>
          <span className="detail-value">{request.submittedDate}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className="detail-value">
            <span className={`badge ${getStatusClass(request.status)}`}>
              {request.status}
            </span>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Priority:</span>
          <span className="detail-value">
            <span className={`badge ${getPriorityClass(request.priority)}`}>
              {request.priority}
            </span>
          </span>
        </div>
        {request.requiredByDate && (
          <div className="detail-row">
            <span className="detail-label">Required By Date:</span>
            <span className="detail-value">{request.requiredByDate}</span>
          </div>
        )}
        {request.businessJustification && (
          <div className="detail-row">
            <span className="detail-label">Business Justification:</span>
            <span className="detail-value description-text">{request.businessJustification}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Requester:</span>
          <span className="detail-value">{request.requester}</span>
        </div>

        {request.approvalAction && (
          <>
            <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />
            <div className="detail-row">
              <span className="detail-label">Approval Status:</span>
              <span className="detail-value">{request.approvalAction}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Actioned By:</span>
              <span className="detail-value">{request.approver}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Approval / Rejection Comment:</span>
              <span className="detail-value description-text">{request.approvalComment}</span>
            </div>
          </>
        )}
      </div>
      <div className="modal-actions">
         <button onClick={onClose} className="btn-secondary">Close</button>
      </div>
    </Modal>
  );
}
