import { useLocation } from 'react-router-dom';

const TITLES: { pattern: RegExp; label: string }[] = [
  { pattern: /^\/creator\/dashboard/, label: 'Dashboard' },
  { pattern: /^\/creator\/products/, label: 'Productos' },
  { pattern: /^\/creator\/sellers/, label: 'Descubrir vendedores' },
  { pattern: /^\/creator\/collaborations/, label: 'Mis vendedores' },
  { pattern: /^\/creator\/crm\/deals/, label: 'Deals' },
  { pattern: /^\/creator\/crm/, label: 'CRM' },
  { pattern: /^\/creator\/contacts/, label: 'Contactos' },
  { pattern: /^\/creator\/bookings/, label: 'Reservas' },
  { pattern: /^\/creator\/settings\/calls/, label: 'Config. llamadas' },
  { pattern: /^\/creator\/studio-ai/, label: 'Studio AI' },
  { pattern: /^\/creator\/earnings/, label: 'Ingresos' },
  { pattern: /^\/creator\/work-teams/, label: 'Equipos' },
  { pattern: /^\/customer\/creators/, label: 'Creadoras' },
  { pattern: /^\/customer\/creator\//, label: 'Perfil de creadora' },
  { pattern: /^\/customer\/purchases/, label: 'Mis compras' },
  { pattern: /^\/customer\/bookings/, label: 'Mis reservas' },
  { pattern: /^\/customer\/planes/, label: 'Planes' },
  { pattern: /^\/seller\/dashboard/, label: 'Inicio' },
  { pattern: /^\/seller\/creators/, label: 'Mis creadoras' },
  { pattern: /^\/seller\/chat/, label: 'Chats' },
  { pattern: /^\/seller\/links/, label: 'Links' },
  { pattern: /^\/seller\/commissions/, label: 'Comisiones' },
  { pattern: /^\/seller\/ai-sales/, label: 'IA Comercial' },
  { pattern: /^\/seller\/analytics/, label: 'Analytics' },
  { pattern: /^\/admin\/users/, label: 'Usuarios' },
  { pattern: /^\/admin\/audit-log/, label: 'Registro de auditoría' },
  { pattern: /^\/admin\/pricing/, label: 'Paquetes y precios' },
  { pattern: /^\/admin\/creators/, label: 'Creadoras' },
  { pattern: /^\/admin\/sellers/, label: 'Vendedores' },
  { pattern: /^\/admin\/reports/, label: 'Reportes' },
  { pattern: /^\/admin\/payments/, label: 'Pagos' },
  { pattern: /^\/admin\/moderation/, label: 'Moderación' },
  { pattern: /^\/messages/, label: 'Mensajes' },
  { pattern: /^\/inbox/, label: 'Inbox' },
  { pattern: /^\/mensajes/, label: 'Mensajes' },
  { pattern: /^\/profile/, label: 'Mi perfil' },
  { pattern: /^\/settings/, label: 'Ajustes' },
  { pattern: /^\/notifications/, label: 'Notificaciones' },
  { pattern: /^\/collaborations/, label: 'Colaboraciones' },
  { pattern: /^\/discover-sellers/, label: 'Descubrir vendedores' },
  { pattern: /^\/gallery/, label: 'Galería' },
  { pattern: /^\/membership/, label: 'Membresía' },
  { pattern: /^\/onboarding/, label: 'Configuración de cuenta' },
];

export function usePageTitle(): string {
  const { pathname } = useLocation();
  const match = TITLES.find(({ pattern }) => pattern.test(pathname));
  return match?.label ?? 'Obsesion';
}
