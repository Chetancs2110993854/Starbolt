import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { UserRole } from '../../types/user';

interface LoginFormProps {
  onToggleForm: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(email, password);

      const storedUser = JSON.parse(localStorage.getItem('starboost_user') || '{}');

      const role: UserRole = storedUser?.role;

      switch (role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'client':
          navigate('/client');
          break;
        case 'intern':
          navigate('/intern');
          break;
        case 'provider':
          navigate('/provider');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      // error is handled via `error` from context
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <button
            onClick={onToggleForm}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </button>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <Alert variant="error" title="Login failed">
            {error}
          </Alert>
        )}

        <div className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email address"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
            fullWidth
          />

          <Input
            id="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            fullWidth
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            leftIcon={<LogIn size={18} />}
            className="py-2.5"
          >
            Sign in
          </Button>
        </div>
      </form>

      <div className="mt-4">
        <p className="text-center text-sm text-gray-600">Demo accounts:</p>
        <div className="mt-2 grid gap-2 text-sm">
          <div className="border rounded p-2 hover:bg-gray-50">
            <p><strong>Admin:</strong> admin@starboost.com</p>
            <p><strong>Password:</strong> password</p>
          </div>
          <div className="border rounded p-2 hover:bg-gray-50">
            <p><strong>Client:</strong> client@starboost.com</p>
            <p><strong>Password:</strong> password</p>
          </div>
          <div className="border rounded p-2 hover:bg-gray-50">
            <p><strong>Intern:</strong> intern@starboost.com</p>
            <p><strong>Password:</strong> password</p>
          </div>
          <div className="border rounded p-2 hover:bg-gray-50">
            <p><strong>Provider:</strong> provider@starboost.com</p>
            <p><strong>Password:</strong> password</p>
          </div>
        </div>
      </div>
    </div>
  );
};
