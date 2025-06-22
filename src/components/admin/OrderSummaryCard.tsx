import React from 'react';
import { Order } from '../../types/review';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { Calendar, MapPin, User } from 'lucide-react';

interface OrderSummaryCardProps {
  order: Order;
  onView: () => void;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ order, onView }) => {
  const createdDate = new Date(order.createdAt).toLocaleDateString();
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.businessName}</CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin size={14} className="mr-1" />
              <a 
                href={order.businessUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Google Maps
              </a>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <User size={14} className="mr-1" />
              <span>Client ID: {order.clientId.slice(0, 8)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={14} className="mr-1" />
              <span>Ordered: {createdDate}</span>
            </div>
            <div className="text-gray-600">
              Order ID: {order.id.slice(0, 8)}
            </div>
            <div className="text-gray-600">
              Package: {order.packageId}
            </div>
          </div>
          
          <ProgressBar
            value={order.completedReviews}
            max={order.totalReviews}
            showValue
            variant={
              order.status === 'completed'
                ? 'success'
                : order.status === 'in-progress'
                ? 'primary'
                : 'secondary'
            }
          />
          
          <div className="flex justify-between pt-1">
            <Button size="sm" variant="primary" onClick={onView}>
              View Details
            </Button>
            <div className="text-sm text-gray-500 self-center">
              {order.completedReviews} of {order.totalReviews} reviews
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};