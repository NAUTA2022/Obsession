/** Datos ficticios para el backend simulado (MSW DEV only) */

export const MOCK_CREATORS = [
  {
    id: 'c1', username: 'sofia_fit', displayName: 'Sofía Martínez',
    profilePicture: 'https://i.pravatar.cc/150?u=sofia_fit',
    bio: 'Fitness & lifestyle coach 💪 Ayudando a transformar vidas desde 2019.',
    location: 'México', contentType: 'fitness', totalEarnings: 48200,
    productCount: 8, priceMin: 15, priceMax: 89,
    createdAt: '2024-01-15T10:00:00Z',
    gallery: [
      { id: 'g1', imageUrl: 'https://picsum.photos/seed/sofia1/400/600', title: 'Entrenamiento', description: null, views: 1240, likes: 340 },
      { id: 'g2', imageUrl: 'https://picsum.photos/seed/sofia2/400/600', title: 'Nutrición', description: null, views: 980, likes: 210 },
      { id: 'g3', imageUrl: 'https://picsum.photos/seed/sofia3/400/600', title: 'Yoga', description: null, views: 760, likes: 180 },
    ],
  },
  {
    id: 'c2', username: 'luna_style', displayName: 'Luna Rodríguez',
    profilePicture: 'https://i.pravatar.cc/150?u=luna_style',
    bio: 'Fashion & beauty influencer 👗 Moda sostenible y tendencias.',
    location: 'Colombia', contentType: 'fashion', totalEarnings: 32100,
    productCount: 12, priceMin: 9, priceMax: 49,
    createdAt: '2024-02-20T10:00:00Z',
    gallery: [
      { id: 'g4', imageUrl: 'https://picsum.photos/seed/luna1/400/600', title: 'Look otoño', description: null, views: 2100, likes: 520 },
      { id: 'g5', imageUrl: 'https://picsum.photos/seed/luna2/400/600', title: 'Beauty tips', description: null, views: 1500, likes: 390 },
    ],
  },
  {
    id: 'c3', username: 'valeria_coach', displayName: 'Valeria Torres',
    profilePicture: 'https://i.pravatar.cc/150?u=valeria_coach',
    bio: 'Business coach & mentora 🚀 Ayudo emprendedoras a escalar su negocio.',
    location: 'Argentina', contentType: 'coaching', totalEarnings: 71500,
    productCount: 5, priceMin: 49, priceMax: 299,
    createdAt: '2023-11-05T10:00:00Z',
    gallery: [
      { id: 'g6', imageUrl: 'https://picsum.photos/seed/val1/400/600', title: 'Masterclass', description: null, views: 3400, likes: 880 },
      { id: 'g6b', imageUrl: 'https://picsum.photos/seed/val2/400/600', title: 'Coaching', description: null, views: 2100, likes: 540 },
    ],
  },
  {
    id: 'c4', username: 'isabella_art', displayName: 'Isabella Gómez',
    profilePicture: 'https://i.pravatar.cc/150?u=isabella_art',
    bio: 'Artista digital & creadora de contenido 🎨',
    location: 'España', contentType: 'art', totalEarnings: 19800,
    productCount: 20, priceMin: 5, priceMax: 39,
    createdAt: '2024-03-10T10:00:00Z',
    gallery: [
      { id: 'g4a', imageUrl: 'https://picsum.photos/seed/isa1/400/600', title: 'Arte digital', description: null, views: 1100, likes: 290 },
    ],
  },
  {
    id: 'c5', username: 'natalia_yoga', displayName: 'Natalia Vega',
    profilePicture: 'https://i.pravatar.cc/150?u=natalia_yoga',
    bio: 'Yoga & meditación 🧘 300h certificada. Clases online.',
    location: 'Venezuela', contentType: 'wellness', totalEarnings: 26300,
    productCount: 6, priceMin: 19, priceMax: 69,
    createdAt: '2024-01-28T10:00:00Z',
    gallery: [
      { id: 'g7', imageUrl: 'https://picsum.photos/seed/nat1/400/600', title: 'Sesión matutina', description: null, views: 890, likes: 220 },
      { id: 'g8', imageUrl: 'https://picsum.photos/seed/nat2/400/600', title: 'Meditación', description: null, views: 650, likes: 170 },
    ],
  },
  {
    id: 'c6', username: 'camila_gamer', displayName: 'Camila Ríos',
    profilePicture: 'https://i.pravatar.cc/150?u=camila_gamer',
    bio: 'Gamer & streamer 🎮 Competitiva de LoL. Partner oficial.',
    location: 'Chile', contentType: 'gaming', totalEarnings: 15400,
    productCount: 3, priceMin: 9, priceMax: 29,
    createdAt: '2024-04-01T10:00:00Z',
    gallery: [
      { id: 'g9', imageUrl: 'https://picsum.photos/seed/cam1/400/600', title: 'Gaming', description: null, views: 1800, likes: 430 },
    ],
  },
  {
    id: 'c7', username: 'andrea_music', displayName: 'Andrea Soto',
    profilePicture: 'https://i.pravatar.cc/150?u=andrea_music',
    bio: 'Cantante & productora musical 🎵 Clases de canto y producción.',
    location: 'México', contentType: 'music', totalEarnings: 22800,
    productCount: 7, priceMin: 19, priceMax: 119,
    createdAt: '2024-02-14T10:00:00Z',
    gallery: [
      { id: 'g10', imageUrl: 'https://picsum.photos/seed/andr1/400/600', title: 'Studio session', description: null, views: 1500, likes: 380 },
      { id: 'g11', imageUrl: 'https://picsum.photos/seed/andr2/400/600', title: 'Live performance', description: null, views: 2200, likes: 610 },
    ],
  },
  {
    id: 'c8', username: 'paula_chef', displayName: 'Paula Herrera',
    profilePicture: 'https://i.pravatar.cc/150?u=paula_chef',
    bio: 'Chef profesional 👩‍🍳 Recetas saludables y cocina gourmet.',
    location: 'Colombia', contentType: 'food', totalEarnings: 18600,
    productCount: 15, priceMin: 12, priceMax: 59,
    createdAt: '2024-03-05T10:00:00Z',
    gallery: [
      { id: 'g12', imageUrl: 'https://picsum.photos/seed/paul1/400/600', title: 'Receta especial', description: null, views: 3100, likes: 720 },
    ],
  },
  {
    id: 'c9', username: 'diana_photo', displayName: 'Diana Mora',
    profilePicture: 'https://i.pravatar.cc/150?u=diana_photo',
    bio: 'Fotógrafa profesional 📸 Retratos, bodas y fotografía artística.',
    location: 'Perú', contentType: 'photography', totalEarnings: 31200,
    productCount: 9, priceMin: 29, priceMax: 199,
    createdAt: '2024-01-10T10:00:00Z',
    gallery: [
      { id: 'g13', imageUrl: 'https://picsum.photos/seed/diana1/400/600', title: 'Retrato', description: null, views: 1900, likes: 490 },
      { id: 'g14', imageUrl: 'https://picsum.photos/seed/diana2/400/600', title: 'Paisaje', description: null, views: 1400, likes: 360 },
    ],
  },
  {
    id: 'c10', username: 'rosa_finance', displayName: 'Rosa Medina',
    profilePicture: 'https://i.pravatar.cc/150?u=rosa_finance',
    bio: 'Finanzas personales 💰 Inversiones, ahorro y libertad financiera.',
    location: 'España', contentType: 'finance', totalEarnings: 55700,
    productCount: 4, priceMin: 39, priceMax: 249,
    createdAt: '2023-12-01T10:00:00Z',
    gallery: [
      { id: 'g15', imageUrl: 'https://picsum.photos/seed/rosa1/400/600', title: 'Finanzas', description: null, views: 4200, likes: 1100 },
    ],
  },
  {
    id: 'c11', username: 'teresa_travel', displayName: 'Teresa Blanco',
    profilePicture: 'https://i.pravatar.cc/150?u=teresa_travel',
    bio: 'Travel blogger ✈️ 40 países visitados. Tips de viaje y fotografía.',
    location: 'Argentina', contentType: 'travel', totalEarnings: 29400,
    productCount: 11, priceMin: 14, priceMax: 79,
    createdAt: '2024-02-01T10:00:00Z',
    gallery: [
      { id: 'g16', imageUrl: 'https://picsum.photos/seed/tere1/400/600', title: 'París', description: null, views: 5600, likes: 1340 },
      { id: 'g17', imageUrl: 'https://picsum.photos/seed/tere2/400/600', title: 'Bali', description: null, views: 4900, likes: 1200 },
    ],
  },
  {
    id: 'c12', username: 'julia_mindset', displayName: 'Julia Castro',
    profilePicture: 'https://i.pravatar.cc/150?u=julia_mindset',
    bio: 'Psicóloga & coach de mentalidad 🧠 Mindset de alto rendimiento.',
    location: 'México', contentType: 'psychology', totalEarnings: 43100,
    productCount: 6, priceMin: 29, priceMax: 149,
    createdAt: '2024-01-20T10:00:00Z',
    gallery: [
      { id: 'g18', imageUrl: 'https://picsum.photos/seed/julia1/400/600', title: 'Meditación guiada', description: null, views: 2800, likes: 700 },
    ],
  },
  {
    id: 'c13', username: 'maria_dance', displayName: 'María Fuentes',
    profilePicture: 'https://i.pravatar.cc/150?u=maria_dance',
    bio: 'Bailarina profesional 💃 Salsa, bachata y ritmos latinos.',
    location: 'Cuba', contentType: 'dance', totalEarnings: 17300,
    productCount: 8, priceMin: 12, priceMax: 49,
    createdAt: '2024-03-20T10:00:00Z',
    gallery: [
      { id: 'g19', imageUrl: 'https://picsum.photos/seed/mar1/400/600', title: 'Salsa', description: null, views: 3400, likes: 890 },
      { id: 'g20', imageUrl: 'https://picsum.photos/seed/mar2/400/600', title: 'Bachata', description: null, views: 2700, likes: 680 },
    ],
  },
  {
    id: 'c14', username: 'ana_crypto', displayName: 'Ana Jiménez',
    profilePicture: 'https://i.pravatar.cc/150?u=ana_crypto',
    bio: 'Crypto trader & educadora 📈 Análisis técnico y DeFi.',
    location: 'Uruguay', contentType: 'crypto', totalEarnings: 61800,
    productCount: 5, priceMin: 49, priceMax: 399,
    createdAt: '2023-10-15T10:00:00Z',
    gallery: [
      { id: 'g21', imageUrl: 'https://picsum.photos/seed/ana1/400/600', title: 'Crypto analysis', description: null, views: 6100, likes: 1520 },
    ],
  },
  {
    id: 'c15', username: 'elena_skin', displayName: 'Elena Vargas',
    profilePicture: 'https://i.pravatar.cc/150?u=elena_skin',
    bio: 'Dermatóloga & skincare expert 🌿 Rutinas para piel perfecta.',
    location: 'Venezuela', contentType: 'beauty', totalEarnings: 38900,
    productCount: 14, priceMin: 9, priceMax: 79,
    createdAt: '2024-01-05T10:00:00Z',
    gallery: [
      { id: 'g22', imageUrl: 'https://picsum.photos/seed/elen1/400/600', title: 'Skincare rutina', description: null, views: 4700, likes: 1180 },
      { id: 'g23', imageUrl: 'https://picsum.photos/seed/elen2/400/600', title: 'Productos naturales', description: null, views: 3200, likes: 810 },
    ],
  },
  {
    id: 'c16', username: 'nora_language', displayName: 'Nora Ibáñez',
    profilePicture: 'https://i.pravatar.cc/150?u=nora_language',
    bio: 'Profesora de idiomas 🌍 Inglés, francés e italiano. Método conversacional.',
    location: 'Chile', contentType: 'education', totalEarnings: 24600,
    productCount: 10, priceMin: 15, priceMax: 99,
    createdAt: '2024-02-10T10:00:00Z',
    gallery: [
      { id: 'g24', imageUrl: 'https://picsum.photos/seed/nora1/400/600', title: 'Clase de inglés', description: null, views: 2100, likes: 530 },
    ],
  },
  {
    id: 'c17', username: 'lara_pilates', displayName: 'Lara Quintero',
    profilePicture: 'https://i.pravatar.cc/150?u=lara_pilates',
    bio: 'Instructora de pilates & rehabilitación 🤸 Cuerpo y mente en equilibrio.',
    location: 'Colombia', contentType: 'fitness', totalEarnings: 21000,
    productCount: 7, priceMin: 19, priceMax: 89,
    createdAt: '2024-03-01T10:00:00Z',
    gallery: [
      { id: 'g25', imageUrl: 'https://picsum.photos/seed/lara1/400/600', title: 'Pilates mat', description: null, views: 1600, likes: 400 },
      { id: 'g26', imageUrl: 'https://picsum.photos/seed/lara2/400/600', title: 'Reformer', description: null, views: 1200, likes: 300 },
    ],
  },
  {
    id: 'c18', username: 'sara_podcast', displayName: 'Sara Delgado',
    profilePicture: 'https://i.pravatar.cc/150?u=sara_podcast',
    bio: 'Podcaster & storyteller 🎙️ Historias que inspiran y conectan.',
    location: 'México', contentType: 'media', totalEarnings: 16800,
    productCount: 3, priceMin: 9, priceMax: 39,
    createdAt: '2024-04-10T10:00:00Z',
    gallery: [
      { id: 'g27', imageUrl: 'https://picsum.photos/seed/sara1/400/600', title: 'Podcast studio', description: null, views: 1400, likes: 350 },
    ],
  },
];

export const MOCK_PRODUCTS = [
  {
    id: 'p1', title: 'Pack Entrenamiento Completo', description: 'Plan de 12 semanas con rutinas, nutrición y seguimiento.',
    price: 89, type: 'package', status: 'active',
    thumbnailUrl: 'https://picsum.photos/seed/prod1/300/200',
    photoCount: 24, videoCount: 8, totalSales: 142, views: 3200,
    creatorId: 'c1', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-05-10T10:00:00Z',
  },
  {
    id: 'p2', title: 'Lookbook Primavera 2025', description: 'Colección exclusiva de outfits y combinaciones.',
    price: 29, type: 'single', status: 'active',
    thumbnailUrl: 'https://picsum.photos/seed/prod2/300/200',
    photoCount: 40, videoCount: 0, totalSales: 87, views: 1800,
    creatorId: 'c2', createdAt: '2024-03-15T10:00:00Z', updatedAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'p3', title: 'Masterclass: Escala tu negocio', description: 'Módulo 1 de mi programa premium de business.',
    price: 199, type: 'single', status: 'active',
    thumbnailUrl: 'https://picsum.photos/seed/prod3/300/200',
    photoCount: 0, videoCount: 5, totalSales: 63, views: 2100,
    creatorId: 'c3', createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-04-20T10:00:00Z',
  },
  {
    id: 'p4', title: 'Galería Arte Digital Vol.2', description: 'Colección de obras digitales en alta resolución.',
    price: 49, type: 'package', status: 'draft',
    thumbnailUrl: 'https://picsum.photos/seed/prod4/300/200',
    photoCount: 15, videoCount: 0, totalSales: 0, views: 430,
    creatorId: 'c4', createdAt: '2024-04-05T10:00:00Z', updatedAt: '2024-05-05T10:00:00Z',
  },
];

export const MOCK_SELLERS = [
  {
    userId: 's1', username: 'carlos_sales', displayName: 'Carlos Mendez',
    profilePicture: 'https://i.pravatar.cc/150?u=carlos_sales',
    bio: 'Closer profesional con 5 años de experiencia en ventas digitales.',
    location: 'México',
    seller: { id: 'sp1', userId: 's1', nationality: 'MX', state: 'CDMX', languages: ['es', 'en'], collaborationSlots: 3, commissionPercentage: 15, productCategories: ['fitness', 'coaching'], isActive: true },
  },
  {
    userId: 's2', username: 'andrés_closer', displayName: 'Andrés Pérez',
    profilePicture: 'https://i.pravatar.cc/150?u=andres_closer',
    bio: 'Especializado en fashion y lifestyle. Tasa de conversión 38%.',
    location: 'Colombia',
    seller: { id: 'sp2', userId: 's2', nationality: 'CO', state: 'Bogotá', languages: ['es'], collaborationSlots: 5, commissionPercentage: 12, productCategories: ['fashion', 'lifestyle'], isActive: true },
  },
  {
    userId: 's3', username: 'marco_ventas', displayName: 'Marco Silva',
    profilePicture: 'https://i.pravatar.cc/150?u=marco_ventas',
    bio: 'High-ticket closer. Especialista en productos premium +$200.',
    location: 'Argentina',
    seller: { id: 'sp3', userId: 's3', nationality: 'AR', state: 'Buenos Aires', languages: ['es', 'pt'], collaborationSlots: 2, commissionPercentage: 18, productCategories: ['coaching', 'wellness'], isActive: true },
  },
];

export const MOCK_CONVERSATIONS = [
  {
    id: 'conv1', creatorId: 'c1', clientId: 'u1',
    creatorName: 'Sofía Martínez', creatorPhoto: 'https://i.pravatar.cc/150?u=sofia_fit',
    clientName: 'María López', clientPhoto: 'https://i.pravatar.cc/150?u=maria_lopez',
    lastMessage: '¿Cuándo empieza el siguiente grupo?', lastMessageAt: '2025-06-04T18:30:00Z',
    unreadCount: 2, status: 'human', aiActive: false,
  },
  {
    id: 'conv2', creatorId: 'c1', clientId: 'u2',
    creatorName: 'Sofía Martínez', creatorPhoto: 'https://i.pravatar.cc/150?u=sofia_fit',
    clientName: 'Ana García', clientPhoto: 'https://i.pravatar.cc/150?u=ana_garcia',
    lastMessage: 'Me interesa el pack premium 🔥', lastMessageAt: '2025-06-04T16:00:00Z',
    unreadCount: 0, status: 'creator-ai', aiActive: true,
  },
  {
    id: 'conv3', creatorId: 'c1', clientId: 'u3',
    creatorName: 'Sofía Martínez', creatorPhoto: 'https://i.pravatar.cc/150?u=sofia_fit',
    clientName: 'Laura Sánchez', clientPhoto: 'https://i.pravatar.cc/150?u=laura_sanchez',
    lastMessage: 'Hola! Vi tu perfil y me encantó', lastMessageAt: '2025-06-03T12:00:00Z',
    unreadCount: 1, status: 'human', aiActive: false,
  },
];

export const MOCK_MESSAGES: Record<string, any[]> = {
  conv1: [
    { id: 'm1', conversationId: 'conv1', senderId: 'u1', text: 'Hola Sofía! Vi tu programa de entrenamiento.', createdAt: '2025-06-04T17:00:00Z' },
    { id: 'm2', conversationId: 'conv1', senderId: 'c1', text: 'Hola! Claro, ¿qué te gustaría saber? 😊', createdAt: '2025-06-04T17:05:00Z' },
    { id: 'm3', conversationId: 'conv1', senderId: 'u1', text: '¿Cuándo empieza el siguiente grupo?', createdAt: '2025-06-04T18:30:00Z' },
  ],
  conv2: [
    { id: 'm4', conversationId: 'conv2', senderId: 'u2', text: 'Me interesa el pack premium 🔥', createdAt: '2025-06-04T16:00:00Z' },
    { id: 'm5', conversationId: 'conv2', senderId: 'c1', text: '¡Perfecto! Te envío los detalles ahora mismo.', createdAt: '2025-06-04T16:02:00Z' },
  ],
};

// Dynamic timestamps so demo states always reflect "right now"
const _n = Date.now();
const _ago  = (min: number) => new Date(_n - min * 60_000).toISOString();
const _from = (min: number) => new Date(_n + min * 60_000).toISOString();

export const MOCK_BOOKINGS = [
  /* ── Active: upcoming (future) ─────────────────────────── */
  {
    // Normal: untouched, both buttons available
    id: 'b1', callPlanId: 'cp1', clientId: 'u1', creatorId: 'c1',
    mode: 'video', status: 'paid',
    scheduledStart: '2026-06-12T15:00:00Z', scheduledEnd: '2026-06-12T16:00:00Z',
    durationSeconds: 3600, priceCents: 8000, currency: 'USD',
    livekitRoom: 'room-b1', extensionsTotalSeconds: 0,
    createdAt: '2026-06-05T10:00:00Z', updatedAt: '2026-06-05T10:00:00Z',
    client: { id: 'u1', username: 'maria_lopez', displayName: 'María López', profilePicture: 'https://i.pravatar.cc/150?u=maria_lopez', email: 'maria@email.com' },
    callPlan: { id: 'cp1', title: 'Coaching personal 1h' },
  },
  {
    // "Llegaré tarde" ya enviado — muestra banner ámbar
    id: 'b3', callPlanId: 'cp1', clientId: 'u3', creatorId: 'c1',
    mode: 'video', status: 'paid',
    scheduledStart: '2026-06-08T10:00:00Z', scheduledEnd: '2026-06-08T11:00:00Z',
    durationSeconds: 3600, priceCents: 8000, currency: 'USD',
    livekitRoom: 'room-b3', extensionsTotalSeconds: 0,
    createdAt: '2026-06-03T09:00:00Z', updatedAt: '2026-06-03T09:00:00Z',
    client: { id: 'u3', username: 'laura_sanchez', displayName: 'Laura Sánchez', profilePicture: 'https://i.pravatar.cc/150?u=laura_sanchez', email: 'laura@email.com' },
    callPlan: { id: 'cp1', title: 'Coaching personal 1h' },
  },
  {
    // Solicitud de aplazamiento PENDIENTE — cliente no ha respondido
    id: 'b8', callPlanId: 'cp1', clientId: 'u8', creatorId: 'c1',
    mode: 'video', status: 'paid',
    scheduledStart: '2026-06-09T15:00:00Z', scheduledEnd: '2026-06-09T16:00:00Z',
    durationSeconds: 3600, priceCents: 8000, currency: 'USD',
    livekitRoom: 'room-b8', extensionsTotalSeconds: 0,
    createdAt: '2026-06-05T10:00:00Z', updatedAt: '2026-06-05T10:00:00Z',
    client: { id: 'u8', username: 'camila_ruiz', displayName: 'Camila Ruiz', profilePicture: 'https://i.pravatar.cc/150?u=camila_ruiz', email: 'camila.r@email.com' },
    callPlan: { id: 'cp1', title: 'Coaching personal 1h' },
  },
  {
    // Aplazamiento ACEPTADO — hora actualizada a las 15:30
    id: 'b9', callPlanId: 'cp2', clientId: 'u9', creatorId: 'c1',
    mode: 'audio', status: 'paid',
    scheduledStart: '2026-06-10T14:00:00Z', scheduledEnd: '2026-06-10T14:30:00Z',
    durationSeconds: 1800, priceCents: 3500, currency: 'USD',
    livekitRoom: 'room-b9', extensionsTotalSeconds: 0,
    createdAt: '2026-06-04T14:00:00Z', updatedAt: '2026-06-04T14:00:00Z',
    client: { id: 'u9', username: 'isabella_moreno', displayName: 'Isabella Moreno', profilePicture: 'https://i.pravatar.cc/150?u=isabella_moreno', email: 'isabella@email.com' },
    callPlan: { id: 'cp2', title: 'Consulta rápida 30min' },
  },
  {
    // Aplazamiento RECHAZADO + "llegaré tarde" ya enviado
    id: 'b10', callPlanId: 'cp1', clientId: 'u10', creatorId: 'c1',
    mode: 'video', status: 'paid',
    scheduledStart: '2026-06-11T11:00:00Z', scheduledEnd: '2026-06-11T12:00:00Z',
    durationSeconds: 3600, priceCents: 8000, currency: 'USD',
    livekitRoom: 'room-b10', extensionsTotalSeconds: 0,
    createdAt: '2026-06-03T09:00:00Z', updatedAt: '2026-06-03T09:00:00Z',
    client: { id: 'u10', username: 'paula_soto', displayName: 'Paula Soto', profilePicture: 'https://i.pravatar.cc/150?u=paula_soto', email: 'paula@email.com' },
    callPlan: { id: 'cp1', title: 'Coaching personal 1h' },
  },
  {
    // Normal: consulta de voz próxima
    id: 'b2', callPlanId: 'cp2', clientId: 'u2', creatorId: 'c1',
    mode: 'audio', status: 'paid',
    scheduledStart: '2026-06-14T18:00:00Z', scheduledEnd: '2026-06-14T18:30:00Z',
    durationSeconds: 1800, priceCents: 3500, currency: 'USD',
    livekitRoom: 'room-b2', extensionsTotalSeconds: 0,
    createdAt: '2026-06-04T14:00:00Z', updatedAt: '2026-06-04T14:00:00Z',
    client: { id: 'u2', username: 'ana_garcia', displayName: 'Ana García', profilePicture: 'https://i.pravatar.cc/150?u=ana_garcia', email: 'ana@email.com' },
    callPlan: { id: 'cp2', title: 'Consulta rápida 30min' },
  },

  /* ── Active: AHORA MISMO (retraso en curso) ─────────────── */
  {
    // 22 min de retraso → PENALIZACIÓN ACTIVA (>15 min). "Llegaré tarde" ya enviado.
    id: 'b6', callPlanId: 'cp1', clientId: 'u6', creatorId: 'c1',
    mode: 'video', status: 'paid',
    scheduledStart: _ago(22), scheduledEnd: _from(38),
    durationSeconds: 3600, priceCents: 8000, currency: 'USD',
    livekitRoom: 'room-b6', extensionsTotalSeconds: 0,
    createdAt: _ago(2880), updatedAt: _ago(22),
    client: { id: 'u6', username: 'daniela_reyes', displayName: 'Daniela Reyes', profilePicture: 'https://i.pravatar.cc/150?u=daniela_reyes', email: 'daniela@email.com' },
    callPlan: { id: 'cp1', title: 'Coaching personal 1h' },
  },
  {
    // 38 min de retraso → CANCELACIÓN AUTOMÁTICA (>30 min). Reembolso al cliente.
    id: 'b7', callPlanId: 'cp2', clientId: 'u7', creatorId: 'c1',
    mode: 'audio', status: 'paid',
    scheduledStart: _ago(38), scheduledEnd: _from(22),
    durationSeconds: 3600, priceCents: 5500, currency: 'USD',
    livekitRoom: 'room-b7', extensionsTotalSeconds: 0,
    createdAt: _ago(2880), updatedAt: _ago(38),
    client: { id: 'u7', username: 'valentina_cruz', displayName: 'Valentina Cruz', profilePicture: 'https://i.pravatar.cc/150?u=valentina_cruz', email: 'valentina@email.com' },
    callPlan: { id: 'cp2', title: 'Mentoría fitness 1h' },
  },

  /* ── Pasadas ─────────────────────────────────────────────── */
  {
    id: 'b4', callPlanId: 'cp1', clientId: 'u4', creatorId: 'c1',
    mode: 'video', status: 'completed',
    scheduledStart: '2026-05-28T15:00:00Z', scheduledEnd: '2026-05-28T16:00:00Z',
    durationSeconds: 3600, priceCents: 8000, currency: 'USD',
    livekitRoom: 'room-b4', extensionsTotalSeconds: 0,
    createdAt: '2026-05-20T10:00:00Z', updatedAt: '2026-05-28T16:10:00Z',
    client: { id: 'u4', username: 'camila_torres', displayName: 'Camila Torres', profilePicture: 'https://i.pravatar.cc/150?u=camila_torres', email: 'camila@email.com' },
    callPlan: { id: 'cp1', title: 'Coaching personal 1h' },
  },
  {
    id: 'b5', callPlanId: 'cp2', clientId: 'u5', creatorId: 'c1',
    mode: 'audio', status: 'refunded_no_show',
    scheduledStart: '2026-05-20T12:00:00Z', scheduledEnd: '2026-05-20T12:30:00Z',
    durationSeconds: 1800, priceCents: 3500, currency: 'USD',
    livekitRoom: 'room-b5', extensionsTotalSeconds: 0,
    createdAt: '2026-05-15T10:00:00Z', updatedAt: '2026-05-20T12:45:00Z',
    client: { id: 'u5', username: 'sofia_delgado', displayName: 'Sofía Delgado', profilePicture: 'https://i.pravatar.cc/150?u=sofia_delgado', email: 'sofia.d@email.com' },
    callPlan: { id: 'cp2', title: 'Consulta rápida 30min' },
  },
  {
    id: 'b11', callPlanId: 'cp2', clientId: 'u2', creatorId: 'c1',
    mode: 'audio', status: 'cancelled',
    scheduledStart: '2026-05-15T16:00:00Z', scheduledEnd: '2026-05-15T16:30:00Z',
    durationSeconds: 1800, priceCents: 3500, currency: 'USD',
    livekitRoom: 'room-b11', extensionsTotalSeconds: 0,
    createdAt: '2026-05-10T10:00:00Z', updatedAt: '2026-05-15T16:05:00Z',
    client: { id: 'u2', username: 'ana_garcia', displayName: 'Ana García', profilePicture: 'https://i.pravatar.cc/150?u=ana_garcia', email: 'ana@email.com' },
    callPlan: { id: 'cp2', title: 'Consulta rápida 30min' },
  },
  {
    id: 'b12', callPlanId: 'cp1', clientId: 'u3', creatorId: 'c1',
    mode: 'video', status: 'completed',
    scheduledStart: '2026-04-10T13:00:00Z', scheduledEnd: '2026-04-10T14:00:00Z',
    durationSeconds: 3600, priceCents: 8000, currency: 'USD',
    livekitRoom: 'room-b12', extensionsTotalSeconds: 0,
    createdAt: '2026-04-05T10:00:00Z', updatedAt: '2026-04-10T14:05:00Z',
    client: { id: 'u3', username: 'laura_sanchez', displayName: 'Laura Sánchez', profilePicture: 'https://i.pravatar.cc/150?u=laura_sanchez', email: 'laura@email.com' },
    callPlan: { id: 'cp1', title: 'Coaching personal 1h' },
  },
];

export const MOCK_CALL_PLANS = [
  {
    id: 'cp1', creatorId: 'c1', mode: 'video', durationMinutes: 60,
    priceCents: 8000, currency: 'USD',
    title: 'Coaching personal 1h', description: 'Sesión de fitness y nutrición adaptada a tus objetivos. Revisamos tu plan, ajustamos rutinas y resolvemos dudas en tiempo real.',
    isActive: true, isFeatured: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cp2', creatorId: 'c1', mode: 'audio', durationMinutes: 30,
    priceCents: 3500, currency: 'USD',
    title: 'Consulta rápida 30min', description: 'Llamada de voz para preguntas puntuales sobre nutrición o entrenamiento. Ideal para seguimientos.',
    isActive: true, isFeatured: false,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cp3', creatorId: 'c3', mode: 'video', durationMinutes: 45,
    priceCents: 12000, currency: 'USD',
    title: 'Mentoría business 45min', description: 'Revisión de estrategia de negocio, funnel de ventas y próximos pasos para escalar.',
    isActive: true, isFeatured: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cp4', creatorId: 'c5', mode: 'video', durationMinutes: 45,
    priceCents: 5000, currency: 'USD',
    title: 'Clase de yoga privada 45min', description: 'Clase personalizada según tu nivel y objetivos.',
    isActive: true, isFeatured: false,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
];

export const MOCK_CONTACTS = [
  { id: 'ct1', name: 'María López',   email: 'maria@email.com',  phoneNumber: '+52 55 1234 5678', purchases: 4, note: 'Muy interesada en pack premium', status: 'Aprobado',  dealId: 'd1', dealStage: 'negotiation', avatar: null, source: 'whatsapp', createdAt: '2025-06-04T10:00:00Z' },
  { id: 'ct2', name: 'Ana García',    email: 'ana@email.com',    phoneNumber: '+54 11 9876 5432', purchases: 2, note: 'Cliente VIP, trato especial',     status: 'Pendiente', dealId: 'd2', dealStage: 'proposal',    avatar: null, source: 'manual',   createdAt: '2025-06-03T14:00:00Z' },
  { id: 'ct3', name: 'Laura Sánchez', email: 'laura@email.com',  phoneNumber: '+57 300 111 2222', purchases: 1, note: 'Requiere seguimiento urgente',   status: 'Rechazado', dealId: 'd3', dealStage: 'selection',   avatar: null, source: 'manual',   createdAt: '2025-05-20T09:00:00Z' },
  { id: 'ct4', name: 'Camila Torres', email: 'camila@email.com', phoneNumber: '+56 9 8765 4321',  purchases: 7, note: 'Referida por Ana García',         status: 'Aprobado',  dealId: null, dealStage: null,         avatar: null, source: 'whatsapp', createdAt: '2025-06-01T16:00:00Z' },
  { id: 'ct5', name: 'Sofía Ramírez', email: 'sofia@email.com',  phoneNumber: '+51 9 1234 5678',  purchases: 0, note: 'Lead frío, primer contacto',      status: 'Pendiente', dealId: null, dealStage: null,         avatar: null, source: 'import',   createdAt: '2025-06-05T08:00:00Z' },
];

export const MOCK_DEALS = [
  { id: 'd1', title: 'Pack Premium — María L.', value: 89, stage: 'negotiation', creatorId: 'c1', contactId: 'ct1', probability: 75, createdAt: '2025-06-01T10:00:00Z' },
  { id: 'd2', title: 'Masterclass — Ana G.', value: 199, stage: 'proposal', creatorId: 'c3', contactId: 'ct2', probability: 50, createdAt: '2025-05-28T10:00:00Z' },
  { id: 'd3', title: 'Lookbook — Laura S.', value: 29, stage: 'lead', creatorId: 'c2', contactId: 'ct3', probability: 20, createdAt: '2025-05-30T10:00:00Z' },
  { id: 'd4', title: 'Coaching 3 meses — Camila T.', value: 450, stage: 'closed_won', creatorId: 'c3', contactId: 'ct4', probability: 100, createdAt: '2025-05-15T10:00:00Z' },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'collaboration_request', title: 'Nueva solicitud de colaboración', body: 'Carlos Mendez quiere colaborar contigo.', data: { fromUserId: 's1', fromName: 'Carlos Mendez', fromPhoto: 'https://i.pravatar.cc/150?u=carlos_sales' }, read: false, createdAt: '2025-06-04T12:00:00Z' },
  { id: 'n2', type: 'collaboration_accepted', title: 'Colaboración aceptada', body: 'Valeria Torres aceptó tu solicitud.', data: { fromUserId: 'c3', fromName: 'Valeria Torres', fromPhoto: 'https://i.pravatar.cc/150?u=valeria_coach' }, read: true, createdAt: '2025-06-03T09:00:00Z' },
  { id: 'n3', type: 'creator_call_setup', title: 'Nueva reserva confirmada', body: 'María López reservó una sesión para el 10 de junio.', data: { actionRoute: '/creator/bookings', actionLabel: 'Ver reserva' }, read: false, createdAt: '2025-06-04T18:00:00Z' },
];

export const MOCK_DASHBOARD_STATS = {
  progress: { conversations: 247, salesAchieved: 38, agentSales: 14 },
  performance: {
    categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    data: [12, 19, 15, 28, 22, 31],
  },
  successfulProducts: MOCK_PRODUCTS.slice(0, 3).map(p => ({
    id: p.id, name: p.title, type: p.type,
    productImage: p.thumbnailUrl,
    creatorAvatar: 'https://i.pravatar.cc/150?u=sofia_fit',
    creatorName: 'Sofía Martínez',
    description: p.description, price: p.price, totalSales: p.totalSales,
  })),
  latestSales: [
    { items: 'Pack Entrenamiento', precio: '$89', pagoVendedor: '$13.35', pagoAgente: '$4.45', pagoObsesion: '$8.90', ingresoFinal: '$62.30', date: '2025-06-04' },
    { items: 'Lookbook Primavera', precio: '$29', pagoVendedor: '$4.35', pagoAgente: '$1.45', pagoObsesion: '$2.90', ingresoFinal: '$20.30', date: '2025-06-03' },
    { items: 'Masterclass Business', precio: '$199', pagoVendedor: '$29.85', pagoAgente: '$9.95', pagoObsesion: '$19.90', ingresoFinal: '$139.30', date: '2025-06-02' },
  ],
  competitors: [],
  topCreators: MOCK_CREATORS.slice(0, 5).map((c, i) => ({
    id: c.id, rank: i + 1, avatar: c.profilePicture!, name: c.displayName, totalEarnings: c.totalEarnings,
  })),
};

export const MOCK_ADMIN_USERS = [
  { id: 'u1', username: 'maria_lopez', email: 'maria@email.com', firstName: 'María', lastName: 'López', role: 'customer', status: 'active', isEmailVerified: true, createdAt: '2025-01-10T10:00:00Z' },
  { id: 'u2', username: 'ana_garcia', email: 'ana@email.com', firstName: 'Ana', lastName: 'García', role: 'customer', status: 'active', isEmailVerified: true, createdAt: '2025-02-05T10:00:00Z' },
  ...MOCK_CREATORS.map(c => ({ id: c.id, username: c.username, email: `${c.username}@obsesion.app`, firstName: c.displayName.split(' ')[0], lastName: c.displayName.split(' ')[1] || '', role: 'creator', status: 'active', isEmailVerified: true, createdAt: c.createdAt })),
  ...MOCK_SELLERS.map(s => ({ id: s.userId, username: s.username, email: `${s.username}@obsesion.app`, firstName: s.displayName.split(' ')[0], lastName: s.displayName.split(' ')[1] || '', role: 'vendedor', status: 'active', isEmailVerified: true, createdAt: '2025-01-01T10:00:00Z' })),
];

export const MOCK_PRICING_PLANS = [
  { id: 'plan1', name: 'Starter', price: 0, currency: 'USD', interval: 'month', features: ['Hasta 3 productos', '100 mensajes/mes', 'Sin IA'], isActive: true, order: 1 },
  { id: 'plan2', name: 'Pro', price: 49, currency: 'USD', interval: 'month', features: ['Productos ilimitados', '1000 mensajes/mes', 'IA básica', 'Analytics'], isActive: true, order: 2 },
  { id: 'plan3', name: 'Scale', price: 149, currency: 'USD', interval: 'month', features: ['Todo en Pro', 'IA avanzada', 'Vendedores ilimitados', 'Soporte prioritario'], isActive: true, order: 3 },
];

export const MOCK_WORKING_HOURS = {
  timezone: 'America/Mexico_City',
  schedule: [
    { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
    { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
    { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
    { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
    { day: 'friday', enabled: true, start: '09:00', end: '16:00' },
    { day: 'saturday', enabled: false, start: '10:00', end: '14:00' },
    { day: 'sunday', enabled: false, start: '10:00', end: '14:00' },
  ],
};

export const MOCK_COLLABORATIONS = [
  {
    id: 'col1', creatorId: 'c1', sellerId: 's1', status: 'active',
    commissionPercentage: 15, createdAt: '2025-03-01T10:00:00Z',
    creator: MOCK_CREATORS[0],
    seller: MOCK_SELLERS[0],
    stats: { totalSales: 12, totalRevenue: 1068, totalCommission: 160 },
  },
  {
    id: 'col2', creatorId: 'c3', sellerId: 's2', status: 'active',
    commissionPercentage: 12, createdAt: '2025-04-15T10:00:00Z',
    creator: MOCK_CREATORS[2],
    seller: MOCK_SELLERS[1],
    stats: { totalSales: 8, totalRevenue: 1592, totalCommission: 191 },
  },
];
