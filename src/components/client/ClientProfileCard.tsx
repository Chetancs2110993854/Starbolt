import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ClientProfileCard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/client/profile')}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'Client Name'}</h3>
              <p className="text-sm text-gray-500">{user?.email || 'client@example.com'}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role || 'Client'} Account</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">Account Status</div>
              <div className="text-xs text-green-600 font-medium">Active</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">5</div>
              <div className="text-xs text-gray-500">Orders</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">32</div>
              <div className="text-xs text-gray-500">Reviews</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">4.8</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};