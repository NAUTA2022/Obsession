import type { LucideIcon } from 'lucide-react';
import { ROUTES } from './routes';
import { images } from '../config/assets'
import { icons } from '../config/icons'

export type NavItem = {
  label: string;
  path: string;
  icon?: LucideIcon;
  imageUrl?: string;
  children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.dashboard, icon: icons.dashboard },
  { label: 'Perfil', path: ROUTES.profile, icon: icons.user, imageUrl: images.sampleProfile },
  { label: 'Conversaciones', path: ROUTES.chatMessage, icon: icons.messageCircle },
  {
    label: 'Contactos',
    path: ROUTES.contacts,
    icon: icons.contact,
    children: [
      { label: 'Lista de Contactos', path: ROUTES.contacts, icon: icons.contact },
    ]
  },
];

export const NAV_ITEMS_SECONDARY: NavItem[] = [
  { label: 'Productos', path: ROUTES.products, icon: icons.shoppingBasket },
];

export const NAV_ITEMS_THIRD: NavItem[] = [];

export const NAV_ITEMS_FOURTH: NavItem[] = [
  { label: 'Membresia', path: ROUTES.membership, icon: icons.gem },
  { label: 'Ajustes', path: ROUTES.settings, icon: icons.settings },

];
