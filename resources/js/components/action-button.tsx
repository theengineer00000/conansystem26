import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ActionButtonProps = React.ComponentProps<typeof Button> & {
  children: React.ReactNode;
  color?: 'red' | 'green' | 'orange' | 'blue';
};

export function ActionButton({ children, className, color = 'red', ...props }: ActionButtonProps) {
  // Define color classes based on the color prop
  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    green: 'bg-green-600 hover:bg-green-700',
    orange: 'bg-orange-500 hover:bg-orange-600',
    blue: 'bg-blue-600 hover:bg-blue-700',
  };
  
  return (
    <button
      type="button"
      className={cn(
        'px-3 py-1 text-xs font-medium text-white rounded disabled:opacity-70',
        colorClasses[color],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}