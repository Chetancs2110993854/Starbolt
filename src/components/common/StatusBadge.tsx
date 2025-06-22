import React from 'react';
import { Badge } from '../ui/Badge';
import { ReviewStatus } from '../../types/review';

interface StatusBadgeProps {
  status: ReviewStatus | 'in-progress' | 'completed';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getVariant = () => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'assigned':
        return 'info';
      case 'submitted':
        return 'warning';
      case 'approved':
      case 'completed':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'in-progress':
        return 'primary';
      default:
        return 'secondary';
    }
  };
  
  const getLabel = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'assigned':
        return 'Assigned';
      case 'submitted':
        return 'Submitted';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {getLabel()}
    </Badge>
  );
};