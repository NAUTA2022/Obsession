import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  CircularProgress,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Plus,
  Pencil,
  Trash2,
  Video,
  Phone,
  Calendar,
  RefreshCw,
  Unplug,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import callPlansService, {
  type CreateCallPlanInput,
} from '../services/api/callPlans.service';
import workingHoursService from '../services/api/workingHours.service';
import googleCalendarService from '../services/api/googleCalendar.service';
import type {
  CallMode,
  CallPlan,
  CreatorWorkingHours,
  CreatorWorkingHoursRule,
  GoogleCalendarStatus,
} from '../types/bookings';
import { fieldSx, menuProps, primaryBtnSx } from '../components/onboarding/wizardChrome';

// Weekday mapping: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

const COMMON_TIMEZONES = [
  'America/Bogota',
  'America/Mexico_City',
  'America/Argentina/Buenos_Aires',
  'America/Santiago',
  'America/Lima',
  'America/New_York',
  'Europe/Madrid',
  'UTC',
];

function formatPrice(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: (currency || 'USD').toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

// Sección con cabecera de icono morado, consistente con el resto de la app.
function Section({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/15 to-primary-400/10 text-primary-600 ring-1 ring-primary-500/20 dark:text-primary-300">
            <Icon size={18} />
          </span>
          <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const dialogPaperSx = (theme: any) => ({
  borderRadius: '1.25rem',
  backgroundImage: 'none',
  backgroundColor: theme.palette.mode === 'dark' ? '#0e1626' : '#ffffff',
  border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.06)',
});

interface PlanDialogState {
  open: boolean;
  editing: CallPlan | null;
  mode: CallMode;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  title: string;
  description: string;
}

const emptyPlanDialog: PlanDialogState = {
  open: false,
  editing: null,
  mode: 'video',
  durationMinutes: 15,
  priceCents: 1000,
  currency: 'USD',
  title: '',
  description: '',
};

export default function CallSettings() {
  // Plans
  const [plans, setPlans] = useState<CallPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [planDialog, setPlanDialog] = useState<PlanDialogState>(emptyPlanDialog);
  const [savingPlan, setSavingPlan] = useState(false);

  // Working hours
  const [whLoading, setWhLoading] = useState(true);
  const [timezone, setTimezone] = useState('America/Bogota');
  const [rules, setRules] = useState<Record<number, { enabled: boolean; startTime: string; endTime: string }>>(
    () => Object.fromEntries(WEEKDAYS.map((w) => [w.value, { enabled: false, startTime: '09:00', endTime: '18:00' }])),
  );
  const [granularity, setGranularity] = useState(15);
  const [minNotice, setMinNotice] = useState(60);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
  const [savingWh, setSavingWh] = useState(false);

  // Google calendar
  const [gcal, setGcal] = useState<GoogleCalendarStatus | null>(null);
  const [gcalLoading, setGcalLoading] = useState(true);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const data = await callPlansService.listMine();
      setPlans(data);
    } catch {
      toast.error('No pudimos cargar tus planes');
    } finally {
      setPlansLoading(false);
    }
  };

  const loadWorkingHours = async () => {
    setWhLoading(true);
    try {
      const data = await workingHoursService.getMine();
      if (data) {
        setTimezone(data.timezone);
        setGranularity(data.slotGranularityMinutes);
        setMinNotice(data.minNoticeMinutes);
        setMaxAdvanceDays(data.maxAdvanceDays);
        const next = Object.fromEntries(
          WEEKDAYS.map((w) => [w.value, { enabled: false, startTime: '09:00', endTime: '18:00' }]),
        ) as Record<number, { enabled: boolean; startTime: string; endTime: string }>;
        for (const r of data.rules) {
          next[r.weekday] = { enabled: true, startTime: r.startTime, endTime: r.endTime };
        }
        setRules(next);
      }
    } catch {
      // silent
    } finally {
      setWhLoading(false);
    }
  };

  const loadGcal = async () => {
    setGcalLoading(true);
    try {
      const data = await googleCalendarService.getMine();
      setGcal(data);
    } catch {
      setGcal({ status: 'not_connected' });
    } finally {
      setGcalLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
    loadWorkingHours();
    loadGcal();
  }, []);

  const togglePlanActive = async (p: CallPlan) => {
    try {
      const updated = await callPlansService.update(p.id, { isActive: !p.isActive });
      setPlans((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch {
      toast.error('No se pudo actualizar el plan');
    }
  };

  const openCreatePlan = () => setPlanDialog({ ...emptyPlanDialog, open: true });
  const openEditPlan = (p: CallPlan) =>
    setPlanDialog({
      open: true,
      editing: p,
      mode: p.mode,
      durationMinutes: p.durationMinutes,
      priceCents: p.priceCents,
      currency: p.currency,
      title: p.title ?? '',
      description: p.description ?? '',
    });

  const savePlan = async () => {
    setSavingPlan(true);
    try {
      const payload: CreateCallPlanInput = {
        mode: planDialog.mode,
        durationMinutes: Number(planDialog.durationMinutes),
        priceCents: Number(planDialog.priceCents),
        currency: planDialog.currency || 'USD',
        title: planDialog.title || undefined,
        description: planDialog.description || undefined,
      };
      if (planDialog.editing) {
        await callPlansService.update(planDialog.editing.id, payload);
        toast.success('Plan actualizado');
      } else {
        await callPlansService.create(payload);
        toast.success('Plan creado');
      }
      setPlanDialog(emptyPlanDialog);
      await loadPlans();
    } catch {
      toast.error('No se pudo guardar el plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const deletePlan = async (p: CallPlan) => {
    if (!window.confirm(`¿Eliminar el plan "${p.title || `${p.durationMinutes} min`}"?`)) return;
    try {
      await callPlansService.remove(p.id);
      toast.success('Plan eliminado');
      await loadPlans();
    } catch {
      toast.error('No se pudo eliminar');
    }
  };

  const saveWorkingHours = async () => {
    setSavingWh(true);
    try {
      const activeRules: CreatorWorkingHoursRule[] = Object.entries(rules)
        .filter(([, v]) => v.enabled)
        .map(([weekday, v]) => ({
          weekday: Number(weekday),
          startTime: v.startTime,
          endTime: v.endTime,
        }));
      await workingHoursService.upsert({
        timezone,
        rules: activeRules,
        slotGranularityMinutes: granularity,
        minNoticeMinutes: minNotice,
        maxAdvanceDays,
      });
      toast.success('Disponibilidad guardada');
    } catch {
      toast.error('No se pudo guardar la disponibilidad');
    } finally {
      setSavingWh(false);
    }
  };

  const handleReconnect = async () => {
    try {
      const { url } = await googleCalendarService.getOAuthUrl();
      window.location.href = url;
    } catch {
      toast.error('No se pudo iniciar la conexión');
    }
  };

  const handleDisconnect = async () => {
    try {
      await googleCalendarService.disconnect();
      toast.success('Google Calendar desconectado');
      setConfirmDisconnect(false);
      await loadGcal();
    } catch {
      toast.error('No se pudo desconectar');
    }
  };

  const gcalBadge = (() => {
    if (!gcal) return null;
    const connected = gcal.status === 'active';
    const map: Record<GoogleCalendarStatus['status'], { label: string; cls: string }> = {
      active: {
        label: 'Conectado',
        cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
      },
      revoked: {
        label: 'Acceso revocado',
        cls: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
      },
      error: {
        label: 'Error',
        cls: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
      },
      not_connected: {
        label: 'No conectado',
        cls: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10',
      },
    };
    const { label, cls } = map[gcal.status];
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-current opacity-60'}`} />
        {label}
      </span>
    );
  })();

  const timeInputCls =
    'min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 transition-shadow [color-scheme:light] focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/15 disabled:bg-gray-50 disabled:text-gray-400 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark] dark:disabled:bg-gray-900/60 dark:disabled:text-gray-500 sm:flex-none';

  return (
    <div className="mx-auto h-full w-full max-w-5xl animate-fade-in space-y-6 pb-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Configuración de llamadas
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestiona tus planes, disponibilidad e integraciones
        </p>
      </div>

      {/* Google Calendar */}
      <Section icon={Calendar} title="Google Calendar" action={gcalBadge}>
        {gcalLoading ? (
          <div className="flex justify-center py-6">
            <CircularProgress sx={{ color: '#6850e8' }} />
          </div>
        ) : (
          <>
            {gcal?.googleAccountEmail && (
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Cuenta: <span className="font-medium text-gray-800 dark:text-gray-200">{gcal.googleAccountEmail}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleReconnect}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                <RefreshCw size={14} />
                {gcal?.status === 'active' ? 'Reconectar' : 'Conectar'}
              </button>
              {gcal?.status === 'active' && (
                <button
                  onClick={() => setConfirmDisconnect(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                >
                  <Unplug size={14} /> Desconectar
                </button>
              )}
            </div>
          </>
        )}
      </Section>

      {/* Plans */}
      <Section
        icon={Video}
        title="Mis planes"
        action={
          <button
            onClick={openCreatePlan}
            className="flex items-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(104,80,232,0.8)] transition-all hover:shadow-[0_14px_30px_-10px_rgba(104,80,232,0.9)]"
          >
            <Plus size={16} /> Añadir plan
          </button>
        }
      >
        {plansLoading ? (
          <div className="flex justify-center py-10">
            <CircularProgress sx={{ color: '#6850e8' }} />
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center dark:border-white/10">
            <p className="text-sm text-gray-500 dark:text-gray-400">Aún no has creado planes.</p>
            <button
              onClick={openCreatePlan}
              className="mt-3 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              Crear tu primer plan
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {plans.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-gray-200/70 hover:bg-gray-50/60 dark:hover:border-white/10 dark:hover:bg-white/[0.03]"
              >
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    p.mode === 'video'
                      ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300'
                      : 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
                  }`}
                >
                  {p.mode === 'video' ? <Video size={12} /> : <Phone size={12} />}
                  {p.mode === 'video' ? 'Vídeo' : 'Audio'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {p.title || `${p.durationMinutes} min`}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {p.durationMinutes} min · {formatPrice(p.priceCents, p.currency)}
                  </div>
                </div>
                <Switch checked={p.isActive} onChange={() => togglePlanActive(p)} size="small" />
                <button
                  onClick={() => openEditPlan(p)}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-white/5"
                  aria-label="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deletePlan(p)}
                  className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Working hours */}
      <Section icon={Clock} title="Mi disponibilidad">
        {whLoading ? (
          <div className="flex justify-center py-10">
            <CircularProgress sx={{ color: '#6850e8' }} />
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-1.5">
              {WEEKDAYS.map((w) => {
                const r = rules[w.value];
                return (
                  <div
                    key={w.value}
                    className={`flex flex-col gap-2 rounded-xl px-3 py-2 transition-colors sm:flex-row sm:items-center sm:gap-3 ${
                      r.enabled ? 'bg-primary-50/50 dark:bg-primary-500/5' : ''
                    }`}
                  >
                    <label className="flex w-full cursor-pointer items-center gap-2.5 sm:w-32">
                      <input
                        type="checkbox"
                        checked={r.enabled}
                        onChange={(e) =>
                          setRules((prev) => ({
                            ...prev,
                            [w.value]: { ...prev[w.value], enabled: e.target.checked },
                          }))
                        }
                        className="h-4 w-4 rounded accent-primary-600"
                      />
                      <span
                        className={`text-sm font-medium ${
                          r.enabled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {w.label}
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={r.startTime}
                        disabled={!r.enabled}
                        onChange={(e) =>
                          setRules((prev) => ({
                            ...prev,
                            [w.value]: { ...prev[w.value], startTime: e.target.value },
                          }))
                        }
                        className={timeInputCls}
                      />
                      <span className="text-sm text-gray-400">–</span>
                      <input
                        type="time"
                        value={r.endTime}
                        disabled={!r.enabled}
                        onChange={(e) =>
                          setRules((prev) => ({
                            ...prev,
                            [w.value]: { ...prev[w.value], endTime: e.target.value },
                          }))
                        }
                        className={timeInputCls}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                select
                label="Zona horaria"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                size="small"
                fullWidth
                sx={fieldSx}
                SelectProps={{ MenuProps: menuProps }}
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Granularidad (min)"
                type="number"
                size="small"
                value={granularity}
                onChange={(e) => setGranularity(Number(e.target.value))}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Antelación mínima (min)"
                type="number"
                size="small"
                value={minNotice}
                onChange={(e) => setMinNotice(Number(e.target.value))}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Días máx. anticipación"
                type="number"
                size="small"
                value={maxAdvanceDays}
                onChange={(e) => setMaxAdvanceDays(Number(e.target.value))}
                fullWidth
                sx={fieldSx}
              />
            </div>

            <button
              onClick={saveWorkingHours}
              disabled={savingWh}
              className="rounded-xl bg-primary-600 hover:bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(104,80,232,0.8)] transition-all hover:shadow-[0_14px_30px_-10px_rgba(104,80,232,0.9)] disabled:opacity-60"
            >
              {savingWh ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        )}
      </Section>

      {/* Plan dialog */}
      <Dialog
        open={planDialog.open}
        onClose={() => !savingPlan && setPlanDialog(emptyPlanDialog)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{planDialog.editing ? 'Editar plan' : 'Nuevo plan'}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              select
              label="Modo"
              value={planDialog.mode}
              onChange={(e) => setPlanDialog({ ...planDialog, mode: e.target.value as CallMode })}
              size="small"
              fullWidth
              sx={fieldSx}
              SelectProps={{ MenuProps: menuProps }}
            >
              <MenuItem value="video">Vídeo</MenuItem>
              <MenuItem value="audio">Audio</MenuItem>
            </TextField>
            <TextField
              label="Duración (min)"
              type="number"
              value={planDialog.durationMinutes}
              onChange={(e) => setPlanDialog({ ...planDialog, durationMinutes: Number(e.target.value) })}
              size="small"
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="Precio (centavos)"
              type="number"
              value={planDialog.priceCents}
              onChange={(e) => setPlanDialog({ ...planDialog, priceCents: Number(e.target.value) })}
              size="small"
              helperText="1000 = $10.00"
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="Moneda"
              value={planDialog.currency}
              onChange={(e) => setPlanDialog({ ...planDialog, currency: e.target.value.toUpperCase() })}
              size="small"
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="Título"
              value={planDialog.title}
              onChange={(e) => setPlanDialog({ ...planDialog, title: e.target.value })}
              size="small"
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="Descripción"
              value={planDialog.description}
              onChange={(e) => setPlanDialog({ ...planDialog, description: e.target.value })}
              size="small"
              multiline
              minRows={2}
              fullWidth
              sx={fieldSx}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setPlanDialog(emptyPlanDialog)}
            disabled={savingPlan}
            sx={{ textTransform: 'none', color: 'text.secondary', borderRadius: '0.75rem' }}
          >
            Cancelar
          </Button>
          <Button onClick={savePlan} disabled={savingPlan} variant="contained" sx={primaryBtnSx}>
            {savingPlan ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disconnect confirm */}
      <Dialog open={confirmDisconnect} onClose={() => setConfirmDisconnect(false)} PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={{ fontWeight: 700 }}>¿Desconectar Google Calendar?</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Dejaremos de sincronizar tus reservas con Google Calendar.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmDisconnect(false)} sx={{ textTransform: 'none', color: 'text.secondary', borderRadius: '0.75rem' }}>
            Volver
          </Button>
          <Button
            onClick={handleDisconnect}
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: '0.75rem',
              backgroundColor: '#dc2626',
              '&:hover': { backgroundColor: '#b91c1c' },
            }}
          >
            Sí, desconectar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suppress unused var lint for type that's only structurally used */}
      <CreatorWorkingHoursTypeHelper />
    </div>
  );
}

// Tiny helper so the imported CreatorWorkingHours type isn't reported as unused
// if tsconfig is strict about that. Renders nothing.
function CreatorWorkingHoursTypeHelper() {
  const _t: CreatorWorkingHours | undefined = undefined;
  void _t;
  return null;
}
