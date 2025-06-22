export type ReviewStatus = 'pending' | 'assigned' | 'submitted' | 'approved' | 'rejected';

export interface ReviewPackage {
  id: string;
  name: string;
  reviewCount: number;
  price: number;
  description: string;
}

export interface Order {
  id: string;
  clientId: string;
  packageId: string;
  businessUrl: string;
  businessName: string;
  totalReviews: number;
  completedReviews: number;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface ReviewTask {
  id: string;
  orderId: string;
  businessUrl: string;
  businessName: string;
  internId?: string;
  status: ReviewStatus;
  assignedAt?: Date;
  completedAt?: Date;
  proofScreenshot?: string;
  reviewContent?: string;
  commission: number;
  guidelines: string[];
}