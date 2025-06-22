import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderSummaryCard } from '../../components/admin/OrderSummaryCard';
import { 
  Users, 
  Briefcase, 
  Star, 
  DollarSign, 
  CheckCircle, 
  Clock,
  BarChart, 
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data
const pendingOrders = [
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
    id: 'order-3',
    clientId: 'client-2',
    packageId: 'package-2',
    businessUrl: 'https://maps.google.com/example-business-3',
    businessName: 'Dental Clinic Plus',
    totalReviews: 25,
    completedReviews: 10,
    status: 'in-progress',
    createdAt: new Date('2023-05-01'),
  },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { 
      label: 'Total Clients', 
      value: '24', 
      icon: <Briefcase className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-50',
    },
    { 
      label: 'Active Interns', 
      value: '48', 
      icon: <Users className="h-6 w-6 text-indigo-500" />,
      color: 'bg-indigo-50',
    },
    { 
      label: 'Pending Orders', 
      value: '7', 
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      color: 'bg-yellow-50',
    },
    { 
      label: 'Completed Orders', 
      value: '95', 
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
    },
  ];

  const revenue = [
    { 
      label: 'Monthly Revenue', 
      value: '$4,890', 
      change: '+12.5%',
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
    },
    { 
      label: 'Reviews Delivered', 
      value: '856', 
      change: '+8.2%',
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      color: 'bg-yellow-50',
    },
    { 
      label: 'Avg. Completion Time', 
      value: '5.3 days', 
      change: '-1.2 days',
      icon: <BarChart className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        
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
        
        {/* Revenue Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {revenue.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-full ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <span className={item.change.includes('+') ? 'text-green-600' : 'text-red-600'}>
                      {item.change}
                    </span>
                    <ArrowUpRight className={`h-4 w-4 ml-1 ${item.change.includes('+') ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Pending Orders */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Active Orders</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin/orders')}
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {pendingOrders.map((order) => (
              <OrderSummaryCard 
                key={order.id} 
                order={order}
                onView={() => navigate(`/admin/orders/${order.id}`)}
              />
            ))}
          </div>
        </div>
        
        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Review Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                You have <span className="font-medium">8 reviews</span> waiting for approval
              </p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/admin/reviews/pending')}
              >
                Review Submissions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};