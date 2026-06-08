import * as React from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff, Search as SearchIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import type { InputVariant, InputSize } from "../../types/ui";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  variant?: InputVariant;
  size?: InputSize;
  icon?: React.ComponentType<any>;
  iconPosition?: 'left' | 'right';
  error?: string;
};

const baseInputClasses =
  "w-full rounded-lg border border-gray-300 bg-white pl-4 pr-3 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-primary-900";

const sizeClasses: Record<InputSize, string> = {
  sm: "h-8 text-sm",
  md: "h-10",
  lg: "h-12 text-lg",
};

const variantClasses: Record<InputVariant, string> = {
  outline: "border-gray-300",
  error: "border-red-500 focus:border-red-500 focus:ring-red-200",
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  props: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const { 
    className, 
    variant = "outline", 
    size = "md", 
    type, 
    icon: Icon,
    iconPosition = "left",
    error,
    ...restProps 
  } = props;

  const inputClasses = cn(
    baseInputClasses,
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  const inputElement = (
    <input
      ref={ref}
      type={type ?? "text"}
      className={inputClasses}
      {...restProps}
    />
  );

  if (Icon) {
    return (
      <div className="relative">
        {iconPosition === "left" && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Icon size={size === "sm" ? 16 : size === "lg" ? 20 : 18} />
          </span>
        )}
        {React.cloneElement(inputElement, {
          className: cn(
            inputClasses,
            iconPosition === "left" ? "pl-10" : "pr-10"
          )
        })}
        {iconPosition === "right" && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <Icon size={size === "sm" ? 16 : size === "lg" ? 20 : 18} />
          </span>
        )}
      </div>
    );
  }

  return inputElement;
});

export default Input;

