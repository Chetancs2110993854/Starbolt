import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { Order } from '../../types/review';
import { Calendar, MapPin } from 'lucide-react';

interface OrderStatusCardProps {
  order: Order;
}

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({ order }) => {
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
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>Ordered on: {createdDate}</span>
            </div>
            <div>
              Order ID: {order.id.slice(0, 8)}
            </div>
          </div>
          
          <ProgressBar
            value={order.completedReviews}
            max={order.totalReviews}
            showValue
            label="Review Progress"
            variant={
              order.status === 'completed'
                ? 'success'
                : order.status === 'in-progress'
                ? 'primary'
                : 'secondary'
            }
          />
          
          <div className="flex justify-between text-sm pt-2">
            <span>
              <span className="font-medium">{order.completedReviews}</span> of{' '}
              <span className="font-medium">{order.totalReviews}</span> reviews completed
            </span>
            <span className="text-gray-500">
              {Math.round((order.completedReviews / order.totalReviews) * 100)}% complete
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};