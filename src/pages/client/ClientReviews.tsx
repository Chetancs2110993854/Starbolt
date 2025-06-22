import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StarRating } from '../../components/common/StarRating';
import { ChevronLeft, Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock reviews data
const reviewsData = [
  {
    id: 'REV-001',
    businessName: 'Coffee House Downtown',
    reviewText: 'Amazing coffee and friendly staff! The atmosphere is perfect for working or meeting friends. Highly recommend their signature latte.',
    rating: 5,
    dateSubmitted: '2024-01-15',
    status: 'published',
    orderId: 'ORD-001'
  },
  {
    id: 'REV-002',
    businessName: 'Urban Fitness Center',
    reviewText: 'Great gym with modern equipment and clean facilities. The trainers are knowledgeable and helpful. Worth every penny!',
    rating: 5,
    dateSubmitted: '2024-01-20',
    status: 'published',
    orderId: 'ORD-002'
  },
  {
    id: 'REV-003',
    businessName: 'Dental Clinic Plus',
    reviewText: 'Professional service and comfortable environment. Dr. Smith was gentle and explained everything clearly. Highly recommended!',
    rating: 5,
    dateSubmitted: '2024-01-22',
    status: 'pending',
    orderId: 'ORD-003'
  },
  {
    id: 'REV-004',
    businessName: 'Beauty Salon',
    reviewText: 'Excellent service! The stylist understood exactly what I wanted and delivered perfectly. Clean salon with a relaxing atmosphere.',
    rating: 5,
    dateSubmitted: '2024-01-05',
    status: 'published',
    orderId: 'ORD-005'
  },
  {
    id: 'REV-005',
    businessName: 'Coffee House Downtown',
    reviewText: 'Love this place! Great coffee, cozy atmosphere, and the staff always remembers my order. My go-to spot for morning coffee.',
    rating: 5,
    dateSubmitted: '2024-01-10',
    status: 'published',
    orderId: 'ORD-001'
  }
];

export const ClientReviews: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWriteReview, setShowWriteReview] = useState(false);

  const filteredReviews = reviewsData.filter(review => {
    const matchesSearch = review.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.reviewText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
              onClick={() => navigate('/client')}
              className="mr-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          </div>
          
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowWriteReview(true)}
          >
            Write Review
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Input
                    placeholder="Search reviews..."
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
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Grid */}
        <div className="grid gap-6">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{review.businessName}</CardTitle>
                    <div className="flex items-center mt-1 space-x-2">
                      <StarRating value={review.rating} size="sm" />
                      <span className="text-sm text-gray-500">
                        {new Date(review.dateSubmitted).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {review.reviewText}
                </p>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Order: {review.orderId}</span>
                  <span>Review ID: {review.id}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No reviews found matching your criteria.</p>
            </CardContent>
          </Card>
        )}

        {/* Write Review Modal/Form */}
        {showWriteReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <CardTitle>Write a New Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Business Name"
                  placeholder="Enter business name"
                  fullWidth
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <StarRating value={5} readonly={false} onChange={() => {}} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Text
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={6}
                    placeholder="Write your review here..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowWriteReview(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowWriteReview(false)}
                  >
                    Submit Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {reviewsData.filter(r => r.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published Reviews</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {reviewsData.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {reviewsData.length}
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};