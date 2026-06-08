import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, MenuItem } from '@mui/material';
import {
  UserCircle2,
  BadgeCheck,
  MapPin,
  Phone,
  FileText,
  Camera,
  Upload,
  Loader2,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useOnboardingCreatorStore } from '../../store/onboardingCreator';
import { useAuthStore } from '../../store/auth';
import { profileService } from '../../services/api/profile.service';
import { ROUTES } from '../../constants/routes';
import {
  WizardShell,
  SectionTitle,
  PreviewRow,
  fieldSx,
  menuProps,
  primaryBtnSx,
  ghostBtnSx,
} from './wizardChrome';

const STEPS = ['Perfil público', 'Confirmación'];

const CONTENT_TYPES = ['Fitness', 'Lifestyle', 'Moda', 'Belleza', 'Música', 'Coaching', 'Otros'];

export default function BecomeCreatorWizard() {
  const navigate = useNavigate();
  const draft = useOnboardingCreatorStore();
  const switchRole = useAuthStore((s) => s.switchRole);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);
  const [activating, setActivating] = useState(false);

  // Foto de perfil
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const avatarSrc = photoPreview || draft.profilePictureUrl || '';

  // Step 1 — guardar perfil
  async function handleSaveProfileAndContinue() {
    if (!draft.displayName.trim()) {
      toast.error('El nombre público es obligatorio');
      return;
    }
    setSavingProfile(true);
    try {
      await profileService.updateProfile({
        displayName: draft.displayName,
        bio: draft.bio,
        location: draft.location,
        contentType: draft.contentType,
        ...(draft.profilePictureUrl ? { profilePicture: draft.profilePictureUrl } : {}),
      });
      toast.success('Perfil guardado');
      setStep(1);
    } catch (e) {
      toast.error('No se pudo guardar el perfil');
    } finally {
      setSavingProfile(false);
    }
  }

  // Sube la foto desde el dispositivo (mismo patrón que el apartado de Perfil)
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview inmediato
    const blob = URL.createObjectURL(file);
    setPhotoPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return blob;
    });
    setUploadingPhoto(true);
    try {
      const res = await profileService.updateProfilePicture(file);
      const url = res.data?.profilePictureUrl;
      if (url) draft.setField('profilePictureUrl', url);
      toast.success('Foto de perfil actualizada');
    } catch {
      toast.error('No se pudo subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  }

  // Step 2 — activar cuenta de creadora
  // La notificación "configura tus planes de llamada" la dispara el
  // NotificationsProvider al detectar la transición de rol → creadora.
  async function handleActivate() {
    setActivating(true);
    try {
      await switchRole('creator');
      toast.success('¡Cuenta de creadora activada!');
      draft.reset();
      navigate(ROUTES['creator-dashboard']);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo activar la cuenta');
    } finally {
      setActivating(false);
    }
  }

  return (
    <WizardShell
      badge="Programa de creadoras"
      title="Conviértete en creadora"
      subtitle="Configura tu perfil público y activa tu cuenta en dos pasos."
      steps={STEPS}
      step={step}
      user={user}
    >
      {/* STEP 1 — Perfil */}
      {step === 0 && (
        <div key="s0" className="animate-wizard-rise space-y-5">
          <SectionTitle icon={UserCircle2}>Tu perfil público</SectionTitle>

          {/* Foto de perfil — subida desde el dispositivo, con colores de marca */}
          <div className="flex items-center gap-5 rounded-2xl bg-gradient-to-br from-primary-500/[0.09] to-primary-400/[0.03] p-4 dark:from-primary-500/10 dark:to-transparent">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Subir foto de perfil"
              className="group relative h-20 w-20 shrink-0 rounded-2xl outline-none"
            >
              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-400/10 transition group-hover:from-primary-500/30 group-hover:to-primary-400/20 group-focus-visible:ring-2 group-focus-visible:ring-primary-500 group-focus-visible:ring-offset-2">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-7 w-7 text-primary-500/80" />
                )}
              </span>
              {/* Insignia de cámara */}
              <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-[0_8px_20px_-6px_rgba(104,80,232,0.8)] ring-2 ring-white transition group-hover:bg-primary-700 dark:ring-gray-900">
                {uploadingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </span>
            </button>

            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-gray-900 dark:text-white">
                {draft.displayName || 'Tu nombre público'}
              </p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                {draft.contentType || 'Tipo de contenido'}
                {draft.location && ` • ${draft.location}`}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
              >
                <Upload className="h-3.5 w-3.5" />
                {avatarSrc ? 'Cambiar foto' : 'Subir foto de perfil'}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <TextField
            label="Nombre público"
            fullWidth
            value={draft.displayName}
            onChange={(e) => draft.setField('displayName', e.target.value)}
            required
            sx={fieldSx}
          />
          <TextField
            label="Bio"
            fullWidth
            multiline
            rows={3}
            value={draft.bio}
            onChange={(e) => draft.setField('bio', e.target.value)}
            sx={fieldSx}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Ubicación"
              fullWidth
              value={draft.location}
              onChange={(e) => draft.setField('location', e.target.value)}
              sx={fieldSx}
              InputProps={{
                startAdornment: <MapPin className="mr-2 h-4 w-4 shrink-0 text-primary-500/80" />,
              }}
            />
            <TextField
              select
              label="Tipo de contenido"
              fullWidth
              value={draft.contentType}
              onChange={(e) => draft.setField('contentType', e.target.value)}
              sx={fieldSx}
              SelectProps={{ MenuProps: menuProps }}
            >
              {CONTENT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="contained"
              onClick={handleSaveProfileAndContinue}
              disabled={savingProfile}
              endIcon={!savingProfile && <ArrowRight className="h-4 w-4" />}
              sx={primaryBtnSx}
            >
              {savingProfile ? 'Guardando...' : 'Continuar'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — Confirmación */}
      {step === 1 && (
        <div key="s1" className="animate-wizard-rise space-y-5">
          <SectionTitle icon={BadgeCheck}>Confirma y activa</SectionTitle>

          <div className="space-y-3">
            <PreviewRow icon={UserCircle2} label="Perfil">
              {draft.displayName}
              {draft.location && ` • ${draft.location}`}
              {draft.contentType && ` • ${draft.contentType}`}
            </PreviewRow>
            {draft.bio && (
              <PreviewRow icon={FileText} label="Bio">
                {draft.bio}
              </PreviewRow>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-primary-500/[0.07] p-4 text-sm text-gray-600 dark:bg-primary-500/10 dark:text-gray-300">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-500/15 text-primary-500">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <p>
              Después de activar tu cuenta podrás configurar tus planes de llamada y disponibilidad.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button onClick={() => setStep(0)} startIcon={<ArrowLeft className="h-4 w-4" />} sx={ghostBtnSx}>
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={handleActivate}
              disabled={activating}
              endIcon={!activating && <BadgeCheck className="h-4 w-4" />}
              sx={primaryBtnSx}
            >
              {activating ? 'Activando...' : 'Activar mi cuenta de creadora'}
            </Button>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
