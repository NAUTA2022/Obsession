import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Typography,
  Avatar,
  Snackbar,
  Alert,
} from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useCall } from './call-context';
import { useAuthStore } from '../../store/auth';
import { ROUTES } from '../../constants/routes';
import { CallTimer } from './CallTimer';
import { ExtendCallModal } from './ExtendCallModal';
import toast from 'react-hot-toast';

export function CallOverlay() {
  const {
    state,
    mode,
    incoming,
    remoteConnected,
    localVideoTrack,
    remoteVideoTrack,
    muted,
    cameraOff,
    error,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    clearError,
    currentBookingId,
    bookingEffectiveEnd,
  } = useCall();

  const [showExtendBanner, setShowExtendBanner] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const hasBooking = !!currentBookingId && !!bookingEffectiveEnd;

  const handleTimerExpire = () => {
    toast('La llamada ha finalizado');
    endCall();
  };

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // ── Drag del recuadro de video local ──────────────────────────────────────
  const PIP_W = 140;
  const PIP_H = 200;
  const stageRef = useRef<HTMLDivElement>(null);
  // null = posición por defecto (esquina inferior derecha). {x,y} = posición arrastrada.
  const [pipPos, setPipPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);

  // Margen inferior reservado para la barra de controles flotante.
  const CONTROLS_MARGIN = 120;

  const clampPip = (x: number, y: number) => {
    const stage = stageRef.current;
    const maxX = (stage?.clientWidth ?? window.innerWidth) - PIP_W;
    const maxY = (stage?.clientHeight ?? window.innerHeight) - PIP_H - CONTROLS_MARGIN;
    return {
      x: Math.max(0, Math.min(x, Math.max(0, maxX))),
      y: Math.max(0, Math.min(y, Math.max(0, maxY))),
    };
  };

  const handlePipPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    const box = e.currentTarget.getBoundingClientRect();
    const stageBox = stage?.getBoundingClientRect();
    dragRef.current = {
      offsetX: e.clientX - box.left,
      offsetY: e.clientY - box.top,
    };
    // Fijar la posición actual antes de empezar a arrastrar (por si venía del default).
    if (stageBox) {
      setPipPos(clampPip(box.left - stageBox.left, box.top - stageBox.top));
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePipPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const stageBox = stageRef.current?.getBoundingClientRect();
    if (!stageBox) return;
    const x = e.clientX - stageBox.left - dragRef.current.offsetX;
    const y = e.clientY - stageBox.top - dragRef.current.offsetY;
    setPipPos(clampPip(x, y));
  };

  const handlePipPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isGuest = !user;

  const handleSignupToAccept = () => {
    // Rechazar la llamada actual con motivo informativo y mandar a registro.
    // El caller verá "guest-needs-signup" como razón.
    rejectCall('guest-needs-signup');
    const returnTo = incoming?.conversationId
      ? `/chat?conv=${incoming.conversationId}`
      : ROUTES.chat;
    navigate(`${ROUTES.signup}?next=${encodeURIComponent(returnTo)}`);
  };

  const open = state !== 'idle' && state !== 'ended';
  const isVideo = mode === 'video';

  // Adjuntar el track de video local al <video>
  useEffect(() => {
    if (state === 'in-call' && isVideo && localVideoTrack && localVideoRef.current) {
      localVideoTrack.attach(localVideoRef.current);
      return () => {
        localVideoTrack.detach(localVideoRef.current!);
      };
    }
  }, [state, isVideo, localVideoTrack]);

  // Adjuntar el track de video remoto
  useEffect(() => {
    if (state !== 'in-call' || !isVideo) return;
    if (remoteVideoTrack && remoteVideoRef.current) {
      remoteVideoTrack.attach(remoteVideoRef.current);
      return () => {
        remoteVideoTrack.detach(remoteVideoRef.current!);
      };
    }
  }, [state, isVideo, remoteVideoTrack]);

  return (
    <>
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={clearError} variant="filled">
          {translateError(error)}
        </Alert>
      </Snackbar>

      <Dialog
        open={open}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: '#0f1419',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          },
        }}
      >
        {/* Estado: ringing (entrante) ───────────────────────────────────── */}
        {state === 'ringing' && incoming && (
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 120, height: 120, bgcolor: '#7B5CF6', fontSize: 48 }}>
              {incoming.callerId[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                Llamada entrante
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                {incoming.mode === 'video' ? 'Videollamada' : 'Llamada de voz'}
              </Typography>
              {isGuest && (
                <Typography variant="body2" sx={{ mt: 2, color: '#fbbf24', maxWidth: 320, mx: 'auto' }}>
                  Para aceptar llamadas necesitas crear una cuenta gratuita
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 6, mt: 4, alignItems: 'flex-start' }}>
              <Box sx={{ textAlign: 'center' }}>
                <IconButton
                  onClick={rejectCall}
                  sx={{ bgcolor: '#e53935', color: 'white', width: 64, height: 64, '&:hover': { bgcolor: '#c62828' } }}
                >
                  <CallEndIcon fontSize="large" />
                </IconButton>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                  Rechazar
                </Typography>
              </Box>
              {isGuest ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={handleSignupToAccept}
                    startIcon={<PersonAddIcon />}
                    sx={{
                      bgcolor: '#22c55e',
                      color: 'white',
                      borderRadius: '999px',
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#16a34a' },
                    }}
                  >
                    Crear cuenta para aceptar
                  </Button>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                    Es gratis · 30 segundos
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <IconButton
                    onClick={() => { acceptCall().catch(() => undefined); }}
                    sx={{ bgcolor: '#22c55e', color: 'white', width: 64, height: 64, '&:hover': { bgcolor: '#16a34a' } }}
                  >
                    <CallIcon fontSize="large" />
                  </IconButton>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                    Aceptar
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Estado: calling / connecting ──────────────────────────────────── */}
        {(state === 'calling' || state === 'connecting') && (
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 120, height: 120, bgcolor: '#7B5CF6', fontSize: 48 }}>·</Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                {state === 'calling' ? 'Llamando…' : 'Conectando…'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                {isVideo ? 'Videollamada' : 'Llamada de voz'}
              </Typography>
            </Box>
            <IconButton
              onClick={endCall}
              sx={{ bgcolor: '#e53935', color: 'white', width: 64, height: 64, mt: 4, '&:hover': { bgcolor: '#c62828' } }}
            >
              <CallEndIcon fontSize="large" />
            </IconButton>
          </Box>
        )}

        {/* Timer (booking) en la esquina superior derecha */}
        {state === 'in-call' && hasBooking && bookingEffectiveEnd && (
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 30 }}>
            <CallTimer
              endsAt={bookingEffectiveEnd}
              warningThresholdSeconds={60}
              onWarning={() => setShowExtendBanner(true)}
              onExpire={handleTimerExpire}
            />
          </Box>
        )}

        {/* Banner de extensión */}
        {state === 'in-call' && hasBooking && showExtendBanner && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 110,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 25,
              bgcolor: 'rgba(17,17,17,0.92)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              borderRadius: 999,
              px: 3,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Tu tiempo está por terminar — ¿extender?
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => setExtendOpen(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 999,
                background: 'linear-gradient(90deg,#ec4899,#a855f7)',
                fontWeight: 600,
              }}
            >
              Extender
            </Button>
            <IconButton
              size="small"
              onClick={() => setShowExtendBanner(false)}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
              aria-label="Cerrar"
            >
              <CallEndIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {hasBooking && currentBookingId && (
          <ExtendCallModal
            open={extendOpen}
            onClose={() => setExtendOpen(false)}
            bookingId={currentBookingId}
          />
        )}

        {/* Estado: in-call ───────────────────────────────────────────────── */}
        {state === 'in-call' && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Remoto (grande) */}
            <Box ref={stageRef} sx={{ flex: 1, position: 'relative', bgcolor: '#000' }}>
              {isVideo ? (
                <Box
                  component="video"
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                  <Avatar sx={{ width: 140, height: 140, bgcolor: '#7B5CF6', fontSize: 56 }}>·</Avatar>
                  <Typography variant="h6">En llamada</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.6 }}>
                    {remoteConnected ? 'Conectado' : 'Esperando audio remoto…'}
                  </Typography>
                </Box>
              )}

              {/* Local (esquina) */}
              {isVideo && (
                <Box
                  onPointerDown={handlePipPointerDown}
                  onPointerMove={handlePipPointerMove}
                  onPointerUp={handlePipPointerUp}
                  sx={{
                    position: 'absolute',
                    ...(pipPos
                      ? { left: pipPos.x, top: pipPos.y }
                      : { bottom: 110, right: 16 }),
                    width: PIP_W,
                    height: PIP_H,
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: '#222',
                    border: '2px solid rgba(255,255,255,0.2)',
                    cursor: 'grab',
                    touchAction: 'none',
                    '&:active': { cursor: 'grabbing' },
                  }}
                >
                  <Box
                    component="video"
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      pointerEvents: 'none',
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Controles — barra flotante siempre visible sobre el video */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 20,
                py: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))',
              }}
            >
              <IconButton
                onClick={toggleMute}
                sx={{
                  bgcolor: muted ? '#e53935' : 'rgba(255,255,255,0.15)',
                  color: 'white',
                  width: 56,
                  height: 56,
                }}
              >
                {muted ? <MicOffIcon /> : <MicIcon />}
              </IconButton>

              {isVideo && (
                <IconButton
                  onClick={toggleCamera}
                  sx={{
                    bgcolor: cameraOff ? '#e53935' : 'rgba(255,255,255,0.15)',
                    color: 'white',
                    width: 56,
                    height: 56,
                  }}
                >
                  {cameraOff ? <VideocamOffIcon /> : <VideocamIcon />}
                </IconButton>
              )}

              <IconButton
                onClick={endCall}
                sx={{ bgcolor: '#e53935', color: 'white', width: 64, height: 64, '&:hover': { bgcolor: '#c62828' } }}
              >
                <CallEndIcon fontSize="large" />
              </IconButton>
            </Box>
          </Box>
        )}
      </Dialog>
    </>
  );
}

function translateError(reason: string | null): string {
  if (!reason) return '';
  switch (reason) {
    case 'busy':
      return 'El usuario está ocupado';
    case 'already-in-call':
      return 'Ya hay una llamada activa con este usuario';
    case 'not-participant':
      return 'No eres participante de esta conversación';
    case 'conversation-not-found':
      return 'Conversación no encontrada';
    case 'no-answer':
      return 'Sin respuesta';
    case 'peer-disconnected':
      return 'El usuario se desconectó';
    case 'rejected':
      return 'Llamada rechazada';
    case 'guest-needs-signup':
      return 'El usuario está creando una cuenta para aceptar';
    case 'cancelled':
      return 'Llamada cancelada';
    case 'ended':
      return 'Llamada finalizada';
    default:
      return reason;
  }
}
