import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderStatusCard } from '../../components/client/OrderStatusCard';
import { ClientProfileCard } from '../../components/client/ClientProfileCard';
import { DashboardSection } from '../../components/client/DashboardSection';
import { BarChart, Star, TrendingUp, DollarSign, PlusCircle, ShoppingBag, MessageSquare, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data
const recentOrders = [
  {
    id: 'order-1',
    clientId: 'client-1',
    packageId: 'package-1',
    businessUrl: 'https://maps.google.com/example-business',
    businessName: 'Coffee House Downtown',
    totalReviews: 10,
    completedReviews: 7,
    status: 'in-progress',
    createdAt: new Date('2023-05-15'),
  },
  {
    id: 'order-2',
    clientId: 'client-1',
    packageId: 'package-2',
    businessUrl: 'https://maps.google.com/example-business-2',
    businessName: 'Urban Fitness Center',
    totalReviews: 25,
    completedReviews: 25,
    status: 'completed',
    createdAt: new Date('2023-04-01'),
  },
];

export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { 
      label: 'Active Orders', 
      value: '1', 
      icon: <BarChart className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-50',
    },
    { 
      label: 'Total Reviews', 
      value: '32', 
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      color: 'bg-yellow-50',
    },
    { 
      label: 'Rating Improvement', 
      value: '+0.8', 
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
    },
    { 
      label: 'Total Spent', 
      value: '$249', 
      icon: <DollarSign className="h-6 w-6 text-purple-500" />,
      color: 'bg-purple-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Button 
            variant="primary" 
            leftIcon={<PlusCircle size={18} />}
            onClick={() => navigate('/client/orders/new')}
          >
            New Order
          </Button>
        </div>
        
        {/* Client Profile Section */}
        <ClientProfileCard />
        
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color} mr-4`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardSection
            title="Orders"
            description="Manage your review orders"
            icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
            onClick={() => navigate('/client/orders')}
            stats={[
              { label: 'Active', value: '1', color: 'text-blue-600' },
              { label: 'Completed', value: '4', color: 'text-green-600' }
            ]}
          />
          
          <DashboardSection
            title="Reviews"
            description="View and manage reviews"
            icon={<MessageSquare className="h-6 w-6 text-green-600" />}
            onClick={() => navigate('/client/reviews')}
            stats={[
              { label: 'Published', value: '28', color: 'text-green-600' },
              { label: 'Pending', value: '4', color: 'text-yellow-600' }
            ]}
          />
          
          <DashboardSection
            title="Settings"
            description="Account and preferences"
            icon={<Settings className="h-6 w-6 text-gray-600" />}
            onClick={() => navigate('/client/settings')}
            stats={[
              { label: 'Notifications', value: 'On', color: 'text-blue-600' },
              { label: 'Security', value: 'Good', color: 'text-green-600' }
            ]}
          />
        </div>
        
        {/* Recent Orders */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/client/orders')}
            >
              View All
            </Button>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {recentOrders.map((order) => (
              <OrderStatusCard key={order.id} order={order} />
            ))}
          </div>
        </div>
        
        {/* Tips */}
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-800">Tips for Better Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start">
                <Star className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2" fill="currentColor" />
                <span>Encourage reviewers to mention specific experiences with your business</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2" fill="currentColor" />
                <span>Respond to all reviews, both positive and negative</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2" fill="currentColor" />
                <span>Keep your Google Business profile updated with current information</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};