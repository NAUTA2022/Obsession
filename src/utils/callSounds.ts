/**
 * Generador de sonidos de llamada con Web Audio API (sin archivos de audio).
 *
 * Los navegadores bloquean el audio hasta que el usuario interactúa con la
 * página. Por eso el AudioContext se crea de forma perezosa y se hace resume()
 * en cada reproducción: para llamadas salientes y clicks (post-gesto) suena
 * siempre; para una llamada entrante sin interacción previa puede no sonar.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/** Reproduce un tono simple con envolvente suave (evita clicks/pops). */
function tone(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  gain = 0.18,
  type: OscillatorType = 'sine',
): void {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  const attack = 0.015;
  const release = 0.04;
  env.gain.setValueAtTime(0, startAt);
  env.gain.linearRampToValueAtTime(gain, startAt + attack);
  env.gain.setValueAtTime(gain, startAt + Math.max(attack, duration - release));
  env.gain.linearRampToValueAtTime(0, startAt + duration);

  osc.connect(env);
  env.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

// ─── Loops (entrante / saliente) ─────────────────────────────────────────────

type LoopHandle = { stop: () => void };
let outgoingLoop: LoopHandle | null = null;
let incomingLoop: LoopHandle | null = null;

/**
 * Tono ringback saliente clásico: dos frecuencias (440 + 480 Hz),
 * 1s sonando / 2s en silencio, repetido.
 */
function startOutgoing(): LoopHandle {
  const ctx = getCtx();
  if (!ctx) return { stop: () => undefined };

  let cancelled = false;
  const period = 3; // segundos: 1s on + 2s off

  const schedule = () => {
    if (cancelled || !ctx) return;
    const now = ctx.currentTime;
    tone(ctx, 440, now, 1, 0.14);
    tone(ctx, 480, now, 1, 0.14);
  };

  schedule();
  const interval = window.setInterval(schedule, period * 1000);

  return {
    stop: () => {
      cancelled = true;
      window.clearInterval(interval);
    },
  };
}

/**
 * Ring entrante: melodía de dos notas (más llamativa), 2s de patrón
 * + 1.5s de silencio, repetido.
 */
function startIncoming(): LoopHandle {
  const ctx = getCtx();
  if (!ctx) return { stop: () => undefined };

  let cancelled = false;
  const period = 3.5;

  const schedule = () => {
    if (cancelled || !ctx) return;
    const now = ctx.currentTime;
    // Patrón: do-mi-do-mi en dos pares
    tone(ctx, 660, now, 0.4, 0.2, 'triangle');
    tone(ctx, 880, now + 0.45, 0.4, 0.2, 'triangle');
    tone(ctx, 660, now + 1.0, 0.4, 0.2, 'triangle');
    tone(ctx, 880, now + 1.45, 0.4, 0.2, 'triangle');
  };

  schedule();
  const interval = window.setInterval(schedule, period * 1000);

  return {
    stop: () => {
      cancelled = true;
      window.clearInterval(interval);
    },
  };
}

// ─── API pública ─────────────────────────────────────────────────────────────

export const callSounds = {
  /** Inicia el loop del tono de llamada saliente ("Llamando…"). */
  playOutgoingRing(): void {
    if (outgoingLoop) return;
    outgoingLoop = startOutgoing();
  },

  /** Inicia el loop del ring de llamada entrante. */
  playIncomingRing(): void {
    if (incomingLoop) return;
    incomingLoop = startIncoming();
  },

  /** Detiene cualquier loop de ring (entrante o saliente). */
  stopRings(): void {
    outgoingLoop?.stop();
    outgoingLoop = null;
    incomingLoop?.stop();
    incomingLoop = null;
  },

  /** Beep ascendente de dos notas: la llamada se conectó. */
  playConnect(): void {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    tone(ctx, 523, now, 0.12, 0.2);
    tone(ctx, 784, now + 0.13, 0.16, 0.2);
  },

  /** Beep descendente de dos notas: la llamada terminó. */
  playHangup(): void {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    tone(ctx, 587, now, 0.12, 0.2);
    tone(ctx, 392, now + 0.13, 0.18, 0.2);
  },

  /** Blip corto de feedback para botones (mute, cámara). */
  playClick(): void {
    const ctx = getCtx();
    if (!ctx) return;
    tone(ctx, 660, ctx.currentTime, 0.05, 0.12, 'square');
  },
};
