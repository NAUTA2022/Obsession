export type CallMode = 'audio' | 'video';

export type BookingStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded_no_show'
  | 'refunded_cancelled';

export interface CallPlan {
  id: string;
  creatorId: string;
  mode: CallMode;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  title?: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorWorkingHoursRule {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface CreatorWorkingHours {
  id: string;
  creatorId: string;
  timezone: string;
  rules: CreatorWorkingHoursRule[];
  slotGranularityMinutes: number;
  minNoticeMinutes: number;
  maxAdvanceDays: number;
}

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  creatorId: string;
  callPlanId: string;
  mode: CallMode;
  scheduledStart: string;
  scheduledEnd: string;
  durationSeconds: number;
  priceCents: number;
  currency: string;
  status: BookingStatus;
  livekitRoom: string;
  extensionsTotalSeconds: number;
  googleEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingExtension {
  id: string;
  bookingId: string;
  additionalSeconds: number;
  priceCents: number;
  status: 'pending_payment' | 'paid' | 'failed';
}

export interface GoogleCalendarStatus {
  status: 'active' | 'revoked' | 'error' | 'not_connected';
  googleAccountEmail?: string;
  calendarId?: string;
}

export interface AvailabilityUnavailable {
  unavailable: true;
  reason: 'google_calendar_unavailable';
}

export type AvailabilityResult = AvailabilitySlot[] | AvailabilityUnavailable;
