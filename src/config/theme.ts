// Tokens of typography and reusable UI


export const typography = {
  heading: {
    xl: 'text-3xl sm:text-3xl md:text-4xl',
    lg: 'text-2xl sm:text-3xl',
    md: 'text-xl',
    sm: 'text-lg',
  },
  body: {
    base: 'text-sm sm:text-base',
    muted: 'text-xs text-gray-500',
  },
} as const;

export const radii = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  pill: 'rounded-full',
} as const;

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
} as const;


