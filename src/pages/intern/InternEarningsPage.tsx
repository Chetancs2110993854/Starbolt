import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ChevronLeft, DollarSign, TrendingUp, Clock, CheckCircle, Download, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Mock earnings data
const earningsData = [
  {
    id: 'earning-1',
    businessName: 'Coffee House Downtown',
    taskId: 'task-1',
    amount: 5.00,
    status: 'paid',
    completedAt: '2024-01-15',
    paidAt: '2024-01-20',
  },
  {
    id: 'earning-2',
    businessName: 'Urban Fitness Center',
    taskId: 'task-2',
    amount: 7.50,
    status: 'pending',
    completedAt: '2024-01-20',
    paidAt: null,
  },
  {
    id: 'earning-3',
    businessName: 'Dental Clinic Plus',
    taskId: 'task-3',
    amount: 6.00,
    status: 'approved',
    completedAt: '2024-01-22',
    paidAt: null,
  },
];

export const InternEarningsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const totalEarnings = earningsData.reduce((sum, earning) => sum + earning.amount, 0);
  const paidEarnings = earningsData.filter(e => e.status === 'paid').reduce((sum, earning) => sum + earning.amount, 0);
  const pendingEarnings = earningsData.filter(e => e.status !== 'paid').reduce((sum, earning) => sum + earning.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'approved':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Under Review';
      default:
        return status;
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
          </div>
          
          <Button variant="outline" leftIcon={<Download size={16} />}>
            Export Report
          </Button>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Earnings</p>
                  <p className="text-3xl font-bold text-green-700">${totalEarnings.toFixed(2)}</p>
                  <p className="text-sm text-green-500 mt-1">All time</p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Paid Out</p>
                  <p className="text-3xl font-bold text-blue-700">${paidEarnings.toFixed(2)}</p>
                  <p className="text-sm text-blue-500 mt-1">Available in account</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-700">${pendingEarnings.toFixed(2)}</p>
                  <p className="text-sm text-yellow-500 mt-1">Processing</p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Performance This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">8</div>
                <div className="text-sm text-gray-600">Reviews Completed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">$52.50</div>
                <div className="text-sm text-gray-600">Month Earnings</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">4.9</div>
                <div className="text-sm text-gray-600">Quality Rating</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">98%</div>
                <div className="text-sm text-gray-600">Approval Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings History */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {earningsData.map((earning) => (
                    <tr key={earning.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {earning.businessName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {earning.taskId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${earning.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(earning.status)}>
                          {getStatusLabel(earning.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(earning.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {earning.paidAt ? new Date(earning.paidAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payout Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">How Payouts Work</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Reviews are paid after approval (typically 2-3 business days)</li>
                  <li>• Minimum payout threshold: $10.00</li>
                  <li>• Payouts are processed weekly on Fridays</li>
                  <li>• Payments are sent via PayPal or bank transfer</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Payment Method</h5>
                  <p className="text-sm text-gray-600">PayPal: john.doe@email.com</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Update Payment Method
                  </Button>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Next Payout</h5>
                  <p className="text-sm text-gray-600">Friday, January 26, 2024</p>
                  <p className="text-sm font-medium text-green-600">${pendingEarnings.toFixed(2)} pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};