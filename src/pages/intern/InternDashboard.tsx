import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReviewTaskCard } from '../../components/intern/ReviewTaskCard';
import { CheckCircle, DollarSign, Clock, Star, TrendingUp, Award, Target } from 'lucide-react';
import { ReviewTask } from '../../types/review';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const InternDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availableTasks, setAvailableTasks] = useState<ReviewTask[]>([]);
  const [myTasks, setMyTasks] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      // Fetch available tasks (not assigned to anyone)
      const { data: availableData, error: availableError } = await supabase
        .from('review_tasks')
        .select(`
          *,
          orders!inner(business_name, business_url)
        `)
        .is('intern_id', null)
        .eq('status', 'pending')
        .limit(6);

      if (availableError) throw availableError;

      // Fetch my assigned tasks
      const { data: myData, error: myError } = await supabase
        .from('review_tasks')
        .select(`
          *,
          orders!inner(business_name, business_url)
        `)
        .eq('intern_id', user.id)
        .in('status', ['assigned', 'submitted']);

      if (myError) throw myError;

      // Transform data to match ReviewTask interface
      const transformTask = (task: any): ReviewTask => ({
        id: task.id,
        orderId: task.order_id,
        businessUrl: task.orders.business_url,
        businessName: task.orders.business_name,
        internId: task.intern_id,
        status: task.status,
        assignedAt: task.assigned_at ? new Date(task.assigned_at) : undefined,
        completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
        commission: task.commission,
        guidelines: task.guidelines || [],
      });

      setAvailableTasks((availableData || []).map(transformTask));
      setMyTasks((myData || []).map(transformTask));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('review_tasks')
        .update({
          intern_id: user.id,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Refresh tasks
      await fetchTasks();
    } catch (error) {
      console.error('Error claiming task:', error);
      alert('Failed to claim task. Please try again.');
    }
  };

  const stats = [
    { 
      label: 'Completed Reviews', 
      value: '12', 
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
      change: '+3 this week'
    },
    { 
      label: 'Active Tasks', 
      value: myTasks.length.toString(), 
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      color: 'bg-yellow-50',
      change: 'In progress'
    },
    { 
      label: 'Total Earnings', 
      value: '$120', 
      icon: <DollarSign className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-50',
      change: '+$25 this week'
    },
    { 
      label: 'Available Tasks', 
      value: availableTasks.length.toString(), 
      icon: <Star className="h-6 w-6 text-purple-500" />,
      color: 'bg-purple-50',
      change: 'Ready to claim'
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-blue-100 mt-1">Ready to earn some money by writing reviews?</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-sm text-blue-100">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-blue-100">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
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
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Claim New Tasks</h3>
              <p className="text-sm text-green-600 mb-4">Browse and claim available review tasks</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/intern/tasks')}>
                View Tasks
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Track Earnings</h3>
              <p className="text-sm text-blue-600 mb-4">Monitor your commission and payouts</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/intern/earnings')}>
                View Earnings
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Performance</h3>
              <p className="text-sm text-purple-600 mb-4">View your review quality metrics</p>
              <Button variant="outline" size="sm">
                View Stats
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* My Current Tasks */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">My Active Tasks</h2>
            {myTasks.length > 2 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/intern/tasks')}
              >
                View All
              </Button>
            )}
          </div>
          
          {myTasks.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {myTasks.slice(0, 2).map((task) => (
                <ReviewTaskCard 
                  key={task.id} 
                  task={task}
                  onView={() => navigate('/intern/tasks')}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No active tasks</p>
                <p className="text-gray-500 text-sm mt-1">Claim a task from the available list below to start earning.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Available Tasks */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Available Tasks</h2>
            {availableTasks.length > 4 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/intern/tasks')}
              >
                View All
              </Button>
            )}
          </div>
          
          {availableTasks.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {availableTasks.slice(0, 4).map((task) => (
                <ReviewTaskCard 
                  key={task.id} 
                  task={task}
                  onClaim={() => handleClaimTask(task.id)}
                  onView={() => navigate('/intern/tasks')}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No tasks available</p>
                <p className="text-gray-500 text-sm mt-1">Check back soon for new review opportunities.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Guidelines */}
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Reviewer Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2 mt-0.5" />
                  <span>Always visit the business before writing a review</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2 mt-0.5" />
                  <span>Write detailed, authentic reviews about your experience</span>
                </li>
              </ul>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2 mt-0.5" />
                  <span>Include specific details about what you liked</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2 mt-0.5" />
                  <span>Submit clear screenshots as proof of your review</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};