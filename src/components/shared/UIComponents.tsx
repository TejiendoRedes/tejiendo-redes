import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import Link from 'next/link';

interface EmptyStateProps {
  icon?: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function EmptyState({ icon = 'info', title, description, action }: EmptyStateProps) {
  const icons = {
    info: <Info className="w-12 h-12 text-blue-500" />,
    warning: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    error: <XCircle className="w-12 h-12 text-red-500" />,
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">{icons[icon]}</div>
      <h3 className="text-lg text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-4 max-w-md">{description}</p>}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  className?: string;
}

export function StatsCard({ label, value, icon, change, className }: StatsCardProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl text-gray-900">{value}</p>
          {change && (
            <p
              className={cn(
                'text-sm mt-2',
                change.trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-gray-200 border-t-blue-600',
          sizes[size]
        )}
      />
    </div>
  );
}

