import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { 
  ChevronLeft, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Mock payment data
const paymentData = [
  {
    id: 'PAY-001',
    type: 'payment',
    description: 'Premium Review Package',
    amount: -349.00,
    status: 'completed',
    date: '2024-01-22',
    method: 'Credit Card',
    reference: 'ORD-003'
  },
  {
    id: 'PAY-002',
    type: 'payment',
    description: 'Standard Review Package',
    amount: -199.00,
    status: 'completed',
    date: '2024-01-20',
    method: 'PayPal',
    reference: 'ORD-002'
  },
  {
    id: 'PAY-003',
    type: 'refund',
    description: 'Partial Refund - Order Cancellation',
    amount: 99.00,
    status: 'completed',
    date: '2024-01-18',
    method: 'Credit Card',
    reference: 'ORD-001'
  },
  {
    id: 'PAY-004',
    type: 'payment',
    description: 'Basic Review Package',
    amount: -99.00,
    status: 'pending',
    date: '2024-01-15',
    method: 'Bank Transfer',
    reference: 'ORD-004'
  }
];

const paymentMethods = [
  {
    id: 'card-1',
    type: 'visa',
    last4: '4242',
    expiry: '12/26',
    isDefault: true
  },
  {
    id: 'card-2',
    type: 'mastercard',
    last4: '8888',
    expiry: '09/25',
    isDefault: false
  }
];

export const ClientPayments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const totalSpent = paymentData
    .filter(p => p.type === 'payment' && p.status === 'completed')
    .reduce((sum, p) => sum + Math.abs(p.amount), 0);

  const totalRefunds = paymentData
    .filter(p => p.type === 'refund' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = paymentData
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Math.abs(p.amount), 0);

  const filteredPayments = paymentData.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCardIcon = (type: string) => {
    return <CreditCard className="h-6 w-6 text-gray-600" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft size={16} />}
              onClick={() => navigate('/client')}
              className="mr-4"
            >
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-500 mt-1">Manage your payments and billing</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" leftIcon={<Download size={16} />}>
              Export
            </Button>
            <Button variant="primary" leftIcon={<Plus size={16} />}>
              Add Payment Method
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Spent</p>
                  <p className="text-3xl font-bold text-blue-900">${totalSpent.toFixed(2)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12.5% from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Refunds</p>
                  <p className="text-3xl font-bold text-green-900">${totalRefunds.toFixed(2)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">-2.1% from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <ArrowDownLeft className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">${pendingPayments.toFixed(2)}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-600">Processing</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-500 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg. Order</p>
                  <p className="text-3xl font-bold text-purple-900">${(totalSpent / paymentData.filter(p => p.type === 'payment').length).toFixed(2)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+8.2% from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Methods</CardTitle>
              <Button variant="outline" size="sm" leftIcon={<Plus size={16} />}>
                Add New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    method.isDefault
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    {getCardIcon(method.type)}
                    {method.isDefault && (
                      <Badge variant="primary" size="sm">Default</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">•••• •••• •••• {method.last4}</p>
                    <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Input
                    placeholder="Search transactions..."
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
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              
              <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${
                            payment.type === 'payment' 
                              ? 'bg-red-100' 
                              : 'bg-green-100'
                          }`}>
                            {payment.type === 'payment' ? (
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{payment.description}</p>
                            <p className="text-sm text-gray-500">{payment.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${
                          payment.amount > 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {payment.amount > 0 ? '+' : ''}${Math.abs(payment.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className="ml-2">{getStatusBadge(payment.status)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Billing Address</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>123 Business Street</p>
                    <p>Suite 100</p>
                    <p>New York, NY 10001</p>
                    <p>United States</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Update Address
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tax Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Tax ID: 12-3456789</p>
                    <p>VAT Number: US123456789</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Update Tax Info
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};