import React from 'react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Available':
    case 'In Stock':
    case 'Completed':
    case 'Returned':
    case 'active':
      return <span className="badge badge-success">{status}</span>;

    case 'Issued':
    case 'In Progress':
      return <span className="badge badge-primary">{status}</span>;

    case 'Under Maintenance':
    case 'Low Stock':
    case 'Scheduled':
      return <span className="badge badge-warning">{status}</span>;

    case 'Damaged':
    case 'Out of Stock':
    case 'Overdue':
    case 'Retired':
    case 'Cancelled':
    case 'inactive':
      return <span className="badge badge-danger">{status}</span>;

    default:
      return <span className="badge badge-neutral">{status}</span>;
  }
};

export const ConditionBadge = ({ condition }) => {
  switch (condition) {
    case 'Excellent':
      return <span className="badge badge-purple">{condition}</span>;
    case 'Good':
      return <span className="badge badge-success">{condition}</span>;
    case 'Fair':
      return <span className="badge badge-warning">{condition}</span>;
    case 'Poor':
    case 'Damaged':
      return <span className="badge badge-danger">{condition}</span>;
    default:
      return <span className="badge badge-neutral">{condition}</span>;
  }
};
