// Centralized branding

export const gradients = {
  primary: 'bg-gradient-to-r from-[#6850E8] to-[#9277F5]',
  hero: 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-[#6850E8]',
  greenCard: 'bg-gradient-to-br from-white from-0% to-[#EAFFF9] to-100%',
  orangeCard: 'bg-gradient-to-br from-white from-0% to-[#FFF5E9] to-100%',
  purpleCard: 'bg-gradient-to-br from-white from-0% to-[#F3EEFF] to-100%',
} as const;

export const bgColors = {
  brandStart: 'bg-[#6850E8]',
  brandEnd: 'bg-[#9277F5]',
  white: 'bg-white',
  stock: 'bg-[#D1D5DB]',
  secondaryLight: 'bg-[#4B5563]',
  green : {
    primary: 'bg-[#21BB90]',
    secondary: 'bg-[#5AF08B]',
    light: 'bg-[#4ADE80]',
    lightOpacity: 'bg-[#45B3692E]' // Verde con opacidad
  },
  orange: {
    primary: 'bg-[#F4941E]'
  },
  purple : {
    primary: 'bg-[#6850E8]',
  },
  blue: {
    primary: 'bg-[#487FFF]',
    light: 'bg-[#60A5FA]',
    lightOpacity: 'bg-[#487FFF2E]' // Azul con opacidad
  },
  red: {
    primary: 'bg-[#EF4444]',
    light: 'bg-[#F866242E]' // Rojo con opacidad
  },
  gray: {
    light: 'bg-[#F3F4F6]',
    medium: 'bg-[#E5E7EB]',
    dark: 'bg-[#9CA3AF]'
  },
  // Colors for Kanban board
  kanban: {
    selection: 'bg-gray-100',
    proposal: 'bg-purple-100',
    negotiation: 'bg-yellow-100',
    review: 'bg-blue-100',
    closing: {
      green: 'bg-green-100',
      red: 'bg-red-100'
    },
    delivery: 'bg-green-500'
  }
} as const;

export const borderColors = {
  brandStart: 'border-[#6850E8]',
  brandEnd: 'border-[#9277F5]',
  white: 'border-white',
  stock: 'border-[#D1D5DB]',
  secondaryLight: 'border-[#4B5563]',
  gray: {
    light: 'border-[#D1D5DB]',
    medium: 'border-[#9CA3AF]'
  }
} as const;

export const textColors = {
  brandStart: 'text-[#6850E8]',
  brandEnd: 'text-[#9277F5]',
  white: 'text-white',
  stock: 'text-[#D1D5DB]',
  textSecondaryLight: 'text-[#4B5563]',
  purple: 'text-[#6850E8]',
  gray: {
    light: 'text-[#6B7280]',
    medium: 'text-[#64748B]'
  }
} as const;

export const focusRings = {
  brand: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6850E8]',
} as const;

// Colors for charts and data
export const chartColors = {
  blue: '#3B82F6',
  orange: '#FF9F29', 
  orangeLight: '#FFB347',
  green: '#22C55E',
  purple: '#6F5AF6',
  red: '#EF4444',
  gray: {
    light: '#F3F4F6',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
    border: '#D1D5DB'
  }
} as const;


