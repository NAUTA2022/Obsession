import type { LucideIcon } from 'lucide-react';
import { ROUTES } from './routes';
import { images } from '../config/assets';
import { icons } from '../config/icons';
import type { TranslationKey } from '../i18n';

export type NavItem = {
  label: string;
  labelKey?: TranslationKey;
  path: string;
  icon?: LucideIcon;
  imageUrl?: string;
  children?: NavItem[];
};

// Function to create navigation items with translation keys
export const createNavItems = () => ({
  NAV_ITEMS: [
    { 
      labelKey: 'nav.dashboard' as TranslationKey, 
      label: 'Dashboard', 
      path: ROUTES.dashboard, 
      icon: icons.dashboard 
    },
    { 
      labelKey: 'sections.profile' as TranslationKey, 
      label: 'Perfil', 
      path: ROUTES.profile, 
      icon: icons.user, 
      imageUrl: images.sampleProfile 
    },
    { 
      labelKey: 'sections.conversations' as TranslationKey, 
      label: 'Conversaciones', 
      path: ROUTES.chatMessage, 
      icon: icons.messageCircle 
    },
    { 
      labelKey: 'sections.crm' as TranslationKey,
      label: 'CRM', 
      path: ROUTES.crm, 
      icon: icons.helpCircle,
      children: [
        { labelKey: 'nav.dashboard' as TranslationKey, label: 'Dashboard', path: ROUTES['crm-dashboard'], icon: icons.dashboard },
        { labelKey: 'sections.deals' as TranslationKey, label: 'Deals', path: ROUTES['crm-deals'], icon: icons.ticketPercent },
      ]
    },
    { 
      labelKey: 'sections.contacts' as TranslationKey,
      label: 'Contactos', 
      path: ROUTES.contacts, 
      icon: icons.contact,
      children: [
        { labelKey: 'sections.contactsList' as TranslationKey, label: 'Lista de Contactos', path: ROUTES.contacts, icon: icons.contact },
        { labelKey: 'sections.groups' as TranslationKey, label: 'Grupos', path: ROUTES.contacts, icon: icons.users },
        { labelKey: 'sections.import' as TranslationKey, label: 'Importar', path: ROUTES.contacts, icon: icons.contact },
      ]
    },
  ] as NavItem[],

  NAV_ITEMS_SECONDARY: [
    { labelKey: 'sections.products' as TranslationKey, label: 'Productos', path: ROUTES.products, icon: icons.shoppingBasket },
    { labelKey: 'sections.calendar' as TranslationKey, label: 'Calendario', path: ROUTES.calendar, icon: icons.calendar },
    { labelKey: 'sections.tasks' as TranslationKey, label: 'Tareas', path: ROUTES.tasks, icon: icons.bookCheck },
  ] as NavItem[],

  NAV_ITEMS_THIRD: [
    { labelKey: 'sections.salespeople' as TranslationKey, label: 'Vendedores', path: ROUTES.salespeople, icon: icons.users },
    { labelKey: 'sections.gallery' as TranslationKey, label: 'Galería', path: ROUTES.gallery, icon: icons.images },
  ] as NavItem[],

  NAV_ITEMS_FOURTH: [
    { labelKey: 'sections.membership' as TranslationKey, label: 'Membresía', path: ROUTES.membership, icon: icons.gem },
    { labelKey: 'nav.settings' as TranslationKey, label: 'Ajustes', path: ROUTES.settings, icon: icons.settings },
  ] as NavItem[],
});

// Helper function to translate navigation items
export const translateNavItems = (
  items: NavItem[], 
  t: (key: TranslationKey) => string
): NavItem[] => {
  return items.map(item => ({
    ...item,
    label: item.labelKey ? t(item.labelKey) : item.label,
    children: item.children ? translateNavItems(item.children, t) : undefined
  }));
};
