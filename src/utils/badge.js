export const getStatusClass = (status) => {
  const map = {
    'Draft': 'badge-gray',
    'Submitted': 'badge-blue',
    'Pending Approval': 'badge-yellow',
    'Approved': 'badge-green',
    'In Progress': 'badge-purple',
    'Completed': 'badge-green',
    'Rejected': 'badge-red',
  };
  return map[status] || 'badge-gray';
};

export const getPriorityClass = (priority) => {
  const map = {
    'Low': 'badge-gray',
    'Medium': 'badge-blue',
    'High': 'badge-orange',
    'Critical': 'badge-red',
  };
  return map[priority] || 'badge-gray';
};
