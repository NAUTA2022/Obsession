import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  Room,
  RoomEvent,
  Track,
  type LocalVideoTrack,
  type RemoteTrack,
  type RemoteParticipant,
  type RemoteVideoTrack,
} from 'livekit-client';
import { env } from '../config/env';
import { GUEST_SESSION_KEY } from '../types/chat-native';
import { callsService } from '../services/api/calls.service';
import { callSounds } from '../utils/callSounds';
import { useAuthStore } from '../store/auth';

const SOCKET_URL = env.API_BASE_URL.replace('/api/v1', '');

export type CallMode = 'audio' | 'video';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connecting' | 'in-call' | 'ended';

export interface IncomingCall {
  callId: string;
  conversationId: string;
  callerId: string;
  calleeId: string;
  mode: CallMode;
}

interface UseLiveKitCallReturn {
  state: CallState;
  mode: CallMode | null;
  incoming: IncomingCall | null;
  remoteConnected: boolean;
  localVideoTrack: LocalVideoTrack | null;
  remoteVideoTrack: RemoteVideoTrack | null;
  muted: boolean;
  cameraOff: boolean;
  error: string | null;
  startCall: (conversationId: string, mode: CallMode) => void;
  acceptCall: () => Promise<void>;
  rejectCall: (reason?: string) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  clearError: () => void;
  // Booking-aware
  currentBookingId: string | null;
  bookingEffectiveEnd: Date | null;
  joinBooking: (bookingId: string) => Promise<void>;
}

export function useLiveKitCall(): UseLiveKitCallReturn {
  const [state, setState] = useState<CallState>('idle');
  const [mode, setMode] = useState<CallMode | null>(null);
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<RemoteVideoTrack | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [bookingEffectiveEnd, setBookingEffectiveEnd] = useState<Date | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const roomRef = useRef<Room | null>(null);
  const activeCallIdRef = useRef<string | null>(null);
  const pendingOutgoingRef = useRef<{ conversationId: string; mode: CallMode } | null>(null);
  const currentBookingIdRef = useRef<string | null>(null);

  const userId = useAuthStore((s) => s.user?.id ?? null);

  // ── Cleanup RTC: desconectar Room y limpiar tracks locales ────────────────
  const cleanupRtc = useCallback(async () => {
    try {
      if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
      }
      setLocalVideoTrack(null);
      setRemoteVideoTrack(null);
      setRemoteConnected(false);
      setMuted(false);
      setCameraOff(false);
      setCurrentBookingId(null);
      setBookingEffectiveEnd(null);
      currentBookingIdRef.current = null;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Call] Error en cleanup:', err);
    }
  }, []);

  // ── Unirse a la room de LiveKit y publicar mic/cámara ─────────────────────
  const joinLiveKitRoom = useCallback(
    async (conversationId: string, m: CallMode) => {
      setState('connecting');
      try {
        const creds = await callsService.getToken(conversationId);

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        roomRef.current = room;

        room.on(RoomEvent.ParticipantConnected, () => {
          setRemoteConnected(true);
        });
        room.on(RoomEvent.ParticipantDisconnected, () => {
          // En 1:1, si el otro se va, terminamos.
          setRemoteConnected(false);
          setRemoteVideoTrack(null);
        });
        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub, _participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Video) {
            setRemoteVideoTrack(track as RemoteVideoTrack);
          } else if (track.kind === Track.Kind.Audio) {
            // livekit-client NO reproduce el audio remoto automáticamente:
            // hay que adjuntar el track a un elemento <audio> en el DOM.
            const audioEl = track.attach();
            audioEl.style.display = 'none';
            audioEl.setAttribute('data-livekit-audio', 'true');
            document.body.appendChild(audioEl);
          }
        });
        room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
          if (track.kind === Track.Kind.Video) {
            setRemoteVideoTrack(null);
          } else if (track.kind === Track.Kind.Audio) {
            track.detach().forEach((el) => el.remove());
          }
        });
        room.on(RoomEvent.Disconnected, () => {
          // Desconexión del servidor; el estado de la app se maneja por evento Socket.IO.
        });

        await room.connect(creds.url, creds.token);

        // Marcar participantes ya presentes (callee aceptó antes que caller conectara).
        if (room.remoteParticipants.size > 0) {
          setRemoteConnected(true);
        }

        await room.localParticipant.setMicrophoneEnabled(true);

        if (m === 'video') {
          await room.localParticipant.setCameraEnabled(true);
          // Recuperar el track local recién publicado para preview.
          const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
          if (camPub?.videoTrack) {
            setLocalVideoTrack(camPub.videoTrack as LocalVideoTrack);
          }
        }

        setState('in-call');
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('[Call] Error al unirse a LiveKit:', err);
        setError(err?.message || 'No se pudo conectar la llamada');
        const callId = activeCallIdRef.current;
        if (callId && socketRef.current) {
          socketRef.current.emit('call:end', { callId });
        }
        await cleanupRtc();
        activeCallIdRef.current = null;
        pendingOutgoingRef.current = null;
        setState('idle');
        setMode(null);
      }
    },
    [cleanupRtc],
  );

  // ── Socket: señalización (mismos eventos que con Agora) ───────────────────
  useEffect(() => {
    const rawToken = localStorage.getItem('accessToken');
    const expiresAt = Number(localStorage.getItem('expiresAt') || '0');
    const isExpired = expiresAt > 0 && expiresAt <= Date.now();
    const token = isExpired ? null : rawToken;
    const guestId = localStorage.getItem(GUEST_SESSION_KEY);
    const authPayload = token
      ? { token: `Bearer ${token}` }
      : guestId
        ? { guestSessionId: guestId }
        : null;
    if (!authPayload) return;

    const socket = io(`${SOCKET_URL}/chat`, {
      auth: authPayload,
      transports: ['websocket'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('call:initiated', (p: IncomingCall) => {
      activeCallIdRef.current = p.callId;
      setMode(p.mode);
      setState('calling');
    });

    socket.on('call:incoming', (p: IncomingCall) => {
      if (activeCallIdRef.current) {
        socket.emit('call:reject', { callId: p.callId, reason: 'busy' });
        return;
      }
      activeCallIdRef.current = p.callId;
      setIncoming(p);
      setMode(p.mode);
      setState('ringing');
    });

    socket.on('call:accepted', async (p: { callId: string; conversationId: string; mode: CallMode }) => {
      if (activeCallIdRef.current !== p.callId) return;
      if (pendingOutgoingRef.current) {
        const { conversationId, mode: m } = pendingOutgoingRef.current;
        pendingOutgoingRef.current = null;
        await joinLiveKitRoom(conversationId, m);
      }
    });

    const onTerminate = (label: CallState) => (p: { callId: string }) => {
      if (activeCallIdRef.current !== p.callId) return;
      cleanupRtc().catch(() => undefined);
      activeCallIdRef.current = null;
      pendingOutgoingRef.current = null;
      setIncoming(null);
      setState(label);
      setTimeout(() => {
        setState((s) => (s === label ? 'idle' : s));
        setMode(null);
      }, 1500);
    };

    socket.on('call:rejected', onTerminate('ended'));
    socket.on('call:cancelled', onTerminate('ended'));
    socket.on('call:ended', onTerminate('ended'));

    socket.on('call:error', (p: { reason: string }) => {
      setError(p.reason);
      cleanupRtc().catch(() => undefined);
      activeCallIdRef.current = null;
      pendingOutgoingRef.current = null;
      setIncoming(null);
      setState('idle');
      setMode(null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Acciones públicas ─────────────────────────────────────────────────────
  const startCall = useCallback((conversationId: string, m: CallMode) => {
    if (!socketRef.current || activeCallIdRef.current) return;
    setError(null);
    setMode(m);
    pendingOutgoingRef.current = { conversationId, mode: m };
    socketRef.current.emit('call:invite', { conversationId, mode: m });
  }, []);

  const acceptCall = useCallback(async () => {
    const inc = incoming;
    if (!socketRef.current || !inc) return;
    socketRef.current.emit('call:accept', { callId: inc.callId });
    setIncoming(null);
    await joinLiveKitRoom(inc.conversationId, inc.mode);
  }, [incoming, joinLiveKitRoom]);

  const rejectCall = useCallback(
    (reason?: string) => {
      const inc = incoming;
      if (!socketRef.current || !inc) return;
      socketRef.current.emit('call:reject', { callId: inc.callId, reason });
      setIncoming(null);
      activeCallIdRef.current = null;
      setState('idle');
      setMode(null);
    },
    [incoming],
  );

  const endCall = useCallback(() => {
    const callId = activeCallIdRef.current;
    // Caso booking: no hay callId de señalización, simplemente desconectamos la room.
    if (currentBookingIdRef.current && !callId) {
      cleanupRtc().catch(() => undefined);
      setState('ended');
      setTimeout(() => {
        setState((s) => (s === 'ended' ? 'idle' : s));
        setMode(null);
      }, 1500);
      return;
    }
    if (!socketRef.current || !callId) return;
    if (state === 'calling') {
      socketRef.current.emit('call:cancel', { callId });
    } else {
      socketRef.current.emit('call:end', { callId });
    }
  }, [state, cleanupRtc]);

  const toggleMute = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !muted;
    void room.localParticipant.setMicrophoneEnabled(!next);
    setMuted(next);
    callSounds.playClick();
  }, [muted]);

  const toggleCamera = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !cameraOff;
    callSounds.playClick();
    void room.localParticipant.setCameraEnabled(!next).then(() => {
      const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
      setLocalVideoTrack((camPub?.videoTrack as LocalVideoTrack) || null);
    });
    setCameraOff(next);
  }, [cameraOff]);

  const clearError = useCallback(() => setError(null), []);

  // ── Booking-aware: unirse a una room por bookingId ───────────────────────
  const joinBooking = useCallback(
    async (bookingId: string) => {
      if (roomRef.current) return;
      setError(null);
      setState('connecting');
      try {
        const creds = await callsService.fetchToken({ bookingId });

        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        room.on(RoomEvent.ParticipantConnected, () => setRemoteConnected(true));
        room.on(RoomEvent.ParticipantDisconnected, () => {
          setRemoteConnected(false);
          setRemoteVideoTrack(null);
        });
        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
          if (track.kind === Track.Kind.Video) {
            setRemoteVideoTrack(track as RemoteVideoTrack);
          } else if (track.kind === Track.Kind.Audio) {
            const audioEl = track.attach();
            audioEl.style.display = 'none';
            audioEl.setAttribute('data-livekit-audio', 'true');
            document.body.appendChild(audioEl);
          }
        });
        room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
          if (track.kind === Track.Kind.Video) {
            setRemoteVideoTrack(null);
          } else if (track.kind === Track.Kind.Audio) {
            track.detach().forEach((el) => el.remove());
          }
        });

        await room.connect(creds.url, creds.token);
        if (room.remoteParticipants.size > 0) setRemoteConnected(true);

        await room.localParticipant.setMicrophoneEnabled(true);
        // Para bookings asumimos video por defecto si el modo viene; el caller puede toggle.
        // No publicamos cámara automáticamente para permitir audio-only.

        // Resolver bookingId + effectiveEnd.
        const resolvedBookingId = creds.bookingId ?? bookingId;
        setCurrentBookingId(resolvedBookingId);
        currentBookingIdRef.current = resolvedBookingId;
        if (creds.effectiveEndAt) {
          setBookingEffectiveEnd(new Date(creds.effectiveEndAt));
        } else if (typeof creds.expiresIn === 'number') {
          // Fallback: si el backend no devuelve effectiveEndAt, usamos expiresIn como aproximación.
          // TODO(backend): devolver `effectiveEndAt` (ISO) y `bookingId` en POST /calls/token cuando
          // se solicite por bookingId, para evitar este cálculo aproximado en el cliente.
          setBookingEffectiveEnd(new Date(Date.now() + creds.expiresIn * 1000));
        }

        setMode('video');
        setState('in-call');
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('[Call] Error al unirse al booking:', err);
        setError(err?.message || 'No se pudo conectar la llamada');
        await cleanupRtc();
        setState('idle');
        setMode(null);
      }
    },
    [cleanupRtc],
  );

  // ── Suscribirse a booking:extended en el socket ya creado ────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = async (p: { bookingId: string; newEndAt: string }) => {
      if (!p?.bookingId || p.bookingId !== currentBookingIdRef.current) return;
      try {
        setBookingEffectiveEnd(new Date(p.newEndAt));
        // Refrescar token para extender TTL del access token de LiveKit.
        const room = roomRef.current;
        if (room) {
          const creds = await callsService.fetchToken({ bookingId: p.bookingId });
          // livekit-client expone updateToken para refrescar sin reconectar.
          // @ts-expect-error tipo no exportado en algunas versiones
          if (typeof room.updateToken === 'function') {
            // @ts-expect-error idem
            await room.updateToken(creds.token);
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Call] Error refrescando token tras booking:extended:', err);
      }
    };
    socket.on('booking:extended', handler);
    return () => {
      socket.off('booking:extended', handler);
    };
    // Re-suscribir si cambia el userId (que recrea el socket).
  }, [userId]);

  // ── Sonidos según el estado de la llamada ─────────────────────────────────
  useEffect(() => {
    switch (state) {
      case 'calling':
        callSounds.playOutgoingRing();
        break;
      case 'ringing':
        callSounds.playIncomingRing();
        break;
      case 'connecting':
        callSounds.stopRings();
        break;
      case 'in-call':
        callSounds.stopRings();
        callSounds.playConnect();
        break;
      case 'ended':
        callSounds.stopRings();
        callSounds.playHangup();
        break;
      case 'idle':
        callSounds.stopRings();
        break;
    }
  }, [state]);

  useEffect(() => {
    return () => {
      callSounds.stopRings();
      cleanupRtc().catch(() => undefined);
    };
  }, [cleanupRtc]);

  return {
    state,
    mode,
    incoming,
    remoteConnected,
    localVideoTrack,
    remoteVideoTrack,
    muted,
    cameraOff,
    error,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    clearError,
    currentBookingId,
    bookingEffectiveEnd,
    joinBooking,
  };
}
