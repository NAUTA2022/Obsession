import { forwardRef } from 'react';
import type { CheckboxProps, ClassNameInput } from '../../types/ui';

const cn = (...classes: ClassNameInput[]): string => {
  return classes.filter(Boolean).join(' ');
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ 
  className,
  variant = 'default',
  size = 'default',
  error,
  label,
  description,
  disabled = false,
  id,
  ...props 
}, ref) => {
  
  // Styles
  const variants = {
    default: 'border-white text-white bg-transparent',
    error: 'border-red-500 text-red-600 focus:ring-red-500 focus:ring-2 bg-transparent',
    disabled: 'border-gray-200 text-gray-400 cursor-not-allowed bg-transparent'
  };

  // Sizes
  const sizes = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Label sizes
  const labelSizes = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base'
  };

  // Description sizes
  const descriptionSizes = {
    sm: 'text-xs',
    default: 'text-xs',
    lg: 'text-sm'
  };

  // base classes for the checkbox
  const baseClasses = cn(
    'rounded border-2 transition-colors duration-200 focus:outline-none bg-transparent checked:bg-white checked:border-white checked:text-[#0B021C]', 
    sizes[size],
    disabled ? variants.disabled : (error ? variants.error : variants[variant]),
    className
  );
  
  return (
    <div className="flex items-start">
      <div className="mt-1 flex items-center h-5">
        <input
          type="checkbox"
          className={baseClasses}
          ref={ref}
          disabled={disabled}
          id={id}
          {...props}
        />
      </div>
      
      {(label || description) && (
        <div className="ml-2">
          {label && (
            <label 
              htmlFor={id}
              className={cn(
                'text-white cursor-pointer',
                labelSizes[size],
                disabled && 'text-gray-400 cursor-not-allowed'
              )}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p className={cn(
              'text-gray-500 mt-0.5',
              descriptionSizes[size],
              disabled && 'text-gray-400'
            )}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox; 