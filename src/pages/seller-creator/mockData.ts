/**
 * Shared mock data for seller-creator tabs.
 * Replace each array with a real API call when the endpoint is ready.
 */

import type { DealCardData } from '../../components/ui/DealCard';
import type { Contact } from '../../types/contacts';

// ── CRM deals ─────────────────────────────────────────────────────────────────

export const MOCK_DEALS: DealCardData[] = [
  { id: 'd1', name: 'Mariana García',  phone: '+57 311 234 5678', stage: 'proposal',      value: 149900, tag: 'Sesión 1:1',     priority: 'high'   },
  { id: 'd2', name: 'Valentina Ríos',  phone: '+57 320 555 1122', stage: 'negotiation',   value: 89900,  tag: 'Pack Fotos',     priority: 'medium' },
  { id: 'd3', name: 'Andrea Morales',  phone: '+57 318 444 9988', stage: 'review',        value: 49900,  tag: 'Suscripción',    priority: 'low'    },
  { id: 'd4', name: 'Lucia Fernández', phone: '+57 302 987 6543', stage: 'closing-green', value: 199900, tag: 'Video Personal', priority: 'high'   },
  { id: 'd5', name: 'Camila Soto',     phone: '+57 315 777 4433', stage: 'closing-green', value: 149900, tag: 'Sesión 1:1',     priority: 'medium' },
  { id: 'd6', name: 'Sofía Herrera',   phone: '+57 301 222 6677', stage: 'closing-red',   value: 89900,  tag: 'Pack Fotos',     priority: 'low'    },
  { id: 'd7', name: 'Isabella Mora',   phone: '+57 317 888 3344', stage: 'selection',     value: 249900, tag: 'Paquete VIP',    priority: 'medium' },
  { id: 'd8', name: 'Daniela Reyes',   phone: '+57 312 111 5566', stage: 'delivery',      value: 149900, tag: 'Sesión 1:1',     priority: 'low'    },
];

// ── Contacts ──────────────────────────────────────────────────────────────────

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'ct1', name: 'Mariana García',
    email: 'mariana@gmail.com', phoneNumber: '+57 311 234 5678',
    purchases: 0, note: 'Interesada en el pack premium. Seguimiento el viernes.',
    status: 'Pendiente', source: 'whatsapp',
    dealId: 'd1', dealStage: 'proposal',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ct2', name: 'Lucia Fernández',
    email: 'lucia.f@hotmail.com', phoneNumber: '+57 302 987 6543',
    purchases: 2, note: 'Cliente frecuente, compró sesión y video.',
    status: 'Aprobado', source: 'manual',
    dealId: 'd4', dealStage: 'closing-green',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ct3', name: 'Valentina Ríos',
    email: 'vale@gmail.com', phoneNumber: '+57 320 555 1122',
    purchases: 0, note: 'Quiere coordinar llamada esta semana.',
    status: 'Pendiente', source: 'whatsapp',
    dealId: 'd2', dealStage: 'negotiation',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ct4', name: 'Camila Soto',
    email: 'camila.s@gmail.com', phoneNumber: '+57 315 777 4433',
    purchases: 1, note: 'Ya agendó sesión para el viernes.',
    status: 'Aprobado', source: 'whatsapp',
    dealId: 'd5', dealStage: 'closing-green',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ct5', name: 'Andrea Morales',
    email: 'andream@yahoo.com', phoneNumber: '+57 318 444 9988',
    purchases: 0, note: 'Preguntó por descuento referido.',
    status: 'Pendiente', source: 'manual',
    dealId: 'd3', dealStage: 'review',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ct6', name: 'Sofía Herrera',
    email: 'sofia.h@gmail.com', phoneNumber: '+57 301 222 6677',
    purchases: 0, note: 'No mostró interés por ahora.',
    status: 'Rechazado', source: 'import',
    dealId: 'd6', dealStage: 'closing-red',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Products (mock, compatible with CardProducts) ─────────────────────────────

export type MockProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'Membresía' | 'Común' | 'Servicio' | 'Producto' | 'Paquete';
  thumbnail: string | null;
  photoCount?: number;
  videoCount?: number;
  totalSales: number;
};

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'p1', title: 'Sesión 1:1 Premium', type: 'Servicio', price: 149900,
    description: 'Llamada privada de 45 min con experiencia personalizada.',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
    totalSales: 23,
  },
  {
    id: 'p2', title: 'Pack Fotos Exclusivas', type: 'Paquete', price: 89900,
    description: '20 fotos en alta resolución, temática a elección.',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80',
    photoCount: 20, totalSales: 41,
  },
  {
    id: 'p3', title: 'Video Personalizado', type: 'Producto', price: 199900,
    description: 'Video dedicado, duración 3-5 min.',
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
    videoCount: 1, totalSales: 17,
  },
  {
    id: 'p4', title: 'Suscripción Mensual', type: 'Membresía', price: 49900,
    description: 'Acceso a todo el contenido exclusivo del mes.',
    thumbnail: null, totalSales: 88,
  },
  {
    id: 'p5', title: 'Paquete VIP', type: 'Paquete', price: 249900,
    description: 'Sesión + 10 fotos + video personalizado.',
    thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
    photoCount: 10, videoCount: 1, totalSales: 9,
  },
];

// ── Gallery ───────────────────────────────────────────────────────────────────

export type GalleryItem = {
  id: string;
  url: string;
  type: 'photo' | 'video' | 'ai';
  title: string;
  section: 'public' | 'ai' | 'premium';
};

export const MOCK_GALLERY: GalleryItem[] = [
  { id: 'g1',  url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80', type: 'photo', title: 'Sesión Estudio',  section: 'public'  },
  { id: 'g2',  url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80', type: 'photo', title: 'Look Premium',   section: 'premium' },
  { id: 'g3',  url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80', type: 'video', title: 'Promo Jun',      section: 'public'  },
  { id: 'g4',  url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', type: 'photo', title: 'Behind Scenes',  section: 'public'  },
  { id: 'g5',  url: 'https://images.unsplash.com/photo-1620912189867-cf62a6e6d78b?w=400&q=80', type: 'ai',    title: 'AI Creación 1',  section: 'ai'      },
  { id: 'g6',  url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', type: 'video', title: 'Teaser Junio',   section: 'premium' },
  { id: 'g7',  url: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400&q=80', type: 'ai',    title: 'AI Creación 2',  section: 'ai'      },
  { id: 'g8',  url: 'https://images.unsplash.com/photo-1516726817505-efcdc7025938?w=400&q=80', type: 'photo', title: 'Summer Look',    section: 'public'  },
  { id: 'g9',  url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', type: 'photo', title: 'Portfolio 3',    section: 'premium' },
];

// ── Conversations ─────────────────────────────────────────────────────────────

export type MockConversation = {
  id: string;
  name: string;
  initials: string;
  gradient: string;
  lastMsg: string;
  time: string;
  unread: number;
  status: 'open' | 'sold' | 'booked' | 'closed';
  contactId: string;
};

export const MOCK_CONVERSATIONS: MockConversation[] = [
  { id: 'cv1', name: 'Mariana García',  initials: 'M', gradient: 'from-pink-400 to-rose-500',     lastMsg: 'Hola! quiero saber más del paquete premium', time: 'Hace 5m',  unread: 2, status: 'open',   contactId: 'ct1' },
  { id: 'cv2', name: 'Lucia Fernández', initials: 'L', gradient: 'from-emerald-400 to-teal-500',  lastMsg: 'Gracias! Ya hice el pago ✅',                time: 'Hace 1h',  unread: 0, status: 'sold',   contactId: 'ct2' },
  { id: 'cv3', name: 'Valentina Ríos',  initials: 'V', gradient: 'from-violet-400 to-purple-500', lastMsg: 'Me gustaría coordinar una llamada',          time: 'Hace 3h',  unread: 1, status: 'open',   contactId: 'ct3' },
  { id: 'cv4', name: 'Camila Soto',     initials: 'C', gradient: 'from-amber-400 to-orange-500',  lastMsg: 'Perfecto, lo agendo para el viernes',        time: 'Ayer',     unread: 0, status: 'booked', contactId: 'ct4' },
  { id: 'cv5', name: 'Andrea Morales',  initials: 'A', gradient: 'from-blue-400 to-indigo-500',   lastMsg: '¿Tienen descuento por referido?',            time: 'Ayer',     unread: 0, status: 'open',   contactId: 'ct5' },
  { id: 'cv6', name: 'Sofía Herrera',   initials: 'S', gradient: 'from-slate-400 to-gray-500',    lastMsg: 'No me interesa por ahora, gracias',          time: 'Hace 2d',  unread: 0, status: 'closed', contactId: 'ct6' },
];

// ── Bookings ──────────────────────────────────────────────────────────────────

export type MockBooking = {
  id: string;
  client: string;
  clientInitials: string;
  gradient: string;
  dateLabel: string;
  isoDate: string;
  time: string;
  product: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  amount: number;
  contactId: string;
};

const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const nextMon = new Date(today); nextMon.setDate(today.getDate() + 3);
const prevMon = new Date(today); prevMon.setDate(today.getDate() - 3);
const prevWed = new Date(today); prevWed.setDate(today.getDate() - 5);
const prevFri = new Date(today); prevFri.setDate(today.getDate() - 7);

const fmt = (d: Date) => d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

export const MOCK_BOOKINGS: MockBooking[] = [
  { id: 'b1', client: 'Mariana García',  clientInitials: 'M', gradient: 'from-pink-400 to-rose-500',     dateLabel: 'Hoy',         isoDate: today.toISOString(),    time: '15:00', product: 'Sesión 1:1 Premium', status: 'upcoming',   amount: 149900, contactId: 'ct1' },
  { id: 'b2', client: 'Camila Soto',     clientInitials: 'C', gradient: 'from-amber-400 to-orange-500',  dateLabel: 'Hoy',         isoDate: today.toISOString(),    time: '18:30', product: 'Sesión 1:1 Premium', status: 'upcoming',   amount: 149900, contactId: 'ct4' },
  { id: 'b3', client: 'Valentina Ríos',  clientInitials: 'V', gradient: 'from-violet-400 to-purple-500', dateLabel: fmt(tomorrow),  isoDate: tomorrow.toISOString(), time: '10:30', product: 'Sesión 1:1 Premium', status: 'upcoming',   amount: 149900, contactId: 'ct3' },
  { id: 'b4', client: 'Andrea Morales',  clientInitials: 'A', gradient: 'from-blue-400 to-indigo-500',   dateLabel: fmt(nextMon),   isoDate: nextMon.toISOString(),  time: '14:00', product: 'Sesión 1:1 Premium', status: 'upcoming',   amount: 149900, contactId: 'ct5' },
  { id: 'b5', client: 'Lucia Fernández', clientInitials: 'L', gradient: 'from-emerald-400 to-teal-500',  dateLabel: fmt(prevMon),   isoDate: prevMon.toISOString(),  time: '09:00', product: 'Video Personalizado', status: 'completed',  amount: 199900, contactId: 'ct2' },
  { id: 'b6', client: 'Camila Soto',     clientInitials: 'C', gradient: 'from-amber-400 to-orange-500',  dateLabel: fmt(prevWed),   isoDate: prevWed.toISOString(),  time: '16:00', product: 'Sesión 1:1 Premium', status: 'completed',  amount: 149900, contactId: 'ct4' },
  { id: 'b7', client: 'Sofía Herrera',   clientInitials: 'S', gradient: 'from-slate-400 to-gray-500',    dateLabel: fmt(prevFri),   isoDate: prevFri.toISOString(),  time: '11:00', product: 'Pack Fotos',         status: 'cancelled',  amount: 89900,  contactId: 'ct6' },
];
