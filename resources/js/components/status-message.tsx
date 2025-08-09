import React from 'react';
import { cn } from '@/lib/utils';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import CircleXMarkIcon from '@/components/icons/CircleXMarkIcon';

export type StatusMessageType = 'success' | 'error' | 'warning' | 'info';

interface StatusMessageProps {
  type: StatusMessageType;
  message: string;
  className?: string;
}

export default function StatusMessage({ type, message, className }: StatusMessageProps) {
  return (
    <div className={cn(
      'text-sm p-3 rounded-md flex items-center gap-2',
      type === 'success'
        ? 'bg-green-600 text-white'
        : type === 'warning'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200'
        : type === 'info'
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
        : 'bg-red-600 text-white',
      className
    )}>
      {type === 'success' ? (
        <CheckCircleIcon className="w-6 h-6 text-white fill-white flex-shrink-0" style={{color: 'white', fill: 'white'}} />
      ) : type === 'warning' ? (
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-600 dark:bg-amber-300" />
      ) : type === 'info' ? (
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-300" />
      ) : (
        <CircleXMarkIcon className="w-6 h-6 text-white fill-white flex-shrink-0" style={{color: 'white', fill: 'white'}} />
      )}
      <span>{message}</span>
    </div>
  );
}