import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Star, 
  Briefcase, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Settings, 
  BarChart,
  MessageSquare
} from 'lucide-react';
import { Button } from '../ui/Button';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center p-2 rounded-md text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-blue-50 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="mr-3 h-5 w-5">{icon}</span>
      {label}
    </NavLink>
  );
};

const getNavLinks = (role: string) => {
  switch (role) {
    case 'admin':
      return [
        { to: '/admin', icon: <Home size={18} />, label: 'Dashboard' },
        { to: '/admin/clients', icon: <Briefcase size={18} />, label: 'Clients' },
        { to: '/admin/interns', icon: <Users size={18} />, label: 'Interns' },
        { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
        { to: '/admin/payouts', icon: <DollarSign size={18} />, label: 'Payouts' },
        { to: '/admin/settings', icon: <Settings size={18} />, label: 'Settings' },
        { to: '/admin/analytics', icon: <BarChart size={18} />, label: 'Analytics' },
      ];
    case 'client':
      return [
        { to: '/client', icon: <Home size={18} />, label: 'Dashboard' },
        { to: '/client/profile', icon: <User size={18} />, label: 'Profile' },
        { to: '/client/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
        { to: '/client/reviews', icon: <MessageSquare size={18} />, label: 'Reviews' },
        { to: '/client/settings', icon: <Settings size={18} />, label: 'Settings' },
      ];
    case 'intern':
      return [
        { to: '/intern', icon: <Home size={18} />, label: 'Dashboard' },
        { to: '/intern/tasks', icon: <Star size={18} />, label: 'Review Tasks' },
        { to: '/intern/earnings', icon: <DollarSign size={18} />, label: 'Earnings' },
        { to: '/intern/settings', icon: <Settings size={18} />, label: 'Settings' },
      ];
    default:
      return [];
  }
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  if (!user) {
    return null;
  }
  
  const navLinks = getNavLinks(user.role);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-800">StarBoost</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* User info */}
          <div className="border-b border-gray-200 py-4 px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation links */}
          <nav className="mt-4 flex-1 px-4 space-y-1">
            {navLinks.map((link) => (
              <SidebarLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
              />
            ))}
          </nav>
          
          {/* Logout button */}
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="outline"
              fullWidth
              leftIcon={<LogOut size={18} />}
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1 px-4 lg:px-0">
              <h1 className="text-xl font-semibold text-gray-800 capitalize">
                {user.role} Dashboard
              </h1>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};