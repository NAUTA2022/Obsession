import type { UserRole } from '../types/auth';

/**
 * Sistema de capabilities / permisos.
 *
 * El PDF de arquitectura exige NO usar lógica hardcodeada por rol en los
 * componentes, sino permisos: `sidebarItems.filter(i => hasPermission(i.permission))`.
 *
 * El backend todavía no envía permisos por usuario, así que el mapeo
 * `rol → permisos` vive aquí, en un único lugar. Los componentes solo
 * consultan `hasPermission(...)` (ver `src/hooks/usePermissions.ts`) y nunca
 * leen `user.role` directamente.
 *
 * Nota: el rol "seller" del PDF corresponde al valor de backend `"vendedor"`.
 */

export const PERMISSIONS = {
  // --- Customer ---
  CUSTOMER_CREATORS_BROWSE: 'customer.creators.browse',
  CUSTOMER_PURCHASES_VIEW: 'customer.purchases.view',
  CUSTOMER_BOOKINGS_VIEW: 'customer.bookings.view',
  CUSTOMER_MESSAGES_ACCESS: 'customer.messages.access',

  // --- Creator ---
  CREATOR_DASHBOARD_VIEW: 'creator.dashboard.view',
  CREATOR_PRODUCTS_VIEW: 'creator.products.view',
  CREATOR_PRODUCTS_CREATE: 'creator.products.create',
  CREATOR_SELLERS_MANAGE: 'creator.sellers.manage',
  CREATOR_STUDIO_USE: 'creator.studio.use',
  CREATOR_AI_CONFIGURE: 'creator.ai.configure',
  CREATOR_EARNINGS_VIEW: 'creator.earnings.view',
  CREATOR_BOOKINGS_MANAGE: 'creator.bookings.manage',
  CREATOR_MESSAGES_ACCESS: 'creator.messages.access',
  CREATOR_CRM_VIEW: 'creator.crm.view',
  CREATOR_CONTACTS_VIEW: 'creator.contacts.view',
  CREATOR_TEAMS_MANAGE: 'creator.teams.manage',

  // --- Moderator (manages creator teams, sees content blurred) ---
  MODERATOR_TEAMS_MANAGE: 'moderator.teams.manage',

  // --- Seller (= vendedor) ---
  SELLER_DASHBOARD_VIEW: 'seller.dashboard.view',
  SELLER_CREATORS_VIEW: 'seller.creators.view',
  SELLER_COMMISSIONS_VIEW: 'seller.commissions.view',
  SELLER_AI_USE: 'seller.ai.use',
  SELLER_ANALYTICS_VIEW: 'seller.analytics.view',
  SELLER_PROFILE_EDIT: 'seller.profile.edit',

  // --- Admin ---
  ADMIN_USERS_MANAGE: 'admin.users.manage',
  ADMIN_CREATORS_MANAGE: 'admin.creators.manage',
  ADMIN_SELLERS_MANAGE: 'admin.sellers.manage',
  ADMIN_REPORTS_VIEW: 'admin.reports.view',
  ADMIN_PAYMENTS_MANAGE: 'admin.payments.manage',
  ADMIN_COMMISSIONS_MANAGE: 'admin.commissions.manage',
  ADMIN_AI_MANAGE: 'admin.ai.manage',
  ADMIN_MODERATION_MANAGE: 'admin.moderation.manage',

  // --- Shared (todos los roles autenticados) ---
  SHARED_PROFILE_EDIT: 'shared.profile.edit',
  SHARED_SETTINGS_EDIT: 'shared.settings.edit',
  SHARED_NOTIFICATIONS_VIEW: 'shared.notifications.view',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const SHARED: Permission[] = [
  PERMISSIONS.SHARED_PROFILE_EDIT,
  PERMISSIONS.SHARED_SETTINGS_EDIT,
  PERMISSIONS.SHARED_NOTIFICATIONS_VIEW,
];

const CUSTOMER: Permission[] = [
  PERMISSIONS.CUSTOMER_CREATORS_BROWSE,
  PERMISSIONS.CUSTOMER_PURCHASES_VIEW,
  PERMISSIONS.CUSTOMER_BOOKINGS_VIEW,
  PERMISSIONS.CUSTOMER_MESSAGES_ACCESS,
];

const CREATOR: Permission[] = [
  PERMISSIONS.CREATOR_DASHBOARD_VIEW,
  PERMISSIONS.CREATOR_PRODUCTS_VIEW,
  PERMISSIONS.CREATOR_PRODUCTS_CREATE,
  PERMISSIONS.CREATOR_SELLERS_MANAGE,
  PERMISSIONS.CREATOR_STUDIO_USE,
  PERMISSIONS.CREATOR_AI_CONFIGURE,
  PERMISSIONS.CREATOR_EARNINGS_VIEW,
  PERMISSIONS.CREATOR_BOOKINGS_MANAGE,
  PERMISSIONS.CREATOR_MESSAGES_ACCESS,
  PERMISSIONS.CREATOR_CRM_VIEW,
  PERMISSIONS.CREATOR_CONTACTS_VIEW,
  // Teams is for moderators only — creators do NOT get CREATOR_TEAMS_MANAGE
];

const SELLER: Permission[] = [
  PERMISSIONS.SELLER_DASHBOARD_VIEW,
  PERMISSIONS.SELLER_CREATORS_VIEW,
  PERMISSIONS.SELLER_COMMISSIONS_VIEW,
  PERMISSIONS.SELLER_AI_USE,
  PERMISSIONS.SELLER_ANALYTICS_VIEW,
  PERMISSIONS.SELLER_PROFILE_EDIT,
];

const ADMIN: Permission[] = [
  PERMISSIONS.ADMIN_USERS_MANAGE,
  PERMISSIONS.ADMIN_CREATORS_MANAGE,
  PERMISSIONS.ADMIN_SELLERS_MANAGE,
  PERMISSIONS.ADMIN_REPORTS_VIEW,
  PERMISSIONS.ADMIN_PAYMENTS_MANAGE,
  PERMISSIONS.ADMIN_COMMISSIONS_MANAGE,
  PERMISSIONS.ADMIN_AI_MANAGE,
  PERMISSIONS.ADMIN_MODERATION_MANAGE,
];

/**
 * Permisos efectivos por rol. `admin` recibe su set + dashboard/CRM de creator
 * (para conservar esos accesos de la nav admin actual) + shared.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  customer: [...CUSTOMER, ...SHARED],
  creator: [...CREATOR, ...SHARED],
  // "seller" del PDF == valor de backend "vendedor".
  // Sellers NO tienen SHARED_PROFILE_EDIT — usan su propio "Perfil de vendedor"
  vendedor: [...SELLER, PERMISSIONS.SHARED_SETTINGS_EDIT, PERMISSIONS.SHARED_NOTIFICATIONS_VIEW],
  admin: [
    ...ADMIN,
    PERMISSIONS.CREATOR_DASHBOARD_VIEW,
    PERMISSIONS.CREATOR_CRM_VIEW,
    ...SHARED,
  ],
  // moderator usa las mismas rutas y permisos que vendedor (seller)
  // Sellers/moderators NO tienen SHARED_PROFILE_EDIT — usan su propio "Perfil de vendedor"
  moderator: [...SELLER, PERMISSIONS.SHARED_SETTINGS_EDIT, PERMISSIONS.SHARED_NOTIFICATIONS_VIEW],
};
