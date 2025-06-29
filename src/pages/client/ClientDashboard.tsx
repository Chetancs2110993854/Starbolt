import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderStatusCard } from '../../components/client/OrderStatusCard';
import { ClientProfileCard } from '../../components/client/ClientProfileCard';
import { DashboardSection } from '../../components/client/DashboardSection';
import { BarChart, Star, TrendingUp, DollarSign, PlusCircle, ShoppingBag, MessageSquare, Settings, Target, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Order {
  id: string;
  business_name: string;
  business_url: string;
  package_id: string;
  total_reviews: number;
  completed_reviews: number;
  status: string;
  created_at: string;
}

export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformOrderForCard = (order: Order) => ({
    id: order.id,
    clientId: user?.id || '',
    packageId: order.package_id,
    businessUrl: order.business_url,
    businessName: order.business_name,
    totalReviews: order.total_reviews,
    completedReviews: order.completed_reviews,
    status: order.status as 'pending' | 'in-progress' | 'completed',
    createdAt: new Date(order.created_at),
  });

  const getPackagePrice = (packageId: string) => {
    switch (packageId) {
      case 'basic': return 99;
      case 'standard': return 199;
      case 'premium': return 349;
      default: return 0;
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + getPackagePrice(order.package_id), 0);
  const totalReviews = orders.reduce((sum, order) => sum + order.completed_reviews, 0);
  const activeOrders = orders.filter(order => order.status === 'pending' || order.status === 'in-progress').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;

  const stats = [
    { 
      label: 'Active Orders', 
      value: activeOrders.toString(), 
      icon: <BarChart className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-50',
      change: activeOrders > 0 ? 'In progress' : 'No active orders'
    },
    { 
      label: 'Total Reviews', 
      value: totalReviews.toString(), 
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      color: 'bg-yellow-50',
      change: `${orders.reduce((sum, order) => sum + order.total_reviews, 0)} ordered`
    },
    { 
      label: 'Completed Orders', 
      value: completedOrders.toString(), 
      icon: <Award className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
      change: completedOrders > 0 ? 'Success!' : 'Getting started'
    },
    { 
      label: 'Total Investment', 
      value: `$${totalSpent}`, 
      icon: <DollarSign className="h-6 w-6 text-purple-500" />,
      color: 'bg-purple-50',
      change: 'Growing your business'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 🚀</h1>
                <p className="text-blue-100 text-lg">Ready to boost your business with authentic reviews?</p>
              </div>
              <Button 
                variant="secondary" 
                leftIcon={<PlusCircle size={18} />}
                onClick={() => navigate('/client/orders/new')}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
              >
                New Order
              </Button>
            </div>
          </div>
        </div>
        
        {/* Client Profile Section */}
        <ClientProfileCard />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/client/orders/new')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Start New Campaign</h3>
              <p className="text-sm text-green-600 mb-4">Launch a new review campaign for your business</p>
              <div className="text-sm font-medium text-green-700">From $99</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/client/orders')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-blue-800 mb-2">Track Progress</h3>
              <p className="text-sm text-blue-600 mb-4">Monitor your active campaigns and results</p>
              <div className="text-sm font-medium text-blue-700">{activeOrders} active</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/client/reviews')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-purple-800 mb-2">View Reviews</h3>
              <p className="text-sm text-purple-600 mb-4">See all your collected reviews and ratings</p>
              <div className="text-sm font-medium text-purple-700">{totalReviews} reviews</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardSection
            title="Orders"
            description="Manage your review campaigns"
            icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
            onClick={() => navigate('/client/orders')}
            stats={[
              { label: 'Active', value: activeOrders.toString(), color: 'text-blue-600' },
              { label: 'Completed', value: completedOrders.toString(), color: 'text-green-600' }
            ]}
          />
          
          <DashboardSection
            title="Reviews"
            description="View and manage reviews"
            icon={<MessageSquare className="h-6 w-6 text-green-600" />}
            onClick={() => navigate('/client/reviews')}
            stats={[
              { label: 'Published', value: totalReviews.toString(), color: 'text-green-600' },
              { label: 'Pending', value: orders.reduce((sum, order) => sum + (order.total_reviews - order.completed_reviews), 0).toString(), color: 'text-yellow-600' }
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/client/orders')}
            >
              View All Orders
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div className="text-gray-500 mt-4">Loading orders...</div>
            </div>
          ) : orders.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => (
                <OrderStatusCard key={order.id} order={transformOrderForCard(order)} />
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to get started?</h3>
                <p className="text-gray-600 mb-6">Launch your first review campaign and watch your business grow!</p>
                <Button
                  variant="primary"
                  leftIcon={<PlusCircle size={16} />}
                  onClick={() => navigate('/client/orders/new')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create Your First Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Success Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Star className="mr-2 h-5 w-5" />
              💡 Tips for Review Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-start">
                  <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3 mt-0.5" />
                  <span><strong>Timing matters:</strong> Space out your review campaigns for natural growth</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3 mt-0.5" />
                  <span><strong>Quality service:</strong> Ensure great customer experience to maintain authentic reviews</span>
                </li>
              </ul>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-start">
                  <Target className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3 mt-0.5" />
                  <span><strong>Monitor progress:</strong> Track your campaigns and respond to all reviews</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3 mt-0.5" />
                  <span><strong>Stay consistent:</strong> Regular campaigns help maintain steady growth</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};