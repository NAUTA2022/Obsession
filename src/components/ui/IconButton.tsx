import { type ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'primary';
  size?: 'sm' | 'md';
}

export default function IconButton({
  className,
  variant = 'ghost',
  size = 'md',
  ...props
}: IconButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    ghost: 'hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 focus:ring-gray-400',
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  } as const;
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
  } as const;

  return (
    <button className={twMerge(base, variants[variant], sizes[size], className)} {...props} />
  );
}


