import React from 'react';
import { ReviewPackage } from '../../types/review';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Star, Check } from 'lucide-react';

interface OrderPackageCardProps {
  packageData: ReviewPackage;
  onSelect: (pkg: ReviewPackage) => void;
  isSelected?: boolean;
}

export const OrderPackageCard: React.FC<OrderPackageCardProps> = ({ 
  packageData, 
  onSelect,
  isSelected = false,
}) => {
  return (
    <Card 
      className={`transition-all duration-200 border-2 ${
        isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'
      }`}
    >
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <span>{packageData.name}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <span className="text-3xl font-bold">${packageData.price}</span>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
            ))}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          {packageData.description}
        </p>
        
        <ul className="space-y-2">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span className="text-sm">{packageData.reviewCount} 5-star reviews</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span className="text-sm">Unique reviewers</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span className="text-sm">Gradual posting timeline</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span className="text-sm">Progress tracking</span>
          </li>
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          fullWidth 
          variant={isSelected ? 'primary' : 'outline'}
          onClick={() => onSelect(packageData)}
        >
          {isSelected ? 'Selected' : 'Select Package'}
        </Button>
      </CardFooter>
    </Card>
  );
};