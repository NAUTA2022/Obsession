import type { ReactNode } from 'react';

// Button types
export type ButtonVariant = 'primary' | 'danger' | 'outline' | 'outline-danger' | 'social';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'social';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

// Input types
export type InputVariant = 'outline' | 'error';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps {
  type?: string;
  placeholder?: string;
  icon?: React.ComponentType<any>;
  iconPosition?: 'left' | 'right';
  variant?: InputVariant;
  size?: InputSize;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

// Checkbox types
export type CheckboxVariant = 'default' | 'error';
export type CheckboxSize = 'sm' | 'default' | 'lg';

export interface CheckboxProps {
  id?: string;
  className?: string;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  error?: string;
  label?: ReactNode;
  description?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Separator types
export interface SeparatorProps {
  text?: string;
  className?: string;
  lineColor?: string;
  textColor?: string;
}

// Utility types
export type ClassNameValue = string | number | boolean | undefined | null;
export type ClassNameArray = ClassNameValue[];
export type ClassNameObject = { [id: string]: any };
export type ClassNameInput = ClassNameValue | ClassNameArray | ClassNameObject;
