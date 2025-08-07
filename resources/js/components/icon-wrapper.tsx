import React from 'react';
import { cn } from '@/lib/utils';

interface IconWrapperProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
}

/**
 * A wrapper component that makes any SVG icon responsive to dark/light mode
 */
export function IconWrapper({ icon: Icon, className }: IconWrapperProps) {
  return (
    <Icon className={cn('text-neutral-700 dark:text-neutral-200 fill-current', className)} />
  );
}