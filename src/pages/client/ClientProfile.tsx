import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, User, Mail, Phone, MapPin, Camera, Upload, Edit3, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ClientProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Mock profile data - in real app, this would come from user context or API
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Street, City, State 12345',
    businessName: user?.businessName || 'My Business',
    website: 'https://mybusiness.com',
    businessType: 'Restaurant',
    description: 'A family-owned restaurant serving authentic cuisine since 1995.',
  });

  const handleSave = () => {
    // In real app, this would save to backend
    setIsEditing(false);
    // Handle image upload here if needed
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  leftIcon={<X size={16} />}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<Save size={16} />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                leftIcon={<Edit3 size={16} />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Photo Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="mx-auto w-32 h-32 relative">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-blue-100">
                    <User className="w-16 h-16 text-blue-500" />
                  </div>
                )}
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {!isEditing && (
                <Button 
                  variant="outline" 
                  leftIcon={<Upload size={16} />}
                  onClick={() => setIsEditing(true)}
                >
                  Update Photo
                </Button>
              )}
              
              <p className="text-sm text-gray-500">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    leftIcon={<User className="h-5 w-5 text-gray-400" />}
                    disabled={!isEditing}
                    fullWidth
                  />
                  
                  <Input
                    label="Business Name"
                    value={profileData.businessName}
                    onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                    disabled={!isEditing}
                    fullWidth
                  />

                  <Input
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>

                <Input
                  label="Business Address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  leftIcon={<MapPin className="h-5 w-5 text-gray-400" />}
                  disabled={!isEditing}
                  fullWidth
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Website"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    disabled={!isEditing}
                    fullWidth
                  />

                  <Input
                    label="Business Type"
                    value={profileData.businessType}
                    onChange={(e) => setProfileData({...profileData, businessType: e.target.value})}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    rows={4}
                    value={profileData.description}
                    onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Tell us about your business..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
                <div className="text-sm font-medium text-blue-700">Total Orders</div>
                <div className="text-xs text-blue-500 mt-1">Since joining</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">32</div>
                <div className="text-sm font-medium text-green-700">Reviews Received</div>
                <div className="text-xs text-green-500 mt-1">Authentic reviews</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-600 mb-2">4.8</div>
                <div className="text-sm font-medium text-yellow-700">Average Rating</div>
                <div className="text-xs text-yellow-500 mt-1">Excellent performance</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">$1,245</div>
                <div className="text-sm font-medium text-purple-700">Total Investment</div>
                <div className="text-xs text-purple-500 mt-1">Growing your business</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-medium text-green-800">Account Status</div>
                  <div className="text-sm text-green-600">Active & Verified</div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <div className="font-medium text-blue-800">Member Since</div>
                  <div className="text-sm text-blue-600">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'January 2024'}
                  </div>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <div className="font-medium text-purple-800">Plan Type</div>
                  <div className="text-sm text-purple-600">Professional</div>
                </div>
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};