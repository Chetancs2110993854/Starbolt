import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
        `flex items-center p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
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
        { to: '/admin/analytics', icon: <BarChart size={18} />, label: 'Analytics' },
        { to: '/admin/settings', icon: <Settings size={18} />, label: 'Settings' },
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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  if (!user) {
    return null;
  }
  
  const navLinks = getNavLinks(user.role);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    
    // More specific path matching
    if (path === '/client') return 'Client Dashboard';
    if (path === '/intern') return 'Intern Dashboard';
    if (path === '/admin') return 'Admin Dashboard';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/orders/new')) return 'New Order';
    if (path.includes('/orders')) return 'Orders';
    if (path.includes('/reviews')) return 'Reviews';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/tasks')) return 'Review Tasks';
    if (path.includes('/earnings')) return 'Earnings';
    
    return `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`;
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
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-xl transition duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white tracking-tight">
                StarBoost
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* User info */}
          <div className="border-b border-gray-200 py-6 px-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full inline-block">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation links */}
          <nav className="mt-6 flex-1 px-4 space-y-2">
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
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="flex-1 px-4 lg:px-0">
                <h1 className="text-xl font-semibold text-gray-800">
                  {getPageTitle()}
                </h1>
              </div>
            </div>
            
            {/* Quick stats for intern dashboard */}
            {user.role === 'intern' && location.pathname === '/intern' && (
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="text-center px-3 py-1 bg-green-50 rounded-lg">
                  <div className="font-semibold text-green-600">$0.00</div>
                  <div className="text-xs text-green-500">Pending</div>
                </div>
                <div className="text-center px-3 py-1 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-600">0</div>
                  <div className="text-xs text-blue-500">Available</div>
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};