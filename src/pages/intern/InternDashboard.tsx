import React from 'react';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReviewTaskCard } from '../../components/intern/ReviewTaskCard';
import { CheckCircle, DollarSign, Clock, Star } from 'lucide-react';
import { ReviewTask } from '../../types/review';
import { useNavigate } from 'react-router-dom';

// Mock data
const availableTasks: ReviewTask[] = [
  {
    id: 'task-1',
    orderId: 'order-1',
    businessUrl: 'https://maps.google.com/example-business',
    businessName: 'Coffee House Downtown',
    status: 'pending',
    commission: 5,
    guidelines: [
      'Mention the friendly staff',
      'Comment on the coffee quality',
      'Describe the atmosphere',
    ],
  },
  {
    id: 'task-2',
    orderId: 'order-1',
    businessUrl: 'https://maps.google.com/example-business',
    businessName: 'Coffee House Downtown',
    status: 'pending',
    commission: 5,
    guidelines: [
      'Mention the friendly staff',
      'Comment on the coffee quality',
      'Describe the atmosphere',
    ],
  },
];

const myTasks: ReviewTask[] = [
  {
    id: '27eb48ad-a69b-454d-b01d-6d89dfc646d3', // 👈 same as in DB
    orderId: '11111111-1111-1111-1111-111111111111', // 👈 same as in DB
    businessUrl: 'https://maps.google.com/mock-coffee',
    businessName: 'Mock Coffee Shop',
    status: 'assigned',
    assignedAt: new Date(), // or new Date('2025-06-19T18:38:36.993Z')
    commission: 5,
    guidelines: [
      'Mention the ambiance',
      'Be honest',
      'Describe your experience'
    ],
  }
];

export const InternDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { 
      label: 'Completed Reviews', 
      value: '12', 
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
    },
    { 
      label: 'Pending Reviews', 
      value: '1', 
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      color: 'bg-yellow-50',
    },
    { 
      label: 'Total Earnings', 
      value: '$120', 
      icon: <DollarSign className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-50',
    },
    { 
      label: 'Available Tasks', 
      value: '2', 
      icon: <Star className="h-6 w-6 text-purple-500" />,
      color: 'bg-purple-50',
    },
  ];

  const handleClaimTask = (taskId: string) => {
    // In a real implementation, this would call an API to claim the task
    console.log('Claiming task:', taskId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
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
        
        {/* My Current Tasks */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">My Current Tasks</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/intern/tasks')}
            >
              View All
            </Button>
          </div>
          
          {myTasks.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {myTasks.map((task) => (
                <ReviewTaskCard 
                  key={task.id} 
                  task={task}
                  onView={() => navigate(`/intern/tasks/${task.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">You don't have any active tasks.</p>
                <p className="text-gray-500 text-sm mt-1">Claim a task from the available list below.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Available Tasks */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Available Tasks</h2>
          </div>
          
          {availableTasks.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {availableTasks.map((task) => (
                <ReviewTaskCard 
                  key={task.id} 
                  task={task}
                  onClaim={() => handleClaimTask(task.id)}
                  onView={() => navigate(`/intern/tasks/${task.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">No tasks available right now.</p>
                <p className="text-gray-500 text-sm mt-1">Check back soon for new opportunities.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Guidelines */}
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-800">Reviewer Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start">
                <Star className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2" fill="currentColor" />
                <span>Always visit the business before writing a review</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2" fill="currentColor" />
                <span>Write detailed, authentic reviews about your experience</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2" fill="currentColor" />
                <span>Include specific details about what you liked</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2" fill="currentColor" />
                <span>Submit clear screenshots as proof of your review</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};