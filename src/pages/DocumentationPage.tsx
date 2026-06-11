import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronRight, ChevronDown, Search, X,
  Home, Users, ShoppingBag, MessageCircle, Settings,
  LayoutDashboard, Target, BarChart2, Bot, DollarSign,
  Compass, Shield, User, Package, Calendar, Handshake,
  Globe, Lock, Zap, Star, ArrowRight, Code, Info,
  Hash, ExternalLink, Menu,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DocSection {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  children?: DocSection[];
}

interface DocContent {
  title: string;
  badge?: string;
  badgeColor?: string;
  route?: string;
  description: string;
  features?: { icon: React.ReactNode; title: string; desc: string }[];
  props?: { name: string; type: string; desc: string }[];
  notes?: string[];
}

// ── Sidebar tree ──────────────────────────────────────────────────────────────
const NAV: DocSection[] = [
  {
    id: 'overview', icon: <BookOpen className="w-4 h-4" />, label: 'Introducción', color: 'text-violet-500',
  },
  {
    id: 'roles', icon: <Users className="w-4 h-4" />, label: 'Roles de usuario', color: 'text-blue-500',
    children: [
      { id: 'role-customer', icon: <User className="w-3.5 h-3.5" />, label: 'Cliente', color: 'text-blue-400' },
      { id: 'role-creator', icon: <Star className="w-3.5 h-3.5" />, label: 'Creadora', color: 'text-violet-400' },
      { id: 'role-seller', icon: <Target className="w-3.5 h-3.5" />, label: 'Vendedor', color: 'text-cyan-400' },
      { id: 'role-admin', icon: <Shield className="w-3.5 h-3.5" />, label: 'Admin', color: 'text-amber-400' },
    ],
  },
  {
    id: 'auth', icon: <Lock className="w-4 h-4" />, label: 'Autenticación', color: 'text-rose-500',
  },
  {
    id: 'customer', icon: <Home className="w-4 h-4" />, label: 'Sección Cliente', color: 'text-blue-500',
    children: [
      { id: 'customer-creators', icon: <Star className="w-3.5 h-3.5" />, label: 'Creadoras', color: 'text-blue-400' },
      { id: 'customer-purchases', icon: <ShoppingBag className="w-3.5 h-3.5" />, label: 'Mis Compras', color: 'text-blue-400' },
      { id: 'customer-messages', icon: <MessageCircle className="w-3.5 h-3.5" />, label: 'Mensajes', color: 'text-blue-400' },
      { id: 'customer-bookings', icon: <Calendar className="w-3.5 h-3.5" />, label: 'Reservas', color: 'text-blue-400' },
    ],
  },
  {
    id: 'creator', icon: <Star className="w-4 h-4" />, label: 'Sección Creadora', color: 'text-violet-500',
    children: [
      { id: 'creator-dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Dashboard', color: 'text-violet-400' },
      { id: 'creator-products', icon: <Package className="w-3.5 h-3.5" />, label: 'Productos', color: 'text-violet-400' },
      { id: 'creator-crm', icon: <Target className="w-3.5 h-3.5" />, label: 'CRM', color: 'text-violet-400' },
      { id: 'creator-inbox', icon: <MessageCircle className="w-3.5 h-3.5" />, label: 'Inbox', color: 'text-violet-400' },
      { id: 'creator-sellers', icon: <Handshake className="w-3.5 h-3.5" />, label: 'Vendedores', color: 'text-violet-400' },
      { id: 'creator-earnings', icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Ingresos', color: 'text-violet-400' },
      { id: 'creator-studio', icon: <Bot className="w-3.5 h-3.5" />, label: 'Studio AI', color: 'text-violet-400' },
      { id: 'creator-bookings', icon: <Calendar className="w-3.5 h-3.5" />, label: 'Reservas', color: 'text-violet-400' },
    ],
  },
  {
    id: 'seller', icon: <Target className="w-4 h-4" />, label: 'Sección Vendedor', color: 'text-cyan-500',
    children: [
      { id: 'seller-dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Dashboard', color: 'text-cyan-400' },
      { id: 'seller-discover', icon: <Compass className="w-3.5 h-3.5" />, label: 'Descubrir Creadoras', color: 'text-cyan-400' },
      { id: 'seller-creators', icon: <Handshake className="w-3.5 h-3.5" />, label: 'Mis Creadoras', color: 'text-cyan-400' },
      { id: 'seller-commissions', icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Comisiones', color: 'text-cyan-400' },
      { id: 'seller-ai', icon: <Bot className="w-3.5 h-3.5" />, label: 'IA Comercial', color: 'text-cyan-400' },
      { id: 'seller-analytics', icon: <BarChart2 className="w-3.5 h-3.5" />, label: 'Analytics', color: 'text-cyan-400' },
      { id: 'seller-profile-public', icon: <Globe className="w-3.5 h-3.5" />, label: 'Perfil Público', color: 'text-cyan-400' },
    ],
  },
  {
    id: 'admin', icon: <Shield className="w-4 h-4" />, label: 'Sección Admin', color: 'text-amber-500',
    children: [
      { id: 'admin-users', icon: <Users className="w-3.5 h-3.5" />, label: 'Usuarios', color: 'text-amber-400' },
      { id: 'admin-pricing', icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Precios', color: 'text-amber-400' },
      { id: 'admin-audit', icon: <Code className="w-3.5 h-3.5" />, label: 'Audit Log', color: 'text-amber-400' },
    ],
  },
  {
    id: 'onboarding', icon: <Zap className="w-4 h-4" />, label: 'Onboarding', color: 'text-emerald-500',
  },
  {
    id: 'components', icon: <Code className="w-4 h-4" />, label: 'Componentes', color: 'text-pink-500',
    children: [
      { id: 'comp-sidebar', icon: <Menu className="w-3.5 h-3.5" />, label: 'Sidebar', color: 'text-pink-400' },
      { id: 'comp-navbar', icon: <Hash className="w-3.5 h-3.5" />, label: 'Navbar', color: 'text-pink-400' },
      { id: 'comp-kanban', icon: <Target className="w-3.5 h-3.5" />, label: 'KanbanBoard', color: 'text-pink-400' },
      { id: 'comp-charts', icon: <BarChart2 className="w-3.5 h-3.5" />, label: 'Charts', color: 'text-pink-400' },
      { id: 'comp-usermenu', icon: <User className="w-3.5 h-3.5" />, label: 'UserMenu', color: 'text-pink-400' },
    ],
  },
];

// ── Content map ───────────────────────────────────────────────────────────────
const CONTENT: Record<string, DocContent> = {
  overview: {
    title: 'Obsession Platform',
    badge: 'v1.0',
    badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
    description: 'Obsession es una plataforma de colaboración entre **Creadoras de contenido**, **Vendedores colaborativos** y **Clientes**. Permite monetizar contenido digital, gestionar relaciones comerciales y automatizar ventas con IA.',
    features: [
      { icon: <Users className="w-4 h-4" />, title: 'Multi-rol', desc: 'Un mismo usuario puede tener rol de Cliente, Creadora y Vendedor simultáneamente y cambiar de modo desde el menú.' },
      { icon: <Zap className="w-4 h-4" />, title: 'IA integrada', desc: 'Agentes de IA para responder mensajes, asistir ventas y generar contenido en Studio AI.' },
      { icon: <DollarSign className="w-4 h-4" />, title: 'Monetización', desc: 'Sistema de productos, suscripciones, reservas de llamadas y comisiones de vendedores.' },
      { icon: <BarChart2 className="w-4 h-4" />, title: 'Analytics', desc: 'Dashboards con métricas en tiempo real para creadoras y vendedores.' },
    ],
    notes: [
      'Stack: React 18 + Vite + TypeScript + TailwindCSS + Framer Motion',
      'Estado global con Zustand — stores: auth, ui, onboardingCreator, onboardingSeller',
      'Autenticación con Thirdweb (wallet) + JWT',
      'Drag & drop con @dnd-kit/core en KanbanBoard del CRM',
    ],
  },

  roles: {
    title: 'Roles de usuario',
    description: 'La plataforma maneja 5 roles distintos, cada uno con permisos específicos definidos en `src/constants/permissions.ts`. El rol activo determina qué secciones del sidebar se muestran y a qué rutas tiene acceso.',
    features: [
      { icon: <User className="w-4 h-4" />, title: 'customer', desc: 'Usuario que consume contenido. Puede ver creadoras, comprar productos, reservar llamadas y enviar mensajes.' },
      { icon: <Star className="w-4 h-4" />, title: 'creator', desc: 'Creadora de contenido. Gestiona productos, CRM, vendedores, reservas, ingresos y Studio AI.' },
      { icon: <Target className="w-4 h-4" />, title: 'vendedor', desc: 'Vendedor colaborativo. Trabaja bajo creadoras para conseguir clientes y cobra comisión por ventas.' },
      { icon: <Shield className="w-4 h-4" />, title: 'admin', desc: 'Solo accesible para andresquinteros2017@gmail.com. Gestiona usuarios, precios y logs del sistema.' },
    ],
    notes: [
      'Al recargar la página, el usuario siempre inicia en rol "customer" aunque tenga otros roles activos.',
      'Para cambiar de rol: clic en la foto de perfil (navbar) → "Cambiar modo".',
      'Los flags creatorOnboarded y sellerOnboarded controlan qué roles aparecen en el selector.',
    ],
  },

  'role-customer': {
    title: 'Rol: Cliente',
    badge: 'customer',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    description: 'El rol base de la plataforma. Todo usuario nuevo entra como cliente. Puede explorar creadoras, comprar contenido y comunicarse.',
    features: [
      { icon: <Star className="w-4 h-4" />, title: 'Explorar Creadoras', desc: 'Listado de creadoras disponibles con búsqueda y filtros.' },
      { icon: <ShoppingBag className="w-4 h-4" />, title: 'Compras', desc: 'Historial de productos adquiridos y acceso a contenido desbloqueado.' },
      { icon: <MessageCircle className="w-4 h-4" />, title: 'Mensajes', desc: 'Inbox de conversaciones con creadoras.' },
      { icon: <Calendar className="w-4 h-4" />, title: 'Reservas', desc: 'Booking de llamadas 1:1 con creadoras.' },
    ],
    notes: [
      'Permisos: CUSTOMER_CREATORS_BROWSE, CUSTOMER_PURCHASES_VIEW, CUSTOMER_MESSAGES_ACCESS, CUSTOMER_BOOKINGS_VIEW + SHARED.',
      'Sidebar: Creadoras/as, Mensajes, Mis compras, Perfil.',
      'Banner en sidebar: anuncios para convertirse en Creadora o Vendedor.',
    ],
  },

  'role-creator': {
    title: 'Rol: Creadora',
    badge: 'creator',
    badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
    description: 'Creadora de contenido digital. Tiene acceso al dashboard completo con métricas, gestión de productos, CRM de clientes, equipo de vendedores e IA.',
    features: [
      { icon: <LayoutDashboard className="w-4 h-4" />, title: 'Dashboard', desc: 'KPIs de ingresos, ventas activas, reservas del día y gráficos de rendimiento.' },
      { icon: <Package className="w-4 h-4" />, title: 'Productos', desc: 'CRUD de productos digitales con galería, precios y configuración de acceso.' },
      { icon: <Target className="w-4 h-4" />, title: 'CRM', desc: 'Kanban de deals, contactos y seguimiento de pipeline de ventas.' },
      { icon: <Handshake className="w-4 h-4" />, title: 'Vendedores', desc: 'Descubrir nuevos vendedores y gestionar colaboraciones activas.' },
      { icon: <Bot className="w-4 h-4" />, title: 'Studio AI', desc: 'Generación de contenido con IA y configuración del agente respondedor.' },
    ],
    notes: [
      'Ruta base: /creator/*',
      'El perfil público de creadora está en /p/:username (sin autenticación requerida).',
      'Flag: creatorOnboarded: true en el objeto user.',
    ],
  },

  'role-seller': {
    title: 'Rol: Vendedor',
    badge: 'vendedor',
    badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
    description: 'Vendedor colaborativo que trabaja bajo una o varias creadoras. Genera comisiones por cada venta que consigue para ellas.',
    features: [
      { icon: <LayoutDashboard className="w-4 h-4" />, title: 'Dashboard', desc: 'Comisiones del mes, tratos activos, contactos totales y acceso rápido a secciones.' },
      { icon: <Compass className="w-4 h-4" />, title: 'Descubrir Creadoras', desc: 'Grid de creadoras disponibles para solicitar colaboración con comisión propuesta.' },
      { icon: <DollarSign className="w-4 h-4" />, title: 'Comisiones', desc: 'Historial de comisiones ganadas, estado de pagos y solicitud de retiro.' },
      { icon: <Bot className="w-4 h-4" />, title: 'IA Comercial', desc: 'Chat con agente IA para redactar mensajes de venta, manejar objeciones y hacer seguimiento.' },
      { icon: <Globe className="w-4 h-4" />, title: 'Perfil Público', desc: 'Página pública /vendedor/:username con métricas, hitos y botón de colaboración.' },
    ],
    notes: [
      'Ruta base: /seller/*',
      'Flag: sellerOnboarded: true en el objeto user.',
      'Al iniciar sesión el sidebar muestra un banner fijo debajo con acceso a membresía y descubrir creadoras.',
    ],
  },

  'role-admin': {
    title: 'Rol: Admin',
    badge: 'admin',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    description: 'Acceso restringido exclusivamente a andresquinteros2017@gmail.com. Tiene control total sobre usuarios, configuración de precios y logs del sistema.',
    features: [
      { icon: <Users className="w-4 h-4" />, title: 'Usuarios', desc: 'Ver y gestionar todos los usuarios de la plataforma con filtros por rol.' },
      { icon: <DollarSign className="w-4 h-4" />, title: 'Pricing', desc: 'Configuración de planes y precios de membresía.' },
      { icon: <Code className="w-4 h-4" />, title: 'Audit Log', desc: 'Historial de acciones del sistema para auditoría.' },
    ],
    notes: [
      'Ruta base: /admin/* — protegida por AdminRoute en App.tsx.',
      'La guarda AdminRoute verifica user.role === "admin" o email === "andresquinteros2017@gmail.com".',
      'No ve banners de anuncios en el sidebar.',
    ],
  },

  auth: {
    title: 'Autenticación',
    description: 'La autenticación usa **Thirdweb** (wallet connect) combinado con JWT del backend. El flujo es: conectar wallet → verificar firma → obtener JWT → guardar en localStorage.',
    features: [
      { icon: <Lock className="w-4 h-4" />, title: 'Thirdweb Wallet', desc: 'Login via firma de mensaje con cualquier wallet compatible (MetaMask, WalletConnect, etc.).' },
      { icon: <Zap className="w-4 h-4" />, title: 'JWT', desc: 'accessToken y refreshToken almacenados en localStorage. El apiClient los adjunta automáticamente.' },
      { icon: <Shield className="w-4 h-4" />, title: 'ProtectedRoute', desc: 'Componente que verifica autenticación y permisos antes de renderizar cada ruta.' },
    ],
    notes: [
      'En desarrollo (DEV): se inyecta un usuario mock sin llamar al API. Ver AuthProvider.tsx.',
      'Al recargar: AuthProvider llama a /auth/me para restaurar sesión. Si falla → redirect a /login.',
      'NUNCA poner THIRDWEB_SECRET_KEY en el .env del frontend. Solo VITE_THIRDWEB_CLIENT_ID.',
      'Evento auth:unauthorized disparado por apiClient cuando recibe 401 → limpia el store.',
    ],
  },

  'customer-creators': {
    title: 'Creadoras',
    badge: '/customer/creators',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Listado principal de creadoras disponibles en la plataforma. Los clientes pueden explorar, filtrar y acceder al perfil de cada creadora.',
    features: [
      { icon: <Search className="w-4 h-4" />, title: 'Búsqueda y filtros', desc: 'Filtrar por categoría, idioma y disponibilidad.' },
      { icon: <Star className="w-4 h-4" />, title: 'Cards de creadora', desc: 'Foto, nombre, categoría, seguidores y botón de acción.' },
      { icon: <ExternalLink className="w-4 h-4" />, title: 'Detalle', desc: 'Clic en una card navega a /customer/creator/:id con perfil completo, galería y productos.' },
    ],
    route: '/customer/creators',
  },

  'customer-purchases': {
    title: 'Mis Compras',
    badge: '/customer/purchases',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Historial de todos los productos adquiridos por el cliente con acceso al contenido desbloqueado.',
    route: '/customer/purchases',
    notes: ['Requiere permiso CUSTOMER_PURCHASES_VIEW.'],
  },

  'customer-messages': {
    title: 'Mensajes (Cliente)',
    badge: '/mensajes',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Inbox del cliente para conversar con creadoras. Permite enviar mensajes, contenido bloqueado y ver respuestas.',
    route: '/mensajes',
    notes: ['Componente: ClientInboxPage.tsx', 'Requiere permiso CUSTOMER_MESSAGES_ACCESS.'],
  },

  'customer-bookings': {
    title: 'Mis Reservas',
    badge: '/customer/bookings',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Gestión de reservas de llamadas con creadoras. Ver próximas llamadas, historial y acceder a la sala de llamada.',
    route: '/customer/bookings',
  },

  'creator-dashboard': {
    title: 'Dashboard Creadora',
    badge: '/creator/dashboard',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Panel principal de la creadora con métricas en tiempo real, acceso rápido a secciones y actividad reciente.',
    features: [
      { icon: <BarChart2 className="w-4 h-4" />, title: 'KPIs', desc: 'Ingresos del mes, ventas activas, reservas del día y nuevos seguidores.' },
      { icon: <Zap className="w-4 h-4" />, title: 'Acceso rápido', desc: 'Iconos de acceso directo a Productos, CRM, Inbox, Vendedores, etc.' },
      { icon: <Star className="w-4 h-4" />, title: 'Ranking', desc: 'Top vendedores y gráfico de ingresos por fuente.' },
    ],
    route: '/creator/dashboard',
  },

  'creator-products': {
    title: 'Productos',
    badge: '/creator/products',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'CRUD completo de productos digitales. La creadora puede crear, editar y eliminar productos con imágenes, precio, descripción y configuración de acceso.',
    features: [
      { icon: <Package className="w-4 h-4" />, title: 'Tipos de producto', desc: 'Foto, video, audio, llamada, suscripción mensual.' },
      { icon: <Settings className="w-4 h-4" />, title: 'Edición', desc: 'Ruta /creator/products/:id abre el editor completo del producto.' },
    ],
    route: '/creator/products',
  },

  'creator-crm': {
    title: 'CRM',
    badge: '/creator/crm',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Sistema de gestión de relaciones con clientes. Kanban de deals con drag & drop, pipeline visual y métricas de conversión.',
    features: [
      { icon: <Target className="w-4 h-4" />, title: 'Kanban', desc: 'Columnas: Nuevo lead → Contactado → En negociación → Cerrado. Drag & drop con @dnd-kit.' },
      { icon: <BarChart2 className="w-4 h-4" />, title: 'Dashboard', desc: 'KPIs del CRM: total deals, valor del pipeline, tasa de cierre.' },
      { icon: <Users className="w-4 h-4" />, title: 'Deals', desc: 'Cada deal tiene cliente, monto, etapa, prioridad y notas.' },
    ],
    route: '/creator/crm',
    notes: ['Componente KanbanBoard.tsx usa DndContext de @dnd-kit/core.'],
  },

  'creator-inbox': {
    title: 'Inbox Creadora',
    badge: '/inbox',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Inbox centralizado para que la creadora gestione todas sus conversaciones con clientes y vendedores.',
    route: '/inbox',
  },

  'creator-sellers': {
    title: 'Vendedores (Creadora)',
    badge: '/creator/sellers',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'La creadora puede descubrir vendedores disponibles y gestionar sus colaboraciones activas.',
    features: [
      { icon: <Compass className="w-4 h-4" />, title: 'Descubrir', desc: 'Grid de vendedores con modo swipe y grid. Filtros por categoría, idioma y % de comisión.' },
      { icon: <Handshake className="w-4 h-4" />, title: 'Colaboraciones', desc: 'Listado de vendedores activos con métricas de ventas generadas.' },
    ],
    route: '/creator/sellers',
  },

  'creator-earnings': {
    title: 'Ingresos',
    badge: '/creator/earnings',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Resumen completo de ingresos de la creadora. Gráficos por período, detalle por fuente de ingreso y historial de transacciones.',
    route: '/creator/earnings',
  },

  'creator-studio': {
    title: 'Studio AI',
    badge: '/creator/studio-ai',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Herramienta de IA para generación de contenido. Permite crear posts, captions, respuestas automáticas y configurar el agente respondedor de mensajes.',
    route: '/creator/studio-ai',
    notes: ['Requiere membresía activa para acceder al agente respondedor 24/7.'],
  },

  'creator-bookings': {
    title: 'Reservas (Creadora)',
    badge: '/creator/bookings',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Gestión de reservas entrantes de llamadas. La creadora puede ver agenda, aprobar/rechazar solicitudes y configurar su disponibilidad.',
    features: [
      { icon: <Calendar className="w-4 h-4" />, title: 'Agenda', desc: 'Vista de calendario con reservas confirmadas y pendientes.' },
      { icon: <Settings className="w-4 h-4" />, title: 'Configuración', desc: '/creator/settings/calls — duración de llamadas, precio, horarios disponibles.' },
    ],
    route: '/creator/bookings',
  },

  'seller-dashboard': {
    title: 'Dashboard Vendedor',
    badge: '/seller/dashboard',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Panel principal del vendedor con métricas de comisiones, tratos activos y acceso a todas las herramientas.',
    features: [
      { icon: <DollarSign className="w-4 h-4" />, title: 'Comisiones del mes', desc: 'Monto ganado en el período con comparativa al mes anterior.' },
      { icon: <Globe className="w-4 h-4" />, title: 'Perfil público', desc: 'Botón "Enviar mi perfil de vendedor" que copia el link /vendedor/:username.' },
      { icon: <BarChart2 className="w-4 h-4" />, title: 'Ranking creadoras', desc: 'Top creadoras con mayor ingreso generado por el vendedor.' },
    ],
    route: '/seller/dashboard',
  },

  'seller-discover': {
    title: 'Descubrir Creadoras',
    badge: '/seller/discover',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'El vendedor explora el catálogo de creadoras disponibles para solicitar colaboración. Tiene modo grid y modo swipe.',
    features: [
      { icon: <Search className="w-4 h-4" />, title: 'Búsqueda + filtros', desc: 'Filtrar por categoría de contenido y ubicación.' },
      { icon: <Handshake className="w-4 h-4" />, title: 'Solicitar colaboración', desc: 'Modal con preview de perfiles, slider de comisión propuesta (5–40%) y mensaje personalizado.' },
      { icon: <Zap className="w-4 h-4" />, title: 'Modo swipe', desc: 'Vista de cartas deslizables para descubrir creadoras de forma rápida.' },
    ],
    route: '/seller/discover',
  },

  'seller-creators': {
    title: 'Mis Creadoras',
    badge: '/seller/creators',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Listado de creadoras con las que el vendedor tiene colaboración activa. Desde aquí accede a la vista individual de cada creadora.',
    route: '/seller/creators',
    notes: ['Clic en una creadora navega a /seller/creator/:username con tabs de Dashboard, Productos, CRM, Contactos, Calendario, Galería y Conversaciones.'],
  },

  'seller-commissions': {
    title: 'Comisiones',
    badge: '/seller/commissions',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Historial completo de comisiones generadas, estado de pagos y solicitud de retiro.',
    features: [
      { icon: <DollarSign className="w-4 h-4" />, title: 'Stats', desc: 'Total ganado, este mes, ya pagado, por cobrar.' },
      { icon: <Search className="w-4 h-4" />, title: 'Filtros', desc: 'Por creadora, estado (pagada/en proceso/pendiente) y exportar CSV.' },
      { icon: <ArrowRight className="w-4 h-4" />, title: 'Retiro', desc: 'Modal para solicitar transferencia del saldo disponible.' },
    ],
    route: '/seller/commissions',
  },

  'seller-ai': {
    title: 'IA Comercial',
    badge: '/seller/ai-sales',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Chat con agente de IA especializado en ventas. Genera mensajes de prospección, seguimiento, manejo de objeciones y cierres.',
    features: [
      { icon: <Bot className="w-4 h-4" />, title: 'Templates rápidos', desc: 'Mensaje en frío, Seguimiento, Manejo de objeciones, Cierre, Upsell, Reactivar contacto.' },
      { icon: <MessageCircle className="w-4 h-4" />, title: 'Chat', desc: 'Interfaz de chat con historial de conversación y botón de copia en mensajes de IA.' },
    ],
    route: '/seller/ai-sales',
  },

  'seller-analytics': {
    title: 'Analytics Vendedor',
    badge: '/seller/analytics',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Análisis detallado del rendimiento del vendedor con gráficos, embudos de conversión y comparativas.',
    features: [
      { icon: <BarChart2 className="w-4 h-4" />, title: 'Selector de período', desc: '7D / 30D / 90D / 1A.' },
      { icon: <Target className="w-4 h-4" />, title: 'Funnel', desc: 'Embudo Alcance → Contactos → Conversaciones → Propuestas → Ventas.' },
      { icon: <Users className="w-4 h-4" />, title: 'Por creadora', desc: 'Tabla con contactos, ingresos y conversión por creadora.' },
    ],
    route: '/seller/analytics',
  },

  'seller-profile-public': {
    title: 'Perfil Público Vendedor',
    badge: '/vendedor/:username',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Página pública del vendedor accesible sin autenticación. Muestra métricas, hitos desbloqueados y un botón de solicitud de colaboración.',
    features: [
      { icon: <BarChart2 className="w-4 h-4" />, title: 'Métricas', desc: 'Ventas cerradas, creadoras activas, ingresos generados, tasa de conversión.' },
      { icon: <Star className="w-4 h-4" />, title: 'Hitos', desc: '10 logros desbloqueables. Los no alcanzados aparecen en escala de grises.' },
      { icon: <Handshake className="w-4 h-4" />, title: 'CollabModal', desc: 'Formulario de contacto para solicitar colaboración con el vendedor.' },
    ],
    route: '/vendedor/:username',
    notes: ['Ruta pública — no requiere autenticación.', 'El link se copia desde el Dashboard del vendedor con "Enviar mi perfil".'],
  },

  'admin-users': {
    title: 'Gestión de Usuarios',
    badge: '/admin/users',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Panel de administración de usuarios. Ver listado completo, filtrar por rol, ver detalles y gestionar cuentas.',
    route: '/admin/users',
  },

  'admin-pricing': {
    title: 'Precios y Planes',
    badge: '/admin/pricing',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Configuración de planes de membresía y precios de la plataforma. Solo visible para el admin.',
    route: '/admin/pricing',
  },

  'admin-audit': {
    title: 'Audit Log',
    badge: '/admin/audit-log',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
    description: 'Historial de todas las acciones del sistema para auditoría y debugging.',
    route: '/admin/audit-log',
  },

  onboarding: {
    title: 'Onboarding',
    description: 'Flujo de activación de nuevos roles. Un cliente puede convertirse en Creadora o Vendedor completando un wizard de pasos.',
    features: [
      { icon: <Star className="w-4 h-4" />, title: 'Wizard Creadora', desc: '/onboarding/creator — pasos: datos personales, tipo de contenido, configuración de precios.' },
      { icon: <Target className="w-4 h-4" />, title: 'Wizard Vendedor', desc: '/onboarding/seller — pasos: experiencia, especialidad, métodos de pago.' },
      { icon: <Zap className="w-4 h-4" />, title: 'Selección de path', desc: '/onboarding/select-path — pantalla previa para elegir qué rol activar.' },
    ],
    notes: [
      'Los banners del sidebar de cliente tienen botones CTA que llevan a estos wizards.',
      'Al completar, los flags creatorOnboarded/sellerOnboarded se actualizan en el backend.',
    ],
  },

  'comp-sidebar': {
    title: 'Sidebar',
    badge: 'components/layout/Sidebar.tsx',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    description: 'Sidebar de navegación principal. Adapta sus items según el rol activo del usuario, con soporte para colapso, mobile overlay y banners publicitarios.',
    features: [
      { icon: <Users className="w-4 h-4" />, title: 'Navegación por rol', desc: 'Los items se filtran con usePermissions() según los permisos del usuario activo.' },
      { icon: <Zap className="w-4 h-4" />, title: 'Banners por rol', desc: 'Cliente y Vendedor: banner fijo al bottom. Creadora: banner scrolleable con el contenido.' },
      { icon: <Menu className="w-4 h-4" />, title: 'Responsive', desc: 'En mobile: drawer overlay. En desktop: colapso a modo rail de iconos.' },
    ],
    notes: [
      'Estado: useUIStore → isSidebarOpen, isSidebarCollapsed.',
      'Los banners se auto-avanzan cada 5.5s con AnimatePresence mode="wait".',
      'SidebarPromoBanner muestra banners diferentes según user.role.',
    ],
  },

  'comp-navbar': {
    title: 'Navbar',
    badge: 'components/layout/Navbar.tsx',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    description: 'Barra de navegación superior. Contiene búsqueda, toggle de tema, idioma, notificaciones y menú de usuario.',
    features: [
      { icon: <Search className="w-4 h-4" />, title: 'Búsqueda', desc: 'Input expandible con animación. Tecla Escape lo cierra.' },
      { icon: <User className="w-4 h-4" />, title: 'UserMenu', desc: 'Dropdown con datos del usuario, cambio de rol y opciones de perfil/ajustes/logout.' },
      { icon: <Zap className="w-4 h-4" />, title: 'Role hint bubble', desc: 'Globo animado que aparece la primera vez que el usuario tiene múltiples roles, apuntando al avatar.' },
    ],
    notes: ['El hint bubble se guarda en localStorage con clave obsession_role_hint_seen.'],
  },

  'comp-kanban': {
    title: 'KanbanBoard',
    badge: 'components/ui/KanbanBoard.tsx',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    description: 'Tablero Kanban con drag & drop para el CRM. Permite mover deals entre columnas y reordenar dentro de la misma columna.',
    props: [
      { name: 'deals', type: 'DealCardData[]', desc: 'Array de deals a mostrar en el tablero.' },
      { name: 'onDealsChange?', type: '(deals: DealCardData[]) => void', desc: 'Callback al reordenar o mover un deal.' },
    ],
    notes: [
      'Usa DndContext de @dnd-kit/core con PointerSensor (distance: 6) y TouchSensor (delay: 200ms).',
      'DragOverlay renderiza una copia flotante del deal mientras se arrastra.',
      'Al soltar: mismo-columna → arrayMove reorder; diferente-columna → actualiza stage + toast.',
    ],
  },

  'comp-charts': {
    title: 'Charts',
    badge: 'components/charts/',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-white/30',
    description: 'Biblioteca de gráficos reutilizables construidos con Recharts.',
    features: [
      { icon: <BarChart2 className="w-4 h-4" />, title: 'RevenueChart', desc: 'Gráfico de líneas de ingresos por período. Usado en Dashboard creadora y Analytics vendedor.' },
      { icon: <Target className="w-4 h-4" />, title: 'SalesGaugeChart', desc: 'Gauge circular de ventas. Usado en dashboards.' },
      { icon: <Users className="w-4 h-4" />, title: 'ClientStatusChart', desc: 'Donut chart del estado de clientes (activos/inactivos/nuevos).' },
      { icon: <Globe className="w-4 h-4" />, title: 'CountriesChart', desc: 'Mapa de clientes por país usando world-countries.json.' },
    ],
  },

  'comp-usermenu': {
    title: 'UserMenu',
    badge: 'components/ui/UserMenu.tsx',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    description: 'Dropdown del avatar de usuario en la Navbar. Muestra perfil, wallet, selector de rol y opciones de navegación.',
    features: [
      { icon: <User className="w-4 h-4" />, title: 'Cambio de rol', desc: 'Solo aparece si switchableRoles.length > 1. Llama a authStore.switchRole(role).' },
      { icon: <Zap className="w-4 h-4" />, title: 'switchRole()', desc: 'En DEV: cambia el rol directamente en el store. En producción: llama a /auth/switch-role.' },
    ],
    notes: [
      'switchableRoles se construye con user.creatorOnboarded y user.sellerOnboarded.',
      'Al cambiar de rol la app navega automáticamente a la home del nuevo rol.',
    ],
  },
};

// ── Helper components ──────────────────────────────────────────────────────────
function Badge({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full font-mono ${className}`}>
      {text}
    </span>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
      <div className="w-8 h-8 rounded-lg bg-[#6850E8]/10 text-[#6850E8] flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PropRow({ name, type, desc }: { name: string; type: string; desc: string }) {
  return (
    <tr className="border-b border-gray-100 dark:border-white/[0.06] last:border-0">
      <td className="py-2.5 pr-4">
        <code className="text-xs font-mono text-[#6850E8] dark:text-[#9277F5] bg-[#6850E8]/8 px-1.5 py-0.5 rounded">{name}</code>
      </td>
      <td className="py-2.5 pr-4">
        <code className="text-xs font-mono text-gray-500 dark:text-white/40">{type}</code>
      </td>
      <td className="py-2.5 text-xs text-gray-600 dark:text-white/50">{desc}</td>
    </tr>
  );
}

function renderMarkdown(text: string) {
  return text.split('**').map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-gray-900 dark:text-white">{part}</strong>
      : <span key={i}>{part}</span>
  );
}

// ── Nav item ──────────────────────────────────────────────────────────────────
function NavItem({ section, active, expanded, onSelect, onToggle, depth = 0 }: {
  section: DocSection;
  active: string;
  expanded: string[];
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  depth?: number;
}) {
  const hasChildren = section.children && section.children.length > 0;
  const isExpanded = expanded.includes(section.id);
  const isActive = active === section.id;

  return (
    <div>
      <button
        onClick={() => { onSelect(section.id); if (hasChildren) onToggle(section.id); }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all text-sm ${
          depth > 0 ? 'pl-7' : ''
        } ${
          isActive
            ? 'bg-[#6850E8]/10 text-[#6850E8] dark:bg-[#6850E8]/15 dark:text-[#9277F5] font-semibold'
            : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white/80'
        }`}
      >
        <span className={`shrink-0 ${isActive ? 'text-[#6850E8] dark:text-[#9277F5]' : section.color}`}>
          {section.icon}
        </span>
        <span className="flex-1 truncate">{section.label}</span>
        {hasChildren && (
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        )}
      </button>
      {hasChildren && isExpanded && (
        <div className="mt-0.5 space-y-0.5">
          {section.children!.map(child => (
            <NavItem
              key={child.id}
              section={child}
              active={active}
              expanded={expanded}
              onSelect={onSelect}
              onToggle={onToggle}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DocumentationPage() {
  const [active, setActive] = useState('overview');
  const [expanded, setExpanded] = useState<string[]>(['roles', 'customer', 'creator', 'seller']);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const content = CONTENT[active];

  const toggleExpand = (id: string) =>
    setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleSelect = (id: string) => {
    setActive(id);
    setSidebarOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter nav by search
  const searchLower = search.toLowerCase();
  const filteredNav = search
    ? NAV.flatMap(s => [s, ...(s.children ?? [])]).filter(s =>
        s.label.toLowerCase().includes(searchLower) ||
        CONTENT[s.id]?.description?.toLowerCase().includes(searchLower)
      )
    : NAV;

  // All sections flat for prev/next
  const allIds = NAV.flatMap(s => [s.id, ...(s.children?.map(c => c.id) ?? [])]);
  const currentIdx = allIds.indexOf(active);
  const prevId = currentIdx > 0 ? allIds[currentIdx - 1] : null;
  const nextId = currentIdx < allIds.length - 1 ? allIds[currentIdx + 1] : null;

  const getLabel = (id: string) =>
    NAV.flatMap(s => [s, ...(s.children ?? [])]).find(s => s.id === id)?.label ?? id;

  useEffect(() => {
    // Auto-expand parent when selecting child
    NAV.forEach(s => {
      if (s.children?.some(c => c.id === active)) {
        setExpanded(p => p.includes(s.id) ? p : [...p, s.id]);
      }
    });
  }, [active]);

  return (
    <div className="flex h-full overflow-hidden bg-white dark:bg-[#0D0D14]">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:relative z-50 md:z-auto
        inset-y-0 left-0
        w-64 shrink-0 flex flex-col
        bg-gray-50 dark:bg-[#0a0a12]
        border-r border-gray-200 dark:border-white/[0.06]
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200 dark:border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-[#6850E8] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Documentación</p>
            <p className="text-[10px] text-gray-400 dark:text-white/30">Obsession Platform</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-gray-200 dark:border-white/[0.06]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/25" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#6850E8]/40"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/20">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 [&::-webkit-scrollbar]:w-0">
          {search ? (
            filteredNav.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-white/25 text-center py-6">Sin resultados</p>
            ) : (
              filteredNav.map(s => (
                <NavItem key={s.id} section={s} active={active} expanded={expanded} onSelect={handleSelect} onToggle={toggleExpand} />
              ))
            )
          ) : (
            NAV.map(s => (
              <NavItem key={s.id} section={s} active={active} expanded={expanded} onSelect={handleSelect} onToggle={toggleExpand} />
            ))
          )}
        </nav>
      </aside>

      {/* ── Content ── */}
      <main ref={contentRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10">

        {/* Mobile topbar */}
        <div className="sticky top-0 z-10 md:hidden flex items-center gap-2 px-4 py-3 bg-white/90 dark:bg-[#0D0D14]/95 backdrop-blur border-b border-gray-200 dark:border-white/[0.06]">
          <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-white/40 dark:hover:bg-white/[0.06]">
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{content?.title ?? ''}</span>
        </div>

        <AnimatePresence mode="wait">
          {content ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="max-w-3xl mx-auto px-6 py-10"
            >
              {/* Title */}
              <div className="mb-8">
                {content.badge && (
                  <Badge text={content.badge} className={`mb-3 ${content.badgeColor}`} />
                )}
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">{content.title}</h1>
                {content.route && (
                  <div className="flex items-center gap-2 mb-4">
                    <code className="text-xs bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-white/50 px-2.5 py-1 rounded-lg font-mono border border-gray-200 dark:border-white/[0.08]">
                      {content.route}
                    </code>
                  </div>
                )}
                <p className="text-base text-gray-600 dark:text-white/60 leading-relaxed">
                  {renderMarkdown(content.description)}
                </p>
              </div>

              {/* Features */}
              {content.features && content.features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">Funcionalidades</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {content.features.map((f, i) => (
                      <FeatureCard key={i} {...f} />
                    ))}
                  </div>
                </div>
              )}

              {/* Props table */}
              {content.props && content.props.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">Props</h2>
                  <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/[0.06]">
                          <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/30">Prop</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/30">Tipo</th>
                          <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/30">Descripción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04] px-4">
                        {content.props.map((p, i) => (
                          <PropRow key={i} {...p} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {content.notes && content.notes.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">Notas técnicas</h2>
                  <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-4 space-y-2">
                    {content.notes.map((n, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-200/70 leading-relaxed font-mono">{n}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prev / Next */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-white/[0.06] mt-8 gap-4">
                {prevId ? (
                  <button
                    onClick={() => handleSelect(prevId)}
                    className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-[#6850E8] dark:hover:text-[#9277F5] transition-colors group"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                    <span>{getLabel(prevId)}</span>
                  </button>
                ) : <div />}
                {nextId ? (
                  <button
                    onClick={() => handleSelect(nextId)}
                    className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-[#6850E8] dark:hover:text-[#9277F5] transition-colors group ml-auto"
                  >
                    <span>{getLabel(nextId)}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : <div />}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-white/25">
              <p>Selecciona una sección</p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
