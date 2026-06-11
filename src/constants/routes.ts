export const ROUTES = {
  // Auth general
  login: '/login',
  dashboard: '/dashboard',
  profile: '/profile',
  chatMessage: '/chatMessage',
  conversations: '/conversations',
  chat: '/chat',
  'creator-inbox': '/inbox',
  crm: '/crm',
  'crm-dashboard': '/crm/dashboard',
  'crm-deals': '/crm/deals',
  contacts: '/contacts',
  products: '/products',
  calendar: '/calendar',
  tasks: '/tasks',
  salespeople: '/salespeople',
  'work-teams': '/work-teams',
  gallery: '/gallery',
  membership: '/membership',
  settings: '/settings',
  signup: '/signup',
  resetPassword: '/reset-password',

  'client-inbox': '/mensajes',

  // Rutas para usuarios normales
  explore: '/explore',
  models: '/models',
  'models-discover': '/models/discover',
  'models-following': '/models/following',
  'models-favorites': '/models/favorites',
  purchases: '/purchases',
  subscriptions: '/subscriptions',
  history: '/history',
  notifications: '/notifications',
  support: '/support',
  creators: '/creators',
  'creator-detail': '/creators/:id',
  'my-purchases': '/my-purchases',

  // Rutas para administradores
  'admin-dashboard': '/admin/dashboard',
  'admin-users': '/admin/users',
  'admin-users-models': '/admin/users/models',
  'admin-users-customers': '/admin/users/customers',
  'admin-users-moderators': '/admin/users/moderators',
  'admin-content': '/admin/content',
  'admin-content-moderate': '/admin/content/moderate',
  'admin-content-reports': '/admin/content/reports',
  'admin-analytics': '/admin/analytics',
  'admin-transactions': '/admin/transactions',
  'admin-config': '/admin/config',
  'admin-logs': '/admin/logs',
  'admin-support': '/admin/support',
  'admin-backup': '/admin/backup',
  'admin-settings': '/admin/settings',
  'admin-pricing': '/admin/pricing',
  'admin-audit-log': '/admin/audit-log',

  // Rutas para customers
  'planes': '/planes',

  // Onboarding
  'become-creator': '/become-creator',
  'become-seller': '/become-seller',
  'onboarding-select-path': '/onboarding/select-path',
  'onboarding-creator': '/onboarding/creator',
  'onboarding-seller': '/onboarding/seller',

  // Descubrimiento (swipe)
  'discover-sellers': '/discover-sellers',
  'collaborations': '/collaborations',

  // Rutas públicas (sin auth)
  'public-profile': '/p/:username',

  // ============================================
  // ARQUITECTURA POR ROL (PDF) — rutas anidadas
  // ============================================
  // Shared
  messages: '/messages',

  // Customer (/customer/*)
  'customer-creators': '/customer/creators',
  'customer-creator-detail': '/customer/creator/:id',
  'customer-messages': '/customer/messages',
  'customer-purchases': '/customer/purchases',
  'customer-bookings': '/customer/bookings',
  'customer-cart': '/customer/cart',
  'customer-planes': '/customer/planes',

  // Creator (/creator/*)
  'creator-dashboard': '/creator/dashboard',
  'creator-products': '/creator/products',
  'creator-sellers': '/creator/sellers',
  'creator-messages': '/creator/messages',
  'creator-bookings': '/creator/bookings',
  'creator-call-settings': '/creator/settings/calls',
  'creator-crm': '/creator/crm',
  'creator-crm-deals': '/creator/crm/deals',
  'creator-collaborations': '/creator/collaborations',
  'creator-contacts': '/creator/contacts',
  'creator-work-teams': '/creator/work-teams',
  'creator-studio-ai': '/creator/studio-ai',
  'creator-earnings': '/creator/earnings',

  // Seller (/seller/*) — rol backend "vendedor"
  'seller-dashboard': '/seller/dashboard',
  'seller-creators': '/seller/creators',
  'seller-creator-view': '/seller/creator/:username',
  'seller-chat': '/seller/chat',
  'seller-links': '/seller/links',
  'seller-commissions': '/seller/commissions',
  'seller-ai-sales': '/seller/ai-sales',
  'seller-analytics': '/seller/analytics',
  'seller-discover': '/seller/discover',
  'seller-profile': '/seller/profile',
  'public-seller-profile': '/vendedor/:username',

  // Admin (/admin/*)
  'admin-creators': '/admin/creators',
  'admin-sellers': '/admin/sellers',
  'admin-reports': '/admin/reports',
  'admin-payments': '/admin/payments',
  'admin-commissions': '/admin/commissions',
  'admin-ai': '/admin/ai',
  'admin-moderation': '/admin/moderation',

  // Call
  call: '/call/:bookingId',
} as const;

export type RouteKey = keyof typeof ROUTES;
