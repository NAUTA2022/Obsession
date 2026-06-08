import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes } from "react";
import type { ButtonVariant, ButtonSize } from "../../types/ui";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
};

const baseButtonClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#487FFF] hover:bg-[#487FFF] text-white focus:ring-primary-300",
  danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-300",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-800",
  "outline-danger": "border border-red-500 text-red-600 hover:bg-gray-50 focus:ring-red-200 dark:hover:bg-gray-800",
  social: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-800",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-lg",
  social: "h-10 px-4 text-sm",
};

export default function Button({
  className,
  variant = "primary",
  size = "md",
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseButtonClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}