import React from 'react';

interface ResponsiveIconProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
}

export function ResponsiveIcon({ icon: Icon, className = '' }: ResponsiveIconProps) {
  return (
    <Icon 
      className={`text-neutral-700 dark:text-neutral-200 ${className}`}
    />
  );
}