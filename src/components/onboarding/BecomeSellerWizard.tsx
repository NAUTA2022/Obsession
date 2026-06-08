import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, MenuItem, CircularProgress } from '@mui/material';
import {
  Check,
  Globe2,
  Languages,
  SlidersHorizontal,
  Eye,
  PartyPopper,
  ArrowRight,
  ArrowLeft,
  Store,
  Tags,
  Percent,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { State } from 'country-state-city';
import { useOnboardingSellerStore } from '../../store/onboardingSeller';
import { useAuthStore } from '../../store/auth';
import { sellerService } from '../../services/api/seller.service';
import { ROUTES } from '../../constants/routes';
import {
  AVAILABLE_LANGUAGES,
  AVAILABLE_CATEGORIES,
  MAX_CATEGORIES,
  MAX_DESCRIPTION,
  getCountryOptions,
  getCountryName,
  getLanguageLabel,
  getCategoryLabel,
} from '../../constants/sellerOptions';
import {
  WizardShell,
  SectionTitle,
  SelectableChip,
  PreviewRow,
  fieldSx,
  menuProps,
  primaryBtnSx,
  ghostBtnSx,
} from './wizardChrome';

const STEPS = ['Nacionalidad e idiomas', 'Características', 'Vista previa', 'Listo'];

type StateOption = { code: string; name: string };

export default function BecomeSellerWizard() {
  const navigate = useNavigate();
  const draft = useOnboardingSellerStore();
  const switchRole = useAuthStore((s) => s.switchRole);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);

  const countryOptions = useMemo(() => getCountryOptions(), []);

  // Carga estados para un país dado (devuelve la lista)
  function loadStatesFor(countryCode: string): StateOption[] {
    if (!countryCode) return [];
    const states = State.getStatesOfCountry(countryCode) || [];
    return states.map((s) => ({ code: s.isoCode, name: s.name }));
  }

  // Precargar perfil existente (modo edición) y estados del país guardado
  useEffect(() => {
    (async () => {
      try {
        const existing = await sellerService.getMine();
        if (existing) {
          draft.setField('nationality', existing.nationality || '');
          draft.setField('state', existing.state || '');
          draft.setField('languages', existing.languages || []);
          draft.setField('collaborationSlots', existing.collaborationSlots ?? 6);
          draft.setField('salesCommission', existing.commissionPercentage ?? 20);
          draft.setField('description', existing.description || '');
          draft.setField('productCategories', existing.productCategories || []);
        }
        const country = existing?.nationality || draft.nationality;
        if (country) setStateOptions(loadStatesFor(country));
      } finally {
        setLoadingProfile(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCountryChange(code: string) {
    draft.setField('nationality', code);
    draft.setField('state', '');
    setStateOptions(loadStatesFor(code));
  }

  function toggleLanguage(code: string) {
    const has = draft.languages.includes(code);
    draft.setField(
      'languages',
      has ? draft.languages.filter((l) => l !== code) : [...draft.languages, code],
    );
  }

  function toggleCategory(value: string) {
    const has = draft.productCategories.includes(value);
    if (!has && draft.productCategories.length >= MAX_CATEGORIES) {
      toast.error(`Puedes seleccionar máximo ${MAX_CATEGORIES} categorías.`);
      return;
    }
    draft.setField(
      'productCategories',
      has
        ? draft.productCategories.filter((c) => c !== value)
        : [...draft.productCategories, value],
    );
  }

  const canContinueStep1 =
    !!draft.nationality && !!draft.state && draft.languages.length > 0;

  const canContinueStep2 =
    draft.collaborationSlots >= 1 &&
    draft.salesCommission >= 0 &&
    draft.salesCommission <= 20 &&
    draft.description.length <= MAX_DESCRIPTION &&
    draft.productCategories.length >= 1 &&
    draft.productCategories.length <= MAX_CATEGORIES;

  async function handleRegister() {
    setSubmitting(true);
    try {
      await sellerService.register({
        nationality: draft.nationality,
        state: draft.state,
        languages: draft.languages,
        collaborationSlots: draft.collaborationSlots,
        commissionPercentage: draft.salesCommission,
        description: draft.description || undefined,
        productCategories: draft.productCategories,
      });
      // Sincroniza el rol en el estado local (el backend ya lo cambió a 'vendedor')
      await switchRole('vendedor');
      toast.success('¡Ya eres vendedor!');
      draft.reset();
      setStep(3);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo completar el registro de vendedor');
    } finally {
      setSubmitting(false);
    }
  }

  const countryName = useMemo(() => getCountryName(draft.nationality), [draft.nationality]);

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8ff] dark:bg-[#070b16]">
        <CircularProgress sx={{ color: '#6850e8' }} />
      </div>
    );
  }

  return (
    <WizardShell
      badge="Programa de vendedores"
      title="Conviértete en vendedor"
      subtitle="Completa estos pasos para empezar a colaborar como vendedor."
      steps={STEPS}
      step={step}
      user={user}
    >
      {/* STEP 1 — Nacionalidad e idiomas */}
      {step === 0 && (
        <div key="s0" className="animate-wizard-rise space-y-5">
          <SectionTitle icon={Globe2}>Confirma tu nacionalidad</SectionTitle>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              select
              label="País"
              fullWidth
              value={draft.nationality}
              onChange={(e) => handleCountryChange(e.target.value)}
              required
              sx={fieldSx}
              SelectProps={{ MenuProps: menuProps }}
            >
              {countryOptions.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {stateOptions.length > 0 ? (
              <TextField
                select
                label="Estado / Provincia"
                fullWidth
                value={draft.state}
                onChange={(e) => draft.setField('state', e.target.value)}
                disabled={!draft.nationality}
                required
                sx={fieldSx}
                SelectProps={{ MenuProps: menuProps }}
              >
                {stateOptions.map((s) => (
                  <MenuItem key={s.code} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="Estado / Provincia"
                fullWidth
                value={draft.state}
                onChange={(e) => draft.setField('state', e.target.value)}
                disabled={!draft.nationality}
                required
                sx={fieldSx}
              />
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-400/10 text-primary-600 dark:text-primary-300">
                <Languages className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Idiomas que hablas
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <SelectableChip
                  key={lang.code}
                  selected={draft.languages.includes(lang.code)}
                  onClick={() => toggleLanguage(lang.code)}
                >
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span>{lang.label}</span>
                </SelectableChip>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="contained"
              onClick={() => setStep(1)}
              disabled={!canContinueStep1}
              endIcon={<ArrowRight className="h-4 w-4" />}
              sx={primaryBtnSx}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — Características */}
      {step === 1 && (
        <div key="s1" className="animate-wizard-rise space-y-5">
          <SectionTitle icon={SlidersHorizontal}>Características de tu colaboración</SectionTitle>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              type="number"
              label="Espacios de colaboración"
              fullWidth
              value={draft.collaborationSlots}
              onChange={(e) =>
                draft.setField('collaborationSlots', Math.max(1, Number(e.target.value)))
              }
              helperText="Con cuántos creadores / empresas quieres colaborar."
              inputProps={{ min: 1 }}
              sx={fieldSx}
              InputProps={{
                startAdornment: <Users className="mr-2 h-4 w-4 shrink-0 text-primary-500/80" />,
              }}
            />
            <TextField
              type="number"
              label="Comisión de ventas (%)"
              fullWidth
              value={draft.salesCommission}
              onChange={(e) => {
                const v = Number(e.target.value);
                draft.setField('salesCommission', Math.min(20, Math.max(0, v)));
              }}
              helperText="Porcentaje a recibir por venta (0–20%)."
              inputProps={{ min: 0, max: 20 }}
              sx={fieldSx}
              InputProps={{
                startAdornment: <Percent className="mr-2 h-4 w-4 shrink-0 text-primary-500/80" />,
              }}
            />
          </div>

          <TextField
            label="Descripción (opcional)"
            fullWidth
            multiline
            rows={4}
            value={draft.description}
            onChange={(e) =>
              draft.setField('description', e.target.value.slice(0, MAX_DESCRIPTION))
            }
            placeholder="Cuéntanos sobre tu experiencia, habilidades y por qué deberían contratarte."
            helperText={`${draft.description.length}/${MAX_DESCRIPTION}`}
            sx={fieldSx}
          />

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-400/10 text-primary-600 dark:text-primary-300">
                  <Tags className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Categorías de productos
                </p>
              </div>
              <span className="rounded-full bg-primary-500/10 px-2.5 py-0.5 text-xs font-semibold text-primary-600 dark:text-primary-300">
                {draft.productCategories.length}/{MAX_CATEGORIES}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {AVAILABLE_CATEGORIES.map((cat) => (
                <SelectableChip
                  key={cat.value}
                  selected={draft.productCategories.includes(cat.value)}
                  onClick={() => toggleCategory(cat.value)}
                >
                  {cat.label}
                </SelectableChip>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button onClick={() => setStep(0)} startIcon={<ArrowLeft className="h-4 w-4" />} sx={ghostBtnSx}>
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={() => setStep(2)}
              disabled={!canContinueStep2}
              endIcon={<ArrowRight className="h-4 w-4" />}
              sx={primaryBtnSx}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 — Vista previa */}
      {step === 2 && (
        <div key="s2" className="animate-wizard-rise space-y-5">
          <SectionTitle icon={Eye}>Vista previa</SectionTitle>

          <div className="space-y-3">
            <PreviewRow icon={Globe2} label="Nacionalidad">
              {countryName}
              {draft.state && ` • ${draft.state}`}
            </PreviewRow>
            <PreviewRow icon={SlidersHorizontal} label="Características">
              {draft.collaborationSlots} espacios de colaboración • {draft.salesCommission}% de comisión
            </PreviewRow>
            <PreviewRow icon={Languages} label="Idiomas">
              {draft.languages.map(getLanguageLabel).join('  ·  ')}
            </PreviewRow>
            {draft.description && (
              <PreviewRow icon={Store} label="Descripción">
                {draft.description}
              </PreviewRow>
            )}
            <PreviewRow icon={Tags} label="Categorías">
              {draft.productCategories.map(getCategoryLabel).join('  ·  ')}
            </PreviewRow>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button onClick={() => setStep(1)} startIcon={<ArrowLeft className="h-4 w-4" />} sx={ghostBtnSx}>
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={handleRegister}
              disabled={submitting}
              endIcon={!submitting && <Check className="h-4 w-4" />}
              sx={primaryBtnSx}
            >
              {submitting ? 'Guardando...' : 'Finalizar'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4 — Éxito */}
      {step === 3 && (
        <div key="s3" className="animate-wizard-rise flex flex-col items-center py-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 -z-10 animate-aurora rounded-full bg-emerald-400/30 blur-2xl" />
            <div className="flex h-20 w-20 animate-float items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_20px_50px_-12px_rgba(16,185,129,0.7)]">
              <PartyPopper className="h-9 w-9 animate-check-pop" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
            ¡Registro exitoso!
          </h2>
          <p className="mt-2 max-w-sm text-balance text-gray-500 dark:text-gray-400">
            Tu perfil de vendedor quedó guardado. Ya tienes el rol de vendedor.
          </p>
          <Button
            variant="contained"
            onClick={() => navigate(ROUTES.dashboard)}
            endIcon={<ArrowRight className="h-4 w-4" />}
            sx={{ ...primaryBtnSx, mt: 3 }}
          >
            Ir a mi panel
          </Button>
        </div>
      )}
    </WizardShell>
  );
}
