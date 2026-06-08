import React, { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import {
  Bot,
  Save,
  ChevronDown,
  IdCard,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  Languages,
  Drama,
  Zap,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Collapse,
  Divider,
} from '@mui/material';
import toast from 'react-hot-toast';
import type { BotConfig } from '../../services/api/bot.service';

const TONE_OPTIONS = [
  { value: 'informal', label: 'Informal' },
  { value: 'sensual', label: 'Sensual' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'amigable', label: 'Amigable' },
];

const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
];

const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'box-shadow .2s ease',
    '&:hover fieldset': { borderColor: '#977dfb' },
    '&.Mui-focused fieldset': { borderColor: '#6850e8', borderWidth: '2px' },
    '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(104,80,232,0.14)' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#6850e8' },
};

// Encabezado de sección con chip de icono morado.
function Section({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/15 to-primary-400/10 text-primary-600 ring-1 ring-primary-500/20 dark:text-primary-300">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{title}</span>
        {hint && <span className="text-xs text-gray-400">· {hint}</span>}
      </div>
      {children}
    </div>
  );
}

interface TagInputProps {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  maxItems: number;
}

function TagInput({ value, onChange, placeholder, maxItems }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTags = (raw: string) => {
    const tags = raw.split(',').map((t) => t.trim()).filter(Boolean);
    const newTags = [...value];
    for (const tag of tags) {
      if (tag && !newTags.includes(tag) && newTags.length < maxItems) {
        newTags.push(tag);
      }
    }
    onChange(newTags);
    setInput('');
  };

  return (
    <div>
      <TextField
        size="small"
        fullWidth
        placeholder={`${placeholder} (Enter o coma para agregar)`}
        value={input}
        onChange={(e) => {
          const val = e.target.value;
          if (val.endsWith(',')) {
            addTags(val.slice(0, -1));
          } else {
            setInput(val);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); addTags(input); }
        }}
        onBlur={() => { if (input.trim()) addTags(input); }}
        disabled={value.length >= maxItems}
        sx={INPUT_SX}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onDelete={() => onChange(value.filter((t) => t !== tag))}
              sx={{
                borderRadius: '8px',
                bgcolor: '#ece8ff',
                color: '#4a2cb4',
                fontWeight: 500,
                '& .MuiChip-deleteIcon': { color: '#7c5cf0', '&:hover': { color: '#4a2cb4' } },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Vista previa de chat en vivo — refleja la configuración mientras se edita.
   ─────────────────────────────────────────────────────────────────────── */
interface PreviewState {
  characterName: string;
  tone: string;
  language: string;
  personality: string[];
  catchphrases: string[];
  priceHandlingInstructions: string;
  avoidTopics: string[];
  autoPilot: boolean;
}

const SAMPLE_QUESTIONS = [
  'Hola 🙈 ¿qué tienes para mí?',
  '¿Cuánto cuesta tu contenido?',
  '¿Qué planes hay para hoy?',
];

function greetByTone(tone: string) {
  switch (tone) {
    case 'sensual':
      return 'Hola, cariño 😏';
    case 'profesional':
      return 'Hola, un gusto saludarte.';
    case 'amigable':
      return '¡Holaa! Qué alegría verte 😊';
    case 'informal':
      return '¡Eyy! 👋';
    default:
      return '¡Hola! 👋';
  }
}

function buildReply(question: string, s: PreviewState) {
  const greet = greetByTone(s.tone);
  if (/precio|cuesta|cu[aá]nto|vale/i.test(question)) {
    return s.priceHandlingInstructions
      ? `${greet} Mejor déjame mostrarte lo que tengo y tú decides 😏🔒`
      : `${greet} Te paso los detalles enseguida 💜`;
  }
  const phrase = s.catchphrases[0] ? ` ${s.catchphrases[0]}.` : '';
  const traits = s.personality.length ? ` Soy ${s.personality.slice(0, 2).join(' y ')}.` : '';
  return `${greet}${phrase}${traits} ¿En qué te consiento hoy?`;
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function LivePreview(s: PreviewState) {
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]);
  const [typing, setTyping] = useState(false);

  // Simula "escribiendo..." cada vez que cambia la pregunta o la config relevante.
  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, s.tone, s.characterName, s.personality.join(','), s.catchphrases.join(','), s.priceHandlingInstructions]);

  const name = s.characterName.trim() || 'Tu asistente';
  const initial = s.characterName.trim().charAt(0).toUpperCase();
  const toneLabel = TONE_OPTIONS.find((o) => o.value === s.tone)?.label;
  const langLabel = LANGUAGE_OPTIONS.find((o) => o.value === s.language)?.label;
  const reply = buildReply(question, s);

  return (
    <div className="lg:sticky lg:top-6">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary-500" />
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Vista previa</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          en vivo
        </span>
      </div>

      {/* Ventana de chat */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-gray-950">
        {/* Cabecera del chat */}
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-primary-600 to-primary-400 px-4 py-3 dark:border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-base font-bold text-white ring-2 ring-white/40 backdrop-blur-sm">
            {initial || <Bot className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="text-[0.7rem] text-white/80">
              {s.autoPilot ? 'En línea · responde sola' : 'IA en pausa'}
            </p>
          </div>
        </div>

        {/* Badges de config */}
        {(toneLabel || langLabel) && (
          <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5 dark:border-white/5">
            {toneLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-primary-700 dark:text-primary-300">
                <Drama className="h-3 w-3" /> {toneLabel}
              </span>
            )}
            {langLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-primary-700 dark:text-primary-300">
                <Languages className="h-3 w-3" /> {langLabel}
              </span>
            )}
            {s.autoPilot && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-emerald-600 dark:text-emerald-400">
                <Zap className="h-3 w-3" /> Piloto automático
              </span>
            )}
          </div>
        )}

        {/* Mensajes */}
        <div className="flex flex-col gap-3 bg-gray-50/70 px-4 py-5 dark:bg-white/[0.02]">
          {/* Mensaje del usuario */}
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary-600 px-3.5 py-2 text-sm text-white shadow-sm">
              {question}
            </div>
          </div>
          {/* Respuesta del bot */}
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-gray-100 bg-white px-3.5 py-2 text-sm text-gray-800 shadow-sm dark:border-white/10 dark:bg-gray-900 dark:text-gray-100">
              {typing ? <TypingDots /> : reply}
            </div>
          </div>
        </div>

        {/* Preguntas de ejemplo (interactivo) */}
        <div className="border-t border-gray-100 px-4 py-3 dark:border-white/5">
          <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-wide text-gray-400">
            Prueba una pregunta
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_QUESTIONS.map((q) => {
              const active = q === question;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuestion(q)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-all ${
                    active
                      ? 'border-transparent bg-primary-600 text-white shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700 dark:border-white/10 dark:text-gray-300'
                  }`}
                >
                  {q.length > 26 ? `${q.slice(0, 26)}…` : q}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {s.avoidTopics.length > 0 && (
        <div className="mt-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400">
          <span className="font-semibold">Nunca habla de:</span> {s.avoidTopics.join(' · ')}
        </div>
      )}
    </div>
  );
}

interface BotConfigPanelProps {
  creatorId?: string;
  creatorUsername?: string;
  initialConfig?: Partial<BotConfig>;
  onSaveConfig: (config: Partial<BotConfig>) => Promise<void>;
}

export const BotConfigPanel: React.FC<BotConfigPanelProps> = ({ initialConfig, onSaveConfig }) => {
  const [autoPilot, setAutoPilot] = useState(initialConfig?.autoPilot ?? false);
  const [characterName, setCharacterName] = useState(initialConfig?.characterName ?? '');
  const [personality, setPersonality] = useState<string[]>(initialConfig?.personality ?? []);
  const [tone, setTone] = useState(initialConfig?.tone ?? '');
  const [language, setLanguage] = useState(initialConfig?.language ?? '');
  const [catchphrases, setCatchphrases] = useState<string[]>(initialConfig?.catchphrases ?? []);
  const [avoidTopics, setAvoidTopics] = useState<string[]>(initialConfig?.avoidTopics ?? []);
  const [priceHandlingInstructions, setPriceHandlingInstructions] = useState(initialConfig?.priceHandlingInstructions ?? '');
  const [useProfileBio, setUseProfileBio] = useState(initialConfig?.useProfileBio ?? false);
  const [extraInstructions, setExtraInstructions] = useState(
    initialConfig?.extraInstructions ?? initialConfig?.systemPrompt ?? ''
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!initialConfig) return;
    setAutoPilot(initialConfig.autoPilot ?? false);
    setCharacterName(initialConfig.characterName ?? '');
    setPersonality(initialConfig.personality ?? []);
    setTone(initialConfig.tone ?? '');
    setLanguage(initialConfig.language ?? '');
    setCatchphrases(initialConfig.catchphrases ?? []);
    setAvoidTopics(initialConfig.avoidTopics ?? []);
    setPriceHandlingInstructions(initialConfig.priceHandlingInstructions ?? '');
    setUseProfileBio(initialConfig.useProfileBio ?? false);
    setExtraInstructions(initialConfig.extraInstructions ?? initialConfig.systemPrompt ?? '');
  }, [initialConfig]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSaveConfig({
        autoPilot,
        characterName: characterName.trim() || null,
        personality: personality.length > 0 ? personality : null,
        tone: tone || null,
        language: language || null,
        catchphrases: catchphrases.length > 0 ? catchphrases : null,
        avoidTopics: avoidTopics.length > 0 ? avoidTopics : null,
        priceHandlingInstructions: priceHandlingInstructions.trim() || null,
        useProfileBio,
        extraInstructions: extraInstructions.trim() || null,
      });
      toast.success('Configuración de IA guardada 🤖');
    } catch {
      toast.error('Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <CardHeader
        className="border-b border-gray-100/50 bg-gradient-to-r from-primary-50 to-primary-100/40 px-6 py-5 dark:border-gray-800 dark:from-primary-900/15 dark:to-primary-900/5 sm:px-8"
        title={
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl text-white shadow-lg ${autoPilot ? 'bg-gradient-to-tr from-green-400 to-emerald-600 shadow-green-500/20' : 'bg-gradient-to-tr from-gray-400 to-gray-500 shadow-gray-500/20'}`}>
              <Bot size={26} />
            </div>
            <div>
              <Typography variant="h6" className="font-bold text-gray-800 dark:text-gray-100 leading-tight">
                Asistente Virtual IA
              </Typography>
              <Typography variant="caption" className="text-gray-500 dark:text-gray-400 font-medium">
                Responde en piloto automático
              </Typography>
            </div>
          </div>
        }
        action={
          <FormControlLabel
            control={<Switch checked={autoPilot} onChange={(e) => setAutoPilot(e.target.checked)} color="success" />}
            label={
              <span className={`font-bold text-sm tracking-wide uppercase ${autoPilot ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                {autoPilot ? 'Activo' : 'Inactivo'}
              </span>
            }
            labelPlacement="start"
            className="mr-4 mt-3 px-4 py-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-800"
          />
        }
      />

      <CardContent className="px-6 pb-10 pt-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          {/* ── Columna izquierda: formulario ── */}
          <div className="space-y-7">
            {/* Sección 1: Identidad */}
            <Section icon={IdCard} title="Identidad del Bot">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre del personaje"
                  placeholder="Ej: Andy"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  sx={INPUT_SX}
                />
                <FormControl size="small" fullWidth sx={INPUT_SX}>
                  <InputLabel>Tono</InputLabel>
                  <Select
                    value={tone}
                    label="Tono"
                    onChange={(e) => setTone(e.target.value)}
                    sx={{ borderRadius: '12px' }}
                    MenuProps={{ style: { zIndex: 99999 } }}
                  >
                    <MenuItem value=""><em>Sin definir</em></MenuItem>
                    {TONE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={INPUT_SX}>
                  <InputLabel>Idioma</InputLabel>
                  <Select
                    value={language}
                    label="Idioma"
                    onChange={(e) => setLanguage(e.target.value)}
                    sx={{ borderRadius: '12px' }}
                    MenuProps={{ style: { zIndex: 99999 } }}
                  >
                    <MenuItem value=""><em>Sin definir</em></MenuItem>
                    {LANGUAGE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </div>
            </Section>

            <Divider />

            {/* Sección 2: Personalidad */}
            <Section icon={Sparkles} title="Personalidad">
              <div className="space-y-4">
                <div>
                  <Typography variant="caption" className="text-gray-500 block mb-1.5">
                    Rasgos de personalidad <span className="text-gray-400">({personality.length}/10)</span>
                  </Typography>
                  <TagInput value={personality} onChange={setPersonality} placeholder="Ej: coqueta, directa, misteriosa" maxItems={10} />
                </div>
                <div>
                  <Typography variant="caption" className="text-gray-500 block mb-1.5">
                    Frases características <span className="text-gray-400">({catchphrases.length}/20)</span>
                  </Typography>
                  <TagInput value={catchphrases} onChange={setCatchphrases} placeholder="Ej: papi, lo mejor está aquí" maxItems={20} />
                </div>
              </div>
            </Section>

            <Divider />

            {/* Sección 3: Restricciones */}
            <Section icon={ShieldAlert} title="Restricciones">
              <div className="space-y-4">
                <div>
                  <Typography variant="caption" className="text-gray-500 block mb-1.5">
                    Temas a evitar <span className="text-gray-400">({avoidTopics.length}/20)</span>
                  </Typography>
                  <TagInput value={avoidTopics} onChange={setAvoidTopics} placeholder="Ej: redes sociales, número de teléfono" maxItems={20} />
                </div>
                <div>
                  <Typography variant="caption" className="text-gray-500 block mb-1.5">
                    Cómo manejar preguntas de precios
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    placeholder="Ej: Siempre redirige al producto bloqueado, nunca digas precios exactos"
                    value={priceHandlingInstructions}
                    onChange={(e) => setPriceHandlingInstructions(e.target.value)}
                    sx={INPUT_SX}
                  />
                </div>
              </div>
            </Section>

            <Divider />

            {/* Sección 4: Contexto del perfil */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
              <div>
                <Typography variant="body2" className="font-semibold text-gray-700 dark:text-gray-300">
                  Usar bio del perfil automáticamente
                </Typography>
                <Typography variant="caption" className="text-gray-400">
                  Incluye tu bio y tipo de contenido como contexto del bot
                </Typography>
              </div>
              <Switch checked={useProfileBio} onChange={(e) => setUseProfileBio(e.target.checked)} color="primary" />
            </div>

            {/* Sección 5: Instrucciones avanzadas (colapsable) */}
            <div>
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700"
              >
                <ChevronDown size={16} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                Instrucciones adicionales (avanzado)
              </button>
              <Collapse in={showAdvanced}>
                <div className="mt-3">
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Instrucciones extra para el modelo. Aquí puedes escribir texto libre para casos específicos que no cubre el formulario."
                    value={extraInstructions}
                    onChange={(e) => setExtraInstructions(e.target.value)}
                    sx={INPUT_SX}
                  />
                  <Typography variant="caption" className="text-gray-400 block mt-2">
                    Este campo complementa la configuración estructurada de arriba, no la reemplaza.
                  </Typography>
                </div>
              </Collapse>
            </div>

            {/* Botón guardar */}
            <div className="flex justify-end pt-2">
              <Button
                variant="contained"
                disabled={isSaving}
                onClick={handleSave}
                startIcon={<Save size={20} />}
                className="!rounded-full !bg-gradient-to-r !from-primary-600 !to-primary-400 !px-8 !py-3 !font-bold !text-white !shadow-lg transition-all hover:!shadow-primary-500/40"
                sx={{ textTransform: 'none', boxShadow: '0 12px 30px -10px rgba(104,80,232,0.7)' }}
              >
                {isSaving ? 'Guardando...' : 'Guardar y Entrenar IA'}
              </Button>
            </div>
          </div>

          {/* ── Columna derecha: vista previa en vivo ── */}
          <LivePreview
            characterName={characterName}
            tone={tone}
            language={language}
            personality={personality}
            catchphrases={catchphrases}
            priceHandlingInstructions={priceHandlingInstructions}
            avoidTopics={avoidTopics}
            autoPilot={autoPilot}
          />
        </div>
      </CardContent>
    </Card>
  );
};
