import type { LucideIcon } from 'lucide-react';
import { ROUTES } from './routes';
import { icons } from '../config/icons';
import { PERMISSIONS } from './permissions';

export type NavItem = {
  label: string;
  path: string;
  icon?: LucideIcon;
  imageUrl?: string;
  children?: NavItem[];
  customExpandable?: boolean;
  /** Tipo de expansión personalizada ('teams' | 'creators-list'). */
  expandType?: 'teams' | 'creators-list';
  /** Capability requerida para mostrar el item. Sin permiso => siempre visible. */
  permission?: string;
};

export type NavSections = {
  primary: NavItem[];
  secondary: NavItem[];
  third: NavItem[];
  fourth: NavItem[];
};

// ============================================
// NAVEGACIÓN ÚNICA, TAGUEADA POR PERMISO
// El sidebar filtra con hasPermission() (ver Sidebar.tsx). Cada rol ve solo los
// items para los que tiene capability. No hay lógica por rol en el componente.
// ============================================

const PRIMARY: NavItem[] = [
  // Creator / Admin
  { label: 'Dashboard', path: ROUTES['creator-dashboard'], icon: icons.dashboard, permission: PERMISSIONS.CREATOR_DASHBOARD_VIEW },
  // Seller
  { label: 'Inicio', path: ROUTES['seller-dashboard'], icon: icons.dashboard, permission: PERMISSIONS.SELLER_DASHBOARD_VIEW },
  // Customer
  { label: 'Creadoras/as', path: ROUTES['customer-creators'], icon: icons.home, permission: PERMISSIONS.CUSTOMER_CREATORS_BROWSE },
  // Seller
  { label: 'Mis Creadoras', path: ROUTES['seller-creators'], icon: icons.users, permission: PERMISSIONS.SELLER_CREATORS_VIEW, customExpandable: true, expandType: 'creators-list' },
  // Creator
  { label: 'Descubrir vendedores', path: ROUTES['creator-sellers'], icon: icons.store, permission: PERMISSIONS.CREATOR_SELLERS_MANAGE },
  { label: 'Mis vendedores', path: ROUTES['creator-collaborations'], icon: icons.users, permission: PERMISSIONS.CREATOR_SELLERS_MANAGE },
  // Mensajería (mismo destino /messages, gated por rol vía permiso)
  { label: 'Mensajes', path: ROUTES.messages, icon: icons.messageCircle, permission: PERMISSIONS.CUSTOMER_MESSAGES_ACCESS },
  { label: 'Conversaciones', path: ROUTES.messages, icon: icons.messageCircle, permission: PERMISSIONS.CREATOR_MESSAGES_ACCESS },
  // Customer
  { label: 'Mis compras', path: ROUTES['customer-purchases'], icon: icons.shoppingBag, permission: PERMISSIONS.CUSTOMER_PURCHASES_VIEW },
  { label: 'Planes', path: ROUTES['customer-planes'], icon: icons.gem, permission: PERMISSIONS.CUSTOMER_PURCHASES_VIEW },
  // Seller
  { label: 'IA Comercial', path: ROUTES['seller-ai-sales'], icon: icons.helpCircle, permission: PERMISSIONS.SELLER_AI_USE },
  { label: 'Comisiones', path: ROUTES['seller-commissions'], icon: icons.ticketPercent, permission: PERMISSIONS.SELLER_COMMISSIONS_VIEW },
  { label: 'Analytics', path: ROUTES['seller-analytics'], icon: icons.fileText, permission: PERMISSIONS.SELLER_ANALYTICS_VIEW },
  { label: 'Perfil de vendedor', path: ROUTES['seller-profile'], icon: icons.user, permission: PERMISSIONS.SELLER_PROFILE_EDIT },
  // Perfil (shared — customer / creator / admin)
  { label: 'Perfil', path: ROUTES.profile, icon: icons.user, permission: PERMISSIONS.SHARED_PROFILE_EDIT },
  // Creator CRM / Contactos
  { label: 'CRM', path: ROUTES['creator-crm-deals'], icon: icons.ticketPercent, permission: PERMISSIONS.CREATOR_CRM_VIEW },
  { label: 'Contactos', path: ROUTES['creator-contacts'], icon: icons.contact, permission: PERMISSIONS.CREATOR_CONTACTS_VIEW },
  // Admin
  { label: 'Usuarios', path: ROUTES['admin-users'], icon: icons.users, permission: PERMISSIONS.ADMIN_USERS_MANAGE },
  { label: 'Creadoras', path: ROUTES['admin-creators'], icon: icons.users, permission: PERMISSIONS.ADMIN_CREATORS_MANAGE },
  { label: 'Vendedores', path: ROUTES['admin-sellers'], icon: icons.store, permission: PERMISSIONS.ADMIN_SELLERS_MANAGE },
  { label: 'Reportes', path: ROUTES['admin-reports'], icon: icons.fileText, permission: PERMISSIONS.ADMIN_REPORTS_VIEW },
  { label: 'Pagos', path: ROUTES['admin-payments'], icon: icons.gem, permission: PERMISSIONS.ADMIN_PAYMENTS_MANAGE },
  { label: 'Comisiones', path: ROUTES['admin-commissions'], icon: icons.ticketPercent, permission: PERMISSIONS.ADMIN_COMMISSIONS_MANAGE },
  { label: 'IA', path: ROUTES['admin-ai'], icon: icons.helpCircle, permission: PERMISSIONS.ADMIN_AI_MANAGE },
  { label: 'Moderación', path: ROUTES['admin-moderation'], icon: icons.checkCircle2, permission: PERMISSIONS.ADMIN_MODERATION_MANAGE },
];

const SECONDARY: NavItem[] = [
  { label: 'Productos', path: ROUTES['creator-products'], icon: icons.shoppingBasket, permission: PERMISSIONS.CREATOR_PRODUCTS_VIEW },
  { label: 'Studio AI', path: ROUTES['creator-studio-ai'], icon: icons.images, permission: PERMISSIONS.CREATOR_STUDIO_USE },
  {
    label: 'Reservas',
    path: ROUTES['creator-bookings'],
    icon: icons.calendar,
    permission: PERMISSIONS.CREATOR_BOOKINGS_MANAGE,
    children: [
      { label: 'Mis reservas', path: ROUTES['creator-bookings'], icon: icons.calendar, permission: PERMISSIONS.CREATOR_BOOKINGS_MANAGE },
      { label: 'Configuración de llamadas', path: ROUTES['creator-call-settings'], icon: icons.settings, permission: PERMISSIONS.CREATOR_BOOKINGS_MANAGE },
    ],
  },
  { label: 'Ingresos', path: ROUTES['creator-earnings'], icon: icons.gem, permission: PERMISSIONS.CREATOR_EARNINGS_VIEW },
  { label: 'Equipos', path: ROUTES['creator-work-teams'], icon: icons.users, customExpandable: true, permission: PERMISSIONS.MODERATOR_TEAMS_MANAGE },
  { label: 'Paquetes', path: ROUTES['admin-pricing'], icon: icons.layers, permission: PERMISSIONS.ADMIN_PAYMENTS_MANAGE },
];

const THIRD: NavItem[] = [];

const FOURTH: NavItem[] = [
  { label: 'Membresía', path: ROUTES.membership, icon: icons.gem, permission: PERMISSIONS.CREATOR_DASHBOARD_VIEW },
  { label: 'Ajustes', path: ROUTES.settings, icon: icons.settings, permission: PERMISSIONS.SHARED_SETTINGS_EDIT },
];

const NAVIGATION: NavSections = {
  primary: PRIMARY,
  secondary: SECONDARY,
  third: THIRD,
  fourth: FOURTH,
};

/**
 * Navegación completa (sin filtrar). El sidebar filtra cada sección con
 * hasPermission(). Patrón del PDF: items.filter(i => hasPermission(i.permission)).
 */
export const getNavigation = (): NavSections => NAVIGATION;

// Alias retrocompatible: la navegación ya no depende del rol (se filtra por permiso).
export const getNavigationByRole = (_role?: unknown): NavSections => NAVIGATION;
