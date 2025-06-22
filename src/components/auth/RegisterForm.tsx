// src/components/RegisterForm.tsx

import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { UserRole } from '../../types/user';

interface RegisterFormProps {
  onToggleForm: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [formError, setFormError] = useState<string | null>(null);
  
  const { register, isLoading, error } = useAuth();

  const validateForm = () => {
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register(name, email, password, role);
      // Success logic handled by auth context or redirect
    } catch {
      // Error handled in auth context
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <button 
            type="button"
            onClick={onToggleForm}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your account
          </button>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {(error || formError) && (
          <Alert variant="error" title="Registration failed">
            {error || formError}
          </Alert>
        )}

        <div className="space-y-4">
          <Input
            id="name"
            type="text"
            label="Full name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="h-5 w-5 text-gray-400" />}
            fullWidth
          />
          
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            fullWidth
            helperText="Password must be at least 6 characters"
          />
          
          <Input
            id="confirm-password"
            type="password"
            label="Confirm password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            fullWidth
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Register as
            </label>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  id="role-client"
                  name="role"
                  value="client"
                  checked={role === 'client'}
                  onChange={() => setRole('client')}
                  className="mr-2"
                />
                Client
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  id="role-provider"
                  name="role"
                  value="provider"
                  checked={role === 'intern'}
                  onChange={() => setRole('intern')}
                  className="mr-2"
                />
                Provider
              </label>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            leftIcon={<UserPlus className="h-5 w-5" />}
          >
            {isLoading ? 'Signing up...' : 'Sign up'}
          </Button>
        </div>
      </form>
    </div>
  );
};
