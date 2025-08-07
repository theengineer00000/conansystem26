import React from 'react';
import { cn } from '@/lib/utils';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import CircleXMarkIcon from '@/components/icons/CircleXMarkIcon';

export type StatusMessageType = 'success' | 'error';

interface StatusMessageProps {
  type: StatusMessageType;
  message: string;
  className?: string;
}

export default function StatusMessage({ type, message, className }: StatusMessageProps) {
  return (
    <div className={cn(
      'text-sm p-3 rounded-md flex items-center gap-2',
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
      className
    )}>
      {type === 'success' ? (
        <CheckCircleIcon className="w-6 h-6 text-white fill-white flex-shrink-0" style={{color: 'white', fill: 'white'}} />
      ) : (
        <CircleXMarkIcon className="w-6 h-6 text-white fill-white flex-shrink-0" style={{color: 'white', fill: 'white'}} />
      )}
      <span>{message}</span>
    </div>
  );
}