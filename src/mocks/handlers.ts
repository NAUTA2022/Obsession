import { http, HttpResponse } from 'msw';
import {
  MOCK_CREATORS, MOCK_PRODUCTS, MOCK_SELLERS, MOCK_CONVERSATIONS,
  MOCK_MESSAGES, MOCK_BOOKINGS, MOCK_CALL_PLANS, MOCK_CONTACTS,
  MOCK_DEALS, MOCK_NOTIFICATIONS, MOCK_DASHBOARD_STATS, MOCK_ADMIN_USERS,
  MOCK_PRICING_PLANS, MOCK_WORKING_HOURS, MOCK_COLLABORATIONS,
} from './data';

const API = 'http://localhost:3000/api/v1';

const ok = (data: unknown) => HttpResponse.json({ success: true, data });
const list = (data: unknown[]) => HttpResponse.json({ success: true, data: { data } });

export const handlers = [

  // ── Auth ──────────────────────────────────────────────────────────────────
  http.get(`${API}/auth/me`, () => ok(null)),
  http.post(`${API}/auth/refresh`, () => ok({ accessToken: 'dev-token' })),
  http.post(`${API}/auth/switch-role`, async ({ request }) => {
    const body = await request.json() as { role: string };
    return ok({ role: body.role, creatorOnboarded: true });
  }),
  http.patch(`${API}/auth/switch-role`, async ({ request }) => {
    const body = await request.json() as { role: string };
    return ok({ role: body.role, creatorOnboarded: true });
  }),
  http.post(`${API}/auth/logout`, () => ok({ message: 'Logged out' })),

  // ── Creators ──────────────────────────────────────────────────────────────
  http.get(`${API}/users/creators`, () => list(MOCK_CREATORS)),
  http.get(`${API}/users/creators/top`, () => list(MOCK_CREATORS)),
  http.get(`${API}/users/creators/by-username/:username`, ({ params }) => {
    const found = MOCK_CREATORS.find(c => c.username === params.username);
    return ok(found ?? MOCK_CREATORS[0]);
  }),
  http.get(`${API}/users/creators/:id/profile`, ({ params }) => {
    const found = MOCK_CREATORS.find(c => c.id === params.id);
    return ok(found ?? MOCK_CREATORS[0]);
  }),
  http.get(`${API}/users/creators/:id/gallery`, ({ params }) => {
    const found = MOCK_CREATORS.find(c => c.id === params.id);
    return ok({ images: found?.gallery ?? [] });
  }),

  // ── Profile ───────────────────────────────────────────────────────────────
  http.patch(`${API}/users/profile`, async ({ request }) => {
    const body = await request.json();
    return ok({ ...(body as object), id: 'dev-mock-001' });
  }),
  http.post(`${API}/users/profile/picture`, () =>
    ok({ profilePicture: 'https://i.pravatar.cc/150?u=dev_updated' })),

  // ── Products ──────────────────────────────────────────────────────────────
  http.get(`${API}/products`, () => list(MOCK_PRODUCTS)),
  http.get(`${API}/products/creator/:creatorId`, ({ params }) => {
    const filtered = MOCK_PRODUCTS.filter(p => p.creatorId === params.creatorId);
    return ok(filtered.length > 0 ? filtered : MOCK_PRODUCTS);
  }),
  http.get(`${API}/products/my-products`, () => ok(MOCK_PRODUCTS)),
  http.get(`${API}/products/touchapp`, () => ok([])),
  http.get(`${API}/products/:id`, ({ params }) => {
    const found = MOCK_PRODUCTS.find(p => p.id === params.id);
    return ok(found ?? MOCK_PRODUCTS[0]);
  }),
  http.post(`${API}/products`, async ({ request }) => {
    const body = await request.json() as object;
    return ok({ id: `p${Date.now()}`, ...body, totalSales: 0, views: 0, createdAt: new Date().toISOString() });
  }),
  http.put(`${API}/products/:id`, async ({ params, request }) => {
    const body = await request.json() as object;
    const found = MOCK_PRODUCTS.find(p => p.id === params.id) ?? MOCK_PRODUCTS[0];
    return ok({ ...found, ...body });
  }),
  http.patch(`${API}/products/:id`, async ({ params, request }) => {
    const body = await request.json() as object;
    const found = MOCK_PRODUCTS.find(p => p.id === params.id) ?? MOCK_PRODUCTS[0];
    return ok({ ...found, ...body });
  }),
  http.delete(`${API}/products/:id`, () => ok({ message: 'Deleted' })),

  // ── TouchApp ──────────────────────────────────────────────────────────────
  http.get(`${API}/touchapp/status`, () => ok({ linked: false, status: null })),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  http.get(`${API}/dashboard/stats`, () => ok(MOCK_DASHBOARD_STATS)),

  // ── Chat ──────────────────────────────────────────────────────────────────
  http.get(`${API}/chat/inbox`, () => HttpResponse.json({ success: true, data: MOCK_CONVERSATIONS })),
  http.get(`${API}/chat/conversations/:id/messages`, ({ params }) => {
    const msgs = MOCK_MESSAGES[params.id as string] ?? [];
    return HttpResponse.json({ success: true, data: msgs });
  }),
  http.post(`${API}/chat/conversations/start`, () =>
    ok({ conversationId: 'conv1' })),
  http.post(`${API}/chat/conversations/start-with`, () =>
    ok({ conversationId: 'conv1' })),
  http.post(`${API}/chat/guest/init`, () =>
    ok({ conversationId: 'conv1', guestUserId: 'guest-001', guestSessionId: 'sess-001' })),
  http.post(`${API}/chat/conversations/:id/messages`, async ({ params, request }) => {
    const body = await request.json() as object;
    return ok({ id: `m${Date.now()}`, conversationId: params.id, ...body, createdAt: new Date().toISOString() });
  }),
  http.get(`${API}/chat/bot-config/:conversationId`, () =>
    ok({ enabled: false, tone: 'friendly', maxDiscount: 10 })),

  // ── Swipes ────────────────────────────────────────────────────────────────
  http.get(`${API}/swipes/mine`, () => ok({ targetIds: [] })),
  http.get(`${API}/swipes/matches`, () => list([])),
  http.get(`${API}/swipes/liked`, () => list([])),
  http.get(`${API}/swipes/passed`, () => list([])),
  http.get(`${API}/swipes/recommendations/creators`, () => list(MOCK_CREATORS)),
  http.get(`${API}/swipes/recommendations/sellers`, () => list(MOCK_SELLERS)),
  http.post(`${API}/swipes`, () => ok({ match: false })),

  // ── Sellers ───────────────────────────────────────────────────────────────
  http.get(`${API}/sellers`, () => list(MOCK_SELLERS)),
  http.get(`${API}/sellers/profile`, () => ok(MOCK_SELLERS[0].seller)),
  http.post(`${API}/sellers/register`, async ({ request }) => {
    const body = await request.json() as object;
    return ok({ message: 'Registered', seller: { id: 'sp-new', ...body }, role: 'vendedor' });
  }),

  // ── Collaborations ────────────────────────────────────────────────────────
  http.get(`${API}/collaborations`, () => list(MOCK_COLLABORATIONS)),
  http.get(`${API}/collaborations/active`, () => list(MOCK_COLLABORATIONS)),
  http.post(`${API}/collaborations`, () => ok({ id: `col${Date.now()}`, status: 'pending' })),
  http.patch(`${API}/collaborations/:id`, async ({ params, request }) => {
    const body = await request.json() as object;
    return ok({ id: params.id, ...body });
  }),

  // ── Bookings ──────────────────────────────────────────────────────────────
  http.get(`${API}/bookings`, () => ok(MOCK_BOOKINGS)),
  http.get(`${API}/bookings/mine`, () => ok(MOCK_BOOKINGS)),
  http.get(`${API}/bookings/:id`, ({ params }) => {
    const found = MOCK_BOOKINGS.find(b => b.id === params.id);
    return ok(found ?? MOCK_BOOKINGS[0]);
  }),
  http.post(`${API}/bookings`, () =>
    ok({ booking: MOCK_BOOKINGS[0], checkoutUrl: null })),
  http.patch(`${API}/bookings/:id`, async ({ params, request }) => {
    const body = await request.json() as object;
    const found = MOCK_BOOKINGS.find(b => b.id === params.id) ?? MOCK_BOOKINGS[0];
    return ok({ ...found, ...body });
  }),

  // ── Call Plans ────────────────────────────────────────────────────────────
  http.get(`${API}/call-plans`, ({ request }) => {
    const url = new URL(request.url);
    const creatorId = url.searchParams.get('creatorId');
    const filtered = creatorId ? MOCK_CALL_PLANS.filter(p => p.creatorId === creatorId) : MOCK_CALL_PLANS;
    return ok(filtered);
  }),
  http.get(`${API}/call-plans/me`, () => ok(MOCK_CALL_PLANS.filter(p => p.creatorId === 'c1'))),
  http.get(`${API}/call-plans/my`, () => ok(MOCK_CALL_PLANS.filter(p => p.creatorId === 'c1'))),
  http.post(`${API}/call-plans`, async ({ request }) => {
    const body = await request.json() as object;
    return ok({ id: `cp${Date.now()}`, ...body, isActive: true });
  }),
  http.put(`${API}/call-plans/:id`, async ({ params, request }) => {
    const body = await request.json() as object;
    const found = MOCK_CALL_PLANS.find(p => p.id === params.id) ?? MOCK_CALL_PLANS[0];
    return ok({ ...found, ...body });
  }),
  http.delete(`${API}/call-plans/:id`, () => ok({ message: 'Deleted' })),

  // ── Working Hours ─────────────────────────────────────────────────────────
  http.get(`${API}/working-hours`, () => ok(MOCK_WORKING_HOURS)),
  http.put(`${API}/working-hours`, async ({ request }) => {
    const body = await request.json() as object;
    return ok(body);
  }),

  // ── Availability ──────────────────────────────────────────────────────────
  http.get(`${API}/bookings/availability`, ({ request }) => {
    const url = new URL(request.url);
    const from = new Date(url.searchParams.get('from') ?? new Date().toISOString());
    const to   = new Date(url.searchParams.get('to')   ?? new Date().toISOString());
    const slots: { startAt: string; endAt: string }[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      const day = cur.getDay(); // 0=Sun,6=Sat
      if (day >= 1 && day <= 5) { // Mon–Fri
        for (let h = 9; h < 18; h++) {
          const start = new Date(cur); start.setHours(h, 0, 0, 0);
          const end   = new Date(cur); end.setHours(h + 1, 0, 0, 0);
          // Randomly skip ~30% of slots to simulate bookings
          if (Math.sin(h * 13 + cur.getDate() * 7) > -0.4) {
            slots.push({ startAt: start.toISOString(), endAt: end.toISOString() });
          }
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
    return ok(slots);
  }),
  http.get(`${API}/availability/:creatorId`, () =>
    ok({ slots: [] })),

  // ── Contacts ──────────────────────────────────────────────────────────────
  http.get(`${API}/contacts`, () => list(MOCK_CONTACTS)),
  http.post(`${API}/contacts`, async ({ request }) => {
    const body = await request.json() as object;
    return ok({ id: `ct${Date.now()}`, ...body });
  }),
  http.put(`${API}/contacts/:id`, async ({ params, request }) => {
    const body = await request.json() as object;
    return ok({ id: params.id, ...body });
  }),
  http.delete(`${API}/contacts/:id`, () => ok({ message: 'Deleted' })),

  // ── Deals (CRM) ───────────────────────────────────────────────────────────
  http.get(`${API}/deals`, () => list(MOCK_DEALS)),
  http.post(`${API}/deals`, async ({ request }) => {
    const body = await request.json() as object;
    return ok({ id: `d${Date.now()}`, ...body });
  }),
  http.put(`${API}/deals/:id`, async ({ params, request }) => {
    const body = await request.json() as object;
    return ok({ id: params.id, ...body });
  }),
  http.delete(`${API}/deals/:id`, () => ok({ message: 'Deleted' })),

  // ── Notifications ─────────────────────────────────────────────────────────
  http.get(`${API}/notifications`, () => list(MOCK_NOTIFICATIONS)),
  http.patch(`${API}/notifications/:id/read`, ({ params }) =>
    ok({ id: params.id, read: true })),
  http.patch(`${API}/notifications/read-all`, () => ok({ message: 'All read' })),

  // ── Pricing Plans ─────────────────────────────────────────────────────────
  http.get(`${API}/pricing-plans`, () => list(MOCK_PRICING_PLANS)),
  http.post(`${API}/pricing-plans`, async ({ request }) => {
    const body = await request.json() as object;
    return ok({ id: `plan${Date.now()}`, ...body });
  }),
  http.put(`${API}/pricing-plans/:id`, async ({ params, request }) => {
    const body = await request.json() as object;
    return ok({ id: params.id, ...body });
  }),
  http.delete(`${API}/pricing-plans/:id`, () => ok({ message: 'Deleted' })),

  // ── Google Calendar ───────────────────────────────────────────────────────
  http.get(`${API}/google-calendar/status`, () => ok({ connected: false })),
  http.post(`${API}/google-calendar/connect`, () =>
    ok({ authUrl: '#' })),

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  http.get(`${API}/whatsapp/status`, () =>
    ok({ connected: false, phoneNumber: null })),
  http.post(`${API}/whatsapp/connect`, () =>
    ok({ qrCode: null, status: 'pending' })),

  // ── Work Teams ────────────────────────────────────────────────────────────
  http.get(`${API}/work-teams`, () => list([])),
  http.post(`${API}/work-teams`, async ({ request }) => {
    const body = await request.json() as object;
    return ok({ id: `wt${Date.now()}`, ...body });
  }),

  // ── Admin ─────────────────────────────────────────────────────────────────
  http.get(`${API}/admin/users`, () => list(MOCK_ADMIN_USERS)),
  http.get(`${API}/admin/users/:id`, ({ params }) => {
    const found = MOCK_ADMIN_USERS.find(u => u.id === params.id);
    return ok(found ?? MOCK_ADMIN_USERS[0]);
  }),
  http.patch(`${API}/admin/users/:id`, async ({ params, request }) => {
    const body = await request.json() as object;
    return ok({ id: params.id, ...body });
  }),
  http.get(`${API}/admin/audit-log`, () =>
    list([
      { id: 'al1', action: 'user.role.switch', userId: 'dev-mock-001', targetId: null, details: 'Switched to creator', createdAt: '2025-06-04T10:00:00Z' },
      { id: 'al2', action: 'product.create', userId: 'c1', targetId: 'p1', details: 'Created product', createdAt: '2025-06-03T14:00:00Z' },
      { id: 'al3', action: 'booking.confirm', userId: 'u1', targetId: 'b1', details: 'Booking confirmed', createdAt: '2025-06-02T09:00:00Z' },
    ])),

  // ── Calls (LiveKit token) ─────────────────────────────────────────────────
  http.get(`${API}/calls/:bookingId/token`, () =>
    ok({ token: 'mock-livekit-token', roomName: 'mock-room' })),
  http.post(`${API}/calls/:bookingId/join`, () =>
    ok({ token: 'mock-livekit-token', roomName: 'mock-room' })),
  http.post(`${API}/calls/:bookingId/end`, () =>
    ok({ message: 'Call ended' })),
];
