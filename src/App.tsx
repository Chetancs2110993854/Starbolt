import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/auth/AuthPage';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientProfile } from './pages/client/ClientProfile';
import { ClientOrders } from './pages/client/ClientOrders';
import { ClientReviews } from './pages/client/ClientReviews';
import { ClientSettings } from './pages/client/ClientSettings';
import { NewOrderPage } from './pages/client/NewOrderPage';
import { InternDashboard } from './pages/intern/InternDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Protected route wrapper
const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  requiredRole?: string[];
}> = ({ element, requiredRole = [] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole.length > 0 && user && !requiredRole.includes(user.role)) {
    // Redirect to the appropriate dashboard based on user role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'client') {
      return <Navigate to="/client" replace />;
    } else if (user.role === 'intern') {
      return <Navigate to="/intern" replace />;
    }
  }
  
  return element;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          
          {/* Client routes */}
          <Route 
            path="/client" 
            element={<ProtectedRoute element={<ClientDashboard />} requiredRole={['client']} />} 
          />
          <Route 
            path="/client/profile" 
            element={<ProtectedRoute element={<ClientProfile />} requiredRole={['client']} />} 
          />
          <Route 
            path="/client/orders" 
            element={<ProtectedRoute element={<ClientOrders />} requiredRole={['client']} />} 
          />
          <Route 
            path="/client/reviews" 
            element={<ProtectedRoute element={<ClientReviews />} requiredRole={['client']} />} 
          />
          <Route 
            path="/client/settings" 
            element={<ProtectedRoute element={<ClientSettings />} requiredRole={['client']} />} 
          />
          <Route 
            path="/client/orders/new" 
            element={<ProtectedRoute element={<NewOrderPage />} requiredRole={['client']} />} 
          />
          
          {/* Intern routes */}
          <Route 
            path="/intern" 
            element={<ProtectedRoute element={<InternDashboard />} requiredRole={['intern']} />} 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={<ProtectedRoute element={<AdminDashboard />} requiredRole={['admin']} />} 
          />
          
          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;