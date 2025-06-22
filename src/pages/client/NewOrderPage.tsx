import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { OrderPackageCard } from '../../components/client/OrderPackageCard';
import { Alert } from '../../components/ui/Alert';
import { ChevronLeft, MapPin, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReviewPackage } from '../../types/review';
import { supabase } from '../../lib/supabase';

// Mock data for review packages
const packages: ReviewPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    reviewCount: 10,
    price: 99,
    description: 'Perfect for small businesses just starting out',
  },
  {
    id: 'standard',
    name: 'Standard',
    reviewCount: 25,
    price: 199,
    description: 'Our most popular package for established businesses',
  },
  {
    id: 'premium',
    name: 'Premium',
    reviewCount: 50,
    price: 349,
    description: 'Maximum impact for serious business growth',
  },
];

export const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessUrl, setBusinessUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<ReviewPackage | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  
  const validateUrl = (url: string) => {
    if (!url) {
      setUrlError('Business URL is required');
      return false;
    }
    
    // More flexible Google Maps URL validation
    const validPatterns = [
      /maps\.google\./i,
      /google\.[a-z]+\/maps/i,
      /goo\.gl\/maps/i,
      /maps\.app\.goo\.gl/i
    ];
    
    const isValid = validPatterns.some(pattern => pattern.test(url));
    
    if (!isValid) {
      setUrlError('Please enter a valid Google Maps URL. You can get this by clicking "Share" on your Google Maps business listing.');
      return false;
    }
    
    setUrlError(null);
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateUrl(businessUrl)) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (selectedPackage) {
        setCurrentStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  

//   const handleSubmit = async () => {
//   const user = (await supabase.auth.getUser()).data.user;

//   if (!user || !selectedPackage) {
//     console.error("Missing user or package");
//     return;
//   }

//   try {
//     const { error, data } = await supabase.from('orders').insert({
//       client_id: user.id,
//       business_url: businessUrl,
//       business_name: businessName,
//       package_id: selectedPackage.id, // <-- important: use selectedPackage.id, not the object itself
//       total_reviews: selectedPackage.reviewCount,
//       completed_reviews: 0,
//       status: 'pending',
//     });

//     if (error) {
//       console.error("Supabase insert error:", error.message);
//       return;
//     }

//     console.log("Order inserted successfully:", data);

//     // Navigate after short delay
//     setTimeout(() => {
//       navigate('/client/orders');
//     }, 1500);
//   } catch (err) {
//     console.error("Unexpected error while inserting order:", err);
//   }
// };

const handleSubmit = async () => {
  const user = (await supabase.auth.getUser()).data.user;

  if (!user || !selectedPackage) return;

  try {
    // 1. Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: user.id,
        business_url: businessUrl,
        business_name: businessName,
        package_id: selectedPackage.id,
        total_reviews: selectedPackage.reviewCount,
        completed_reviews: 0,
        status: 'pending',
      })
      .select()
      .single(); // Get back the inserted order with ID

    if (orderError) throw orderError;

    // 2. Create review_tasks for the order
    const taskInserts = Array.from({ length: selectedPackage.reviewCount }).map(() => ({
      order_id: orderData.id,
      status: 'pending',
      commission: selectedPackage.price / selectedPackage.reviewCount,
      guidelines: [
        'Mention the staff',
        'Describe the atmosphere',
        'Be honest and specific',
      ],
    }));

    const { error: taskError } = await supabase
      .from('review_tasks')
      .insert(taskInserts);

    if (taskError) throw taskError;

    // 3. Navigate to Orders page
    setTimeout(() => {
      navigate('/client/orders');
    }, 1500);

  } catch (err) {
    console.error('Error placing order or creating tasks:', err);
  }
};


  return (
    <DashboardLayout>
      <div className="space-y-6">
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
          <h1 className="text-2xl font-bold text-gray-900">New Review Order</h1>
        </div>

        {/* Step indicator */}
        <div className="relative">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${(currentStep / 3) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
            ></div>
          </div>
          <div className="flex text-xs justify-between mt-2">
            <div className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              Business Details
            </div>
            <div className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              Select Package
            </div>
            <div className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              Review & Payment
            </div>
          </div>
        </div>

        {/* Step 1: Business details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Input
                  label="Google Maps Business URL"
                  placeholder="https://maps.google.com/your-business"
                  value={businessUrl}
                  onChange={(e) => setBusinessUrl(e.target.value)}
                  error={urlError || undefined}
                  leftIcon={<MapPin className="h-5 w-5 text-gray-400" />}
                  fullWidth
                  required
                />
                
                <Input
                  label="Business Name"
                  placeholder="Your Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  fullWidth
                />
                
                <Alert variant="info" title="How to find your Google Maps URL">
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Search for your business on Google Maps</li>
                    <li>Click the "Share" button</li>
                    <li>In the popup, click "Copy link"</li>
                    <li>Paste the copied link here</li>
                  </ol>
                </Alert>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="primary" 
                  onClick={handleNextStep}
                  disabled={!businessUrl}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select package */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900">Select a Review Package</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <OrderPackageCard
                  key={pkg.id}
                  packageData={pkg}
                  onSelect={setSelectedPackage}
                  isSelected={selectedPackage?.id === pkg.id}
                />
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
              <Button 
                variant="primary" 
                onClick={handleNextStep}
                disabled={!selectedPackage}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review and payment */}
        {currentStep === 3 && selectedPackage && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 border-b pb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Business:</span>
                    <span>{businessName || 'Your Business'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Google Maps URL:</span>
                    <a 
                      href={businessUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Package:</span>
                    <span>{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Reviews:</span>
                    <span>{selectedPackage.reviewCount} reviews</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${selectedPackage.price}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    leftIcon={<CreditCard className="h-5 w-5 text-gray-400" />}
                    fullWidth
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiration Date"
                      placeholder="MM/YY"
                      fullWidth
                    />
                    <Input
                      label="CVC"
                      placeholder="123"
                      fullWidth
                    />
                  </div>
                  
                  <Input
                    label="Cardholder Name"
                    placeholder="John Doe"
                    fullWidth
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
              >
                Place Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};