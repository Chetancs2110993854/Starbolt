import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChevronRight } from 'lucide-react';

interface DashboardSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  stats?: {
    label: string;
    value: string | number;
    color?: string;
  }[];
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  description,
  icon,
  onClick,
  stats = []
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      
      {stats.length > 0 && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-lg font-semibold ${stat.color || 'text-gray-900'}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};