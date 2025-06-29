import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderStatusCard } from '../../components/client/OrderStatusCard';
import { ClientProfileCard } from '../../components/client/ClientProfileCard';
import { DashboardSection } from '../../components/client/DashboardSection';
import { BarChart, Star, TrendingUp, DollarSign, PlusCircle, ShoppingBag, MessageSquare, Settings, Target, Award, Zap, CreditCard, ArrowUpRight } from 'lucide-react';
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
      color: 'from-blue-500 to-blue-600',
      change: activeOrders > 0 ? 'In progress' : 'No active orders'
    },
    { 
      label: 'Total Reviews', 
      value: totalReviews.toString(), 
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      color: 'from-yellow-500 to-orange-500',
      change: `${orders.reduce((sum, order) => sum + order.total_reviews, 0)} ordered`
    },
    { 
      label: 'Completed Orders', 
      value: completedOrders.toString(), 
      icon: <Award className="h-6 w-6 text-green-500" />,
      color: 'from-green-500 to-emerald-500',
      change: completedOrders > 0 ? 'Success!' : 'Getting started'
    },
    { 
      label: 'Total Investment', 
      value: `$${totalSpent}`, 
      icon: <DollarSign className="h-6 w-6 text-purple-500" />,
      color: 'from-purple-500 to-indigo-500',
      change: 'Growing your business'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-3">Welcome back, {user?.name?.split(' ')[0]}! 🚀</h1>
                <p className="text-blue-100 text-xl">Ready to boost your business with authentic reviews?</p>
                <div className="flex items-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    <span className="text-sm">+25% growth this month</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    <span className="text-sm">4.9 avg rating</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                leftIcon={<PlusCircle size={18} />}
                onClick={() => navigate('/client/orders/new')}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
              >
                New Campaign
              </Button>
            </div>
          </div>
        </div>
        
        {/* Client Profile Section */}
        <ClientProfileCard />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate('/client/orders/new')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Start Campaign</h3>
              <p className="text-sm text-green-600 mb-4">Launch a new review campaign</p>
              <div className="text-sm font-medium text-green-700">From $99</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate('/client/orders')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <BarChart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-blue-800 mb-2">Track Progress</h3>
              <p className="text-sm text-blue-600 mb-4">Monitor active campaigns</p>
              <div className="text-sm font-medium text-blue-700">{activeOrders} active</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate('/client/reviews')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-purple-800 mb-2">View Reviews</h3>
              <p className="text-sm text-purple-600 mb-4">See collected reviews</p>
              <div className="text-sm font-medium text-purple-700">{totalReviews} reviews</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate('/client/payments')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-orange-800 mb-2">Payments</h3>
              <p className="text-sm text-orange-600 mb-4">Manage billing & payments</p>
              <div className="text-sm font-medium text-orange-700">${totalSpent} spent</div>
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
              rightIcon={<ArrowUpRight size={16} />}
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
            <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to get started?</h3>
                <p className="text-gray-600 mb-6">Launch your first review campaign and watch your business grow!</p>
                <Button
                  variant="primary"
                  leftIcon={<PlusCircle size={16} />}
                  onClick={() => navigate('/client/orders/new')}
                  className="shadow-lg"
                >
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Success Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
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