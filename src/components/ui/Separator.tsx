import React from 'react';
import type { SeparatorProps, ClassNameInput } from '../../types/ui';

const cn = (...classes: ClassNameInput[]): string => {
  return classes.filter(Boolean).join(' ');
};

const Separator: React.FC<SeparatorProps> = ({ 
  text,
  className,
  lineColor = 'bg-gray-600',
  textColor = 'text-gray-400',
  ...props 
}) => {
  return (
    <div className={cn('relative flex items-center', className)} {...props}>
      <div className={cn('flex-grow h-px', lineColor)}></div>
      
      {text && (
        <span className={cn(
          'px-4 text-xs sm:text-sm font-medium',
          textColor
        )}>
          {text}
        </span>
      )}
      
      <div className={cn('flex-grow h-px', lineColor)}></div>
    </div>
  );
};

export default Separator; 