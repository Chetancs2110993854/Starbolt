import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Alert } from '../../components/ui/Alert';
import { ChevronLeft, Search, Filter, DollarSign, MapPin, ExternalLink, Upload, Clock, Star, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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

export const InternTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, TaskSubmission>>({});
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrdersWithTasks();
    }
  }, [user]);

  const fetchOrdersWithTasks = async () => {
    if (!user) return;

    try {
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

      const relevantOrders = transformedOrders.filter(order => 
        order.availableTasksCount > 0 || order.myTasksCount > 0
      );

      setOrders(relevantOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTask = async (orderId: string) => {
    if (!user) return;

    try {
      setSubmitting(orderId);
      
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
      
      const order = orders.find(o => o.id === orderId);
      const myTask = order?.tasks.find(task => task.intern_id === user.id && task.status === 'assigned');
      
      if (!myTask) {
        throw new Error('No assigned task found for this order');
      }

      const fileName = `${myTask.id}/${Date.now()}-proof.png`;
      const { error: uploadError } = await supabase.storage
        .from('review-proofs')
        .upload(fileName, submission.screenshot);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('review-proofs')
        .getPublicUrl(fileName);
      
      const { error: proofError } = await supabase
        .from('review_proofs')
        .insert({
          task_id: myTask.id,
          intern_id: user.id,
          screenshot_url: publicUrl,
          review_content: submission.reviewContent
        });
      
      if (proofError) throw proofError;
      
      const { error: taskError } = await supabase
        .from('review_tasks')
        .update({ 
          status: 'submitted',
          completed_at: new Date().toISOString()
        })
        .eq('id', myTask.id);
      
      if (taskError) throw taskError;

      const { error: orderError } = await supabase
        .from('orders')
        .update({
          completed_reviews: (order?.completed_reviews || 0) + 1,
          status: (order?.completed_reviews || 0) + 1 >= (order?.total_reviews || 0) ? 'completed' : 'in-progress'
        })
        .eq('id', orderId);

      if (orderError) throw orderError;
      
      setSubmissions(prev => {
        const newSubmissions = { ...prev };
        delete newSubmissions[orderId];
        return newSubmissions;
      });
      
      await fetchOrdersWithTasks();
    } catch (error) {
      console.error('Error submitting proof:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit proof');
    } finally {
      setSubmitting(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'available' && order.availableTasksCount > 0) ||
      (statusFilter === 'claimed' && order.myTasksCount > 0);
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft size={16} />}
              onClick={() => navigate('/intern')}
              className="mr-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Review Tasks</h1>
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Input
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                    fullWidth
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Tasks</option>
                  <option value="available">Available</option>
                  <option value="claimed">My Tasks</option>
                </select>
              </div>
              
              <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders.reduce((total, order) => total + order.availableTasksCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Available Tasks</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.reduce((total, order) => total + order.myTasksCount, 0)}
              </div>
              <div className="text-sm text-gray-600">My Active Tasks</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                ${orders.reduce((total, order) => {
                  const myTasks = order.tasks.filter(task => task.intern_id === user?.id);
                  return total + myTasks.reduce((sum, task) => sum + task.commission, 0);
                }, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Potential Earnings</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${((orders.reduce((total, order) => total + order.availableTasksCount, 0)) * 5).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Available Earnings</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const myTask = order.tasks.find(task => task.intern_id === user?.id && task.status === 'assigned');
              const hasAvailableTasks = order.availableTasksCount > 0;
              const submission = submissions[order.id];
              
              return (
                <Card key={order.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
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
            })
          ) : (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-12 text-center">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No Tasks Found</h3>
                <p className="text-gray-500">Try adjusting your search or filters to find available tasks.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};