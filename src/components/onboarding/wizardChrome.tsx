import type { ComponentType, ReactNode } from 'react';
import { Check, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────
   Shared visual chrome for onboarding wizards (seller / creator).
   "Aurora glass" aesthetic: atmospheric background, glassmorphism card,
   custom animated stepper, gradient accents. Logic stays in each wizard.
   ──────────────────────────────────────────────────────────────────── */

/* ── MUI field styling (adapts to light/dark via theme.palette.mode) ── */
export const fieldSx = (theme: any) => {
  const dark = theme.palette.mode === 'dark';
  return {
    '& .MuiInputLabel-root': { color: dark ? 'rgba(226,232,240,0.6)' : 'rgba(71,85,105,0.8)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#6850e8' },
    '& .MuiOutlinedInput-root': {
      borderRadius: '0.9rem',
      backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)',
      transition: 'box-shadow .2s ease, background-color .2s ease',
      // Sin borde: input tipo "filled" suave
      '& fieldset': { border: 'none' },
      '&:hover': { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)' },
      '&.Mui-focused': {
        backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.95)',
        boxShadow: '0 0 0 4px rgba(104,80,232,0.18)',
      },
    },
    '& .MuiOutlinedInput-input': { color: dark ? '#e2e8f0' : '#0f172a' },
    '& .MuiFormHelperText-root': { color: dark ? 'rgba(148,163,184,0.8)' : 'rgba(100,116,139,0.9)' },
  };
};

export const menuProps = {
  PaperProps: {
    className: 'custom-scrollbar',
    sx: (theme: any) => {
      const dark = theme.palette.mode === 'dark';
      return {
        mt: 0.75,
        maxHeight: 320,
        borderRadius: '0.9rem',
        backgroundColor: dark ? '#0e1626' : '#ffffff',
        border: 'none',
        boxShadow: '0 24px 60px -16px rgba(2,6,23,0.55)',
        backgroundImage: 'none',
        '& .MuiMenuItem-root': {
          fontSize: 14,
          borderRadius: '0.6rem',
          mx: 0.75,
          my: 0.25,
          color: dark ? '#cbd5e1' : '#1e293b',
          '&:hover': { backgroundColor: dark ? 'rgba(104,80,232,0.14)' : 'rgba(104,80,232,0.08)' },
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: dark ? 'rgba(104,80,232,0.24)' : 'rgba(104,80,232,0.14)',
            color: dark ? '#c9bcff' : '#5836d4',
          },
        },
      };
    },
  },
};

export const primaryBtnSx = {
  backgroundColor: '#6850e8',
  color: '#fff',
  borderRadius: '0.9rem',
  px: 3.5,
  py: 1.15,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: '0 8px 22px -12px rgba(104,80,232,0.7)',
  transition: 'all .2s ease',
  '&:hover': {
    backgroundColor: '#5836d4',
    boxShadow: '0 10px 26px -12px rgba(104,80,232,0.8)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(120,130,150,0.25)',
    color: 'rgba(255,255,255,0.55)',
    boxShadow: 'none',
  },
};

export const ghostBtnSx = {
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.95rem',
  borderRadius: '0.9rem',
  px: 2.5,
  color: 'rgba(148,163,184,0.95)',
  '&:hover': { backgroundColor: 'rgba(148,163,184,0.12)' },
};

/* ── Custom animated stepper ───────────────────────────────────────── */
export function WizardStepper({ steps, step }: { steps: string[]; step: number }) {
  const progress = steps.length > 1 ? step / (steps.length - 1) : 1;
  return (
    <div className="relative mb-10 mt-1">
      <div className="absolute left-5 right-5 top-5 h-[3px] -translate-y-1/2 rounded-full bg-gray-200/80 dark:bg-white/10" />
      <div
        className="absolute left-5 top-5 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500 ease-out"
        style={{ width: `calc((100% - 40px) * ${progress})` }}
      />
      <div className="relative flex justify-between">
        {steps.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={label} className="flex flex-1 flex-col items-center text-center">
              <div
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                  done || active
                    ? 'bg-gradient-to-br from-primary-500 to-primary-400 text-white shadow-[0_8px_20px_-6px_rgba(104,80,232,0.8)]'
                    : 'bg-gray-100 text-gray-400 shadow-inner dark:bg-white/[0.06] dark:text-gray-500',
                  active ? 'scale-110 animate-glow-pulse ring-4 ring-primary-500/25' : '',
                ].join(' ')}
              >
                {done ? <Check className="h-5 w-5 animate-check-pop" /> : i + 1}
              </div>
              <span
                className={[
                  'mt-2.5 max-w-[7rem] text-[0.72rem] font-medium leading-tight transition-colors sm:text-xs',
                  active
                    ? 'text-primary-600 dark:text-primary-300'
                    : done
                      ? 'text-gray-600 dark:text-gray-300'
                      : 'text-gray-400 dark:text-gray-500',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Section heading with gradient icon chip ───────────────────────── */
export function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-400/10 text-primary-600 dark:text-primary-300">
        <Icon className="h-[1.05rem] w-[1.05rem]" />
      </span>
      <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
        {children}
      </h2>
    </div>
  );
}

/* ── Preview row (icon + label + value) ────────────────────────────── */
export function PreviewRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3.5 rounded-2xl bg-gray-50/80 p-4 transition-colors hover:bg-gray-100/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-400/10 text-primary-600 dark:text-primary-300">
        <Icon className="h-[1.05rem] w-[1.05rem]" />
      </span>
      <div className="min-w-0">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {label}
        </h3>
        <p className="mt-0.5 break-words text-sm text-gray-800 dark:text-gray-200">{children}</p>
      </div>
    </div>
  );
}

/* ── Selectable chip (languages / categories / content types) ──────── */
export function SelectableChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative flex items-center justify-center gap-2.5 rounded-2xl px-3.5 py-3 text-center text-sm font-medium transition-all duration-200',
        selected
          ? 'bg-gradient-to-br from-primary-500/25 to-primary-400/15 text-primary-700 shadow-[0_10px_26px_-10px_rgba(104,80,232,0.6)] dark:text-primary-200'
          : 'bg-gray-100/80 text-gray-700 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-lg dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/[0.08]',
      ].join(' ')}
    >
      {children}
      {selected && (
        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-400 text-white">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

/* ── Full page shell: background + header + glass card + stepper ───── */
export function WizardShell({
  badge,
  title,
  subtitle,
  steps,
  step,
  user,
  children,
}: {
  badge: string;
  title: string;
  subtitle: string;
  steps: string[];
  step: number;
  user?: { email?: string; role?: string } | null;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-col justify-center overflow-hidden bg-[#f6f8ff] px-4 py-8 dark:bg-[#070b16]">
      {/* ── Atmospheric background ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 h-96 w-96 animate-aurora rounded-full bg-primary-400/25 blur-[120px] dark:bg-primary-500/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/3 h-[28rem] w-[28rem] animate-aurora rounded-full bg-violet-400/20 blur-[130px] dark:bg-violet-500/20"
        style={{ animationDelay: '-6s' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 animate-aurora rounded-full bg-fuchsia-400/15 blur-[120px] dark:bg-fuchsia-500/15"
        style={{ animationDelay: '-10s' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 40%, transparent 100%)',
          color: '#6850e8',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        {/* ── Header ── */}
        <div className="mb-6 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-700 backdrop-blur-sm dark:text-primary-300">
            <Sparkles className="h-3.5 w-3.5" />
            {badge}
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-violet-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-balance text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* ── Glass card ── */}
        <div className="relative overflow-hidden rounded-3xl bg-white/80 p-6 shadow-[0_30px_80px_-24px_rgba(15,23,42,0.25)] backdrop-blur-2xl dark:bg-white/[0.04] dark:shadow-[0_30px_90px_-24px_rgba(0,0,0,0.75)] md:p-9">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/70 to-transparent" />
          <WizardStepper steps={steps} step={step} />
          {children}
        </div>

        {user && (
          <div className="mt-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3.5 py-1.5 text-xs text-gray-500 shadow-sm backdrop-blur-sm dark:bg-white/5 dark:text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {user.email} • Rol actual: {user.role}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
