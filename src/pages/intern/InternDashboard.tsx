import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CheckCircle, DollarSign, Clock, Star, TrendingUp, Award, Target, MapPin, ExternalLink, AlertCircle, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';

interface OrderWithTasks {
  id: string;
  business_name: string;
  business_url: string;
  total_reviews: number;
  completed_reviews: number;
  status: string;
  created_at: string;
  tasks: {
    id: string;
    status: string;
    commission: number;
    guidelines: string[];
    intern_id: string | null;
  }[];
  availableTasksCount: number;
  myTasksCount: number;
  totalCommission: number;
}

interface TaskSubmission {
  taskId: string;
  screenshot: File | null;
  reviewContent: string;
}

export const InternDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, TaskSubmission>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrdersWithTasks();
    }
  }, [user]);

  const fetchOrdersWithTasks = async () => {
    if (!user) return;

    try {
      // Fetch orders with their associated tasks
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          business_name,
          business_url,
          total_reviews,
          completed_reviews,
          status,
          created_at,
          review_tasks (
            id,
            status,
            commission,
            guidelines,
            intern_id
          )
        `)
        .in('status', ['pending', 'in-progress'])
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Transform data to include task counts and commission info
      const transformedOrders: OrderWithTasks[] = (ordersData || []).map(order => {
        const tasks = order.review_tasks || [];
        const availableTasksCount = tasks.filter(task => task.status === 'pending' && !task.intern_id).length;
        const myTasksCount = tasks.filter(task => task.intern_id === user.id).length;
        const totalCommission = tasks.reduce((sum, task) => sum + (task.commission || 0), 0);

        return {
          ...order,
          tasks,
          availableTasksCount,
          myTasksCount,
          totalCommission
        };
      });

      // Filter to show orders that have available tasks or tasks assigned to current user
      const relevantOrders = transformedOrders.filter(order => 
        order.availableTasksCount > 0 || order.myTasksCount > 0
      );

      setOrders(relevantOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTask = async (orderId: string) => {
    if (!user) return;

    try {
      setSubmitting(orderId);
      
      // Find an available task for this order
      const order = orders.find(o => o.id === orderId);
      const availableTask = order?.tasks.find(task => task.status === 'pending' && !task.intern_id);
      
      if (!availableTask) {
        throw new Error('No available tasks for this order');
      }

      const { error } = await supabase
        .from('review_tasks')
        .update({
          intern_id: user.id,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', availableTask.id);

      if (error) throw error;

      // Refresh data
      await fetchOrdersWithTasks();
    } catch (error) {
      console.error('Error claiming task:', error);
      setError(error instanceof Error ? error.message : 'Failed to claim task');
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmissionChange = (orderId: string, field: keyof TaskSubmission, value: any) => {
    setSubmissions(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  const handleSubmitProof = async (orderId: string) => {
    if (!user) return;

    const submission = submissions[orderId];
    if (!submission?.screenshot || !submission?.reviewContent) {
      setError('Please provide both screenshot and review content');
      return;
    }

    try {
      setSubmitting(orderId);
      
      // Find the user's assigned task for this order
      const order = orders.find(o => o.id === orderId);
      const myTask = order?.tasks.find(task => task.intern_id === user.id && task.status === 'assigned');
      
      if (!myTask) {
        throw new Error('No assigned task found for this order');
      }

      // Upload screenshot
      const fileName = `${myTask.id}/${Date.now()}-proof.png`;
      const { error: uploadError } = await supabase.storage
        .from('review-proofs')
        .upload(fileName, submission.screenshot);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('review-proofs')
        .getPublicUrl(fileName);
      
      // Create proof record
      const { error: proofError } = await supabase
        .from('review_proofs')
        .insert({
          task_id: myTask.id,
          intern_id: user.id,
          screenshot_url: publicUrl,
          review_content: submission.reviewContent
        });
      
      if (proofError) throw proofError;
      
      // Update task status
      const { error: taskError } = await supabase
        .from('review_tasks')
        .update({ 
          status: 'submitted',
          completed_at: new Date().toISOString()
        })
        .eq('id', myTask.id);
      
      if (taskError) throw taskError;

      // Update order completed_reviews count
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          completed_reviews: (order?.completed_reviews || 0) + 1,
          status: (order?.completed_reviews || 0) + 1 >= (order?.total_reviews || 0) ? 'completed' : 'in-progress'
        })
        .eq('id', orderId);

      if (orderError) throw orderError;
      
      // Clear submission data
      setSubmissions(prev => {
        const newSubmissions = { ...prev };
        delete newSubmissions[orderId];
        return newSubmissions;
      });
      
      // Refresh data
      await fetchOrdersWithTasks();
    } catch (error) {
      console.error('Error submitting proof:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit proof');
    } finally {
      setSubmitting(null);
    }
  };

  const getMyEarnings = () => {
    return orders.reduce((total, order) => {
      const myCompletedTasks = order.tasks.filter(task => 
        task.intern_id === user?.id && task.status === 'submitted'
      );
      return total + myCompletedTasks.reduce((sum, task) => sum + task.commission, 0);
    }, 0);
  };

  const getMyActiveTasks = () => {
    return orders.reduce((total, order) => {
      return total + order.tasks.filter(task => 
        task.intern_id === user?.id && task.status === 'assigned'
      ).length;
    }, 0);
  };

  const getTotalAvailableTasks = () => {
    return orders.reduce((total, order) => total + order.availableTasksCount, 0);
  };

  const stats = [
    { 
      label: 'Available Tasks', 
      value: getTotalAvailableTasks().toString(), 
      icon: <Star className="h-6 w-6 text-purple-500" />,
      color: 'bg-purple-50',
      change: 'Ready to claim'
    },
    { 
      label: 'Active Tasks', 
      value: getMyActiveTasks().toString(), 
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      color: 'bg-yellow-50',
      change: 'In progress'
    },
    { 
      label: 'Pending Earnings', 
      value: `$${getMyEarnings().toFixed(2)}`, 
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
      change: 'Awaiting approval'
    },
    { 
      label: 'Success Rate', 
      value: '98%', 
      icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-50',
      change: 'Excellent performance'
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section with Earnings Focus */}
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">💰 Ready to Earn, {user?.name?.split(' ')[0]}?</h1>
                <p className="text-green-100 text-lg">Turn your reviews into real money • Quick tasks • Instant payouts</p>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-2xl font-bold">${getMyEarnings().toFixed(2)}</div>
                  <div className="text-sm text-green-100">Pending</div>
                </div>
                <div className="text-center bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{getTotalAvailableTasks()}</div>
                  <div className="text-sm text-green-100">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
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
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Start Earning Now</h3>
              <p className="text-sm text-green-600 mb-4">Claim tasks and start making money immediately</p>
              <div className="text-2xl font-bold text-green-700 mb-2">${getTotalAvailableTasks() * 5} potential</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-blue-800 mb-2">Track Progress</h3>
              <p className="text-sm text-blue-600 mb-4">Monitor your active tasks and earnings</p>
              <div className="text-2xl font-bold text-blue-700 mb-2">{getMyActiveTasks()} active</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-purple-800 mb-2">Quality Bonus</h3>
              <p className="text-sm text-purple-600 mb-4">Earn extra for high-quality reviews</p>
              <div className="text-2xl font-bold text-purple-700 mb-2">+20% bonus</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Available Orders */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">💼 Available Orders</h2>
            <div className="text-sm text-gray-500">
              {orders.length} orders • {getTotalAvailableTasks()} tasks available
            </div>
          </div>
          
          {orders.length > 0 ? (
            <div className="grid gap-6">
              {orders.map((order) => {
                const myTask = order.tasks.find(task => task.intern_id === user?.id && task.status === 'assigned');
                const hasAvailableTasks = order.availableTasksCount > 0;
                const submission = submissions[order.id];
                
                return (
                  <Card key={order.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-gray-900 mb-2">{order.business_name}</CardTitle>
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <MapPin size={14} className="mr-1" />
                            <a 
                              href={order.business_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View on Google Maps
                            </a>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">{order.availableTasksCount}</div>
                              <div className="text-xs text-blue-500">Available</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">${(order.totalCommission / order.total_reviews).toFixed(2)}</div>
                              <div className="text-xs text-green-500">Per Review</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-lg font-bold text-purple-600">{order.myTasksCount}</div>
                              <div className="text-xs text-purple-500">My Tasks</div>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                              <div className="text-lg font-bold text-yellow-600">${(order.myTasksCount * (order.totalCommission / order.total_reviews)).toFixed(2)}</div>
                              <div className="text-xs text-yellow-500">My Earnings</div>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <ProgressBar
                          value={order.completed_reviews}
                          max={order.total_reviews}
                          showValue
                          label="Overall Progress"
                          variant="primary"
                        />
                        
                        {myTask && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              You have an active task for this order
                            </h4>
                            
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Guidelines:</h5>
                                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                                  {myTask.guidelines.map((guideline, index) => (
                                    <li key={index}>{guideline}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  label="Upload Review Screenshot"
                                  onChange={(e) => handleSubmissionChange(order.id, 'screenshot', e.target.files?.[0] || null)}
                                  fullWidth
                                />
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Review Content
                                  </label>
                                  <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Paste your review text here..."
                                    value={submission?.reviewContent || ''}
                                    onChange={(e) => handleSubmissionChange(order.id, 'reviewContent', e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <Button 
                                variant="primary" 
                                onClick={() => handleSubmitProof(order.id)}
                                isLoading={submitting === order.id}
                                leftIcon={<Upload size={16} />}
                                disabled={!submission?.screenshot || !submission?.reviewContent}
                                fullWidth
                              >
                                Submit Proof & Earn ${myTask.commission.toFixed(2)}
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            rightIcon={<ExternalLink size={16} />}
                            onClick={() => window.open(order.business_url, '_blank', 'noopener,noreferrer')}
                          >
                            Visit Business
                          </Button>
                          
                          {hasAvailableTasks && !myTask && (
                            <Button 
                              variant="primary" 
                              onClick={() => handleClaimTask(order.id)}
                              isLoading={submitting === order.id}
                              leftIcon={<DollarSign size={16} />}
                            >
                              Claim Task • Earn ${(order.totalCommission / order.total_reviews).toFixed(2)}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-12 text-center">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No Orders Available</h3>
                <p className="text-gray-500">Check back soon for new earning opportunities!</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Guidelines */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Star className="mr-2 h-5 w-5" />
              💡 Pro Tips for Maximum Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3 mt-0.5" />
                  <span><strong>Visit first:</strong> Always visit the business before writing your review</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3 mt-0.5" />
                  <span><strong>Be specific:</strong> Mention details about your experience, staff, atmosphere</span>
                </li>
              </ul>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3 mt-0.5" />
                  <span><strong>Quality screenshots:</strong> Clear, full-screen captures get approved faster</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3 mt-0.5" />
                  <span><strong>Quick turnaround:</strong> Submit within 24 hours for bonus consideration</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};