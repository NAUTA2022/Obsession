import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Bot, User, Copy, Check, RefreshCw,
  ChevronDown, Zap, MessageSquare, Target, TrendingUp,
  ShoppingBag, Heart, Clock, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

// ── Prompt templates ──────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'cold',
    label: 'Mensaje en frío',
    icon: MessageSquare,
    color: 'from-[#6850E8] to-violet-600',
    bg: 'bg-[#6850E8]/10',
    prompt: 'Escríbeme un mensaje en frío para contactar a una persona interesada en contenido fitness de Valentina López. Debe ser amigable, breve y presentar el Pack VIP de $249.900 COP con urgencia sutil.',
  },
  {
    id: 'followup',
    label: 'Seguimiento',
    icon: Clock,
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-500/10',
    prompt: 'La persona vio el Pack VIP pero no respondió hace 2 días. Escríbeme un mensaje de seguimiento que reactive su interés sin ser insistente. Que mencione escasez de cupos disponibles.',
  },
  {
    id: 'objection',
    label: 'Manejo de objeciones',
    icon: Target,
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10',
    prompt: 'El cliente dice que "está muy caro". Dame 3 respuestas diferentes para superar esa objeción y llevar la conversación al cierre. El producto es la Sesión 1:1 de $149.900 COP.',
  },
  {
    id: 'close',
    label: 'Cierre de venta',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10',
    prompt: 'El cliente está interesado en la Membresía Gold pero duda. Escríbeme el mensaje perfecto para cerrar la venta hoy, incluyendo urgencia, beneficios clave y cómo pagar fácil.',
  },
  {
    id: 'upsell',
    label: 'Upsell / Cross-sell',
    icon: ShoppingBag,
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-500/10',
    prompt: 'El cliente acaba de comprar el Pack Básico. Escríbeme un mensaje para ofrecerle el upgrade al Pack Premium con un descuento especial del 15% por ser cliente activo.',
  },
  {
    id: 'reactivate',
    label: 'Reactivar contacto',
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-500/10',
    prompt: 'Este contacto estuvo interesado hace 3 semanas pero se enfrió. Escríbeme un mensaje para reactivarlo sin parecer desesperado, mencionando algo nuevo o exclusivo de la creadora.',
  },
];

// ── AI responses mock ─────────────────────────────────────────────────────────

const AI_RESPONSES: Record<string, string> = {
  cold: `✅ **Mensaje en frío — Pack VIP Valentina López**

---

¡Hola! 👋 Te escribo porque vi que te interesa el mundo del fitness.

Soy colaborador de **Valentina López** y quería contarte algo especial: solo quedan **3 cupos** para su Pack VIP de este mes.

🔥 **¿Qué incluye?**
- Acceso exclusivo a rutinas personalizadas
- Chat directo con Valentina
- Videos y fotos en alta resolución sin restricciones

💰 **$249.900 COP** — pago con tarjeta o cripto en 2 clicks.

¿Te interesa que te envíe el link directo? Los cupos se cierran el viernes ⚡`,

  followup: `💬 **Seguimiento — 2 días después**

---

Hola de nuevo! 😊

Solo pasaba por aquí para avisarte que el Pack VIP de Valentina **ya tiene solo 1 cupo disponible** esta semana.

La semana pasada había 5, se fueron rápido 🚀

Si querías pensarlo un poco más, ahora es el momento. ¿Te ayudo a reservar el tuyo antes de que se cierre?

👉 [Link directo al pack]`,

  objection: `🎯 **3 respuestas para "está muy caro"**

---

**Opción 1 — Reencuadre de valor:**
"Entiendo que $149.900 parece bastante, pero si lo dividimos son menos de $5.000 al día por acceso exclusivo a Valentina. Una sesión de coaching personal cuesta 10 veces más 💡"

---

**Opción 2 — Comparación:**
"¿Cuánto gastas en un plan de Netflix o Spotify al mes? Con esta sesión tienes una experiencia completamente personalizada que ninguna app puede darte 🎯"

---

**Opción 3 — Urgencia + escasez:**
"Totalmente válido. Lo que puedo hacer es reservarte el cupo hoy a ese precio — la próxima vez que salga este servicio va a costar más. ¿Lo bloqueamos? 🔒"`,

  close: `🏆 **Cierre de venta — Membresía Gold**

---

Hola! Me alegra que estés considerando la **Membresía Gold** 🌟

Te resumo por qué hoy es el mejor momento:

✅ **Beneficios que estás a punto de perderte:**
- Acceso inmediato a TODO el contenido
- Descuento exclusivo del 20% en sesiones adicionales
- Chat prioritario con respuesta en menos de 24h

⏰ **Solo hoy:** el precio especial de lanzamiento cierra esta noche.

👇 **Pagar es súper fácil:**
1. Click en el link
2. Tarjeta o cripto (2 minutos)
3. Acceso instantáneo

¿Te mando el link ahora? 🚀`,

  upsell: `⬆️ **Upsell — Pack Premium**

---

¡Hola! Que bueno que ya eres parte de la comunidad 🎉

Quería avisarte de algo especial: por ser cliente activo, tienes acceso a un upgrade exclusivo al **Pack Premium** con **15% OFF**.

**¿Qué ganas con el upgrade?**
🎥 +200 contenidos adicionales
📞 Sesión de bienvenida personalizada
🔓 Acceso anticipado a lanzamientos

**Precio especial para ti:** ~~$189.000~~ → **$160.650 COP**

Esta oferta vence en 48h ⏰ ¿Te interesa?`,

  reactivate: `💫 **Reactivar contacto frío**

---

¡Hola! Espero que estés bien 😊

Te escribo porque Valentina acaba de lanzar algo que creo que te puede interesar mucho: **contenido completamente nuevo** que no había publicado antes.

🆕 **Lo nuevo:**
- Serie exclusiva de [categoría relevante]
- Disponible solo esta semana para contactos anteriores
- Precio especial de preventa

Pensé en ti cuando lo vi porque antes mostrabas interés. ¿Quieres que te cuente más? 👀`,
};

const DEFAULT_RESPONSES = [
  'Entendido. Voy a generar el script de venta optimizado para este contexto...\n\n**Script generado:**\n\nHola [nombre]! Me alegra contactarte. Tengo algo especial que me gustaría compartirte sobre [producto]. Basado en tus intereses, creo que esto puede ser exactamente lo que buscas...\n\n*¿Quieres que lo adapte para un tono más formal o más casual?*',
  'Perfecto, aquí tienes una respuesta optimizada para esa situación:\n\n---\n\nEl mensaje clave es crear valor primero antes de presentar la oferta. Te sugiero este enfoque:\n\n1. **Conectar emocionalmente** — Menciona algo personal relevante\n2. **Presentar el beneficio** — No el producto, sino la transformación\n3. **CTA claro** — Una sola acción concreta\n\n¿Quieres que genere el mensaje completo?',
];

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === 'ai';

  const copy = () => {
    navigator.clipboard.writeText(msg.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown-ish renderer
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-gray-900 dark:text-white/90">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('---')) {
        return <hr key={i} className="border-gray-100 dark:border-white/[0.06] my-1" />;
      }
      if (line.startsWith('# ')) {
        return <p key={i} className="font-black text-base text-gray-900 dark:text-white">{line.slice(2)}</p>;
      }
      // Bold inline
      const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className={line === '' ? 'h-2' : ''}>
          {boldParts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isAI
          ? 'bg-gradient-to-br from-[#6850E8] to-violet-600 text-white'
          : 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40'
      }`}>
        {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      <div className={`flex-1 max-w-[80%] ${isAI ? '' : 'flex flex-col items-end'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-0.5 ${
          isAI
            ? 'bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] text-gray-700 dark:text-white/70'
            : 'bg-[#6850E8] text-white'
        }`}>
          {renderText(msg.text)}
        </div>

        {/* Actions */}
        {isAI && (
          <div className="flex items-center gap-2 mt-1.5 px-1">
            <button
              onClick={copy}
              className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 dark:text-white/25 hover:text-[#6850E8] dark:hover:text-[#9277F5] transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <span className="text-gray-200 dark:text-white/10">·</span>
            <span className="text-[10px] text-gray-300 dark:text-white/20">
              {msg.timestamp.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SellerAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: '¡Hola! Soy tu asistente de ventas IA 🤖✨\n\nEstoy entrenado para ayudarte a:\n\n**📝 Crear scripts de venta** personalizados para cada etapa del funnel\n**💬 Redactar mensajes** en frío, seguimientos y cierres\n**🎯 Manejar objeciones** con respuestas que convierten\n**⬆️ Generar upsells** y reactivar contactos fríos\n\nUsa las plantillas rápidas de abajo o escribe tu pregunta. ¿En qué te ayudo hoy?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const templateId = TEMPLATES.find(t => t.prompt === text)?.id;
      const response = templateId
        ? AI_RESPONSES[templateId]
        : DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];

      const aiMsg: Message = { id: `ai_${Date.now()}`, role: 'ai', text: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 1200 + Math.random() * 800);
  };

  const clearChat = () => {
    setMessages(messages.slice(0, 1));
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111118]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6850E8] to-violet-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-gray-900 dark:text-white">IA Comercial</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-gray-400 dark:text-white/35">Asistente de ventas activo</p>
              </div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 bg-gray-100 dark:bg-white/[0.04] rounded-xl hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Nuevo chat
          </button>
        </div>
      </div>

      {/* Templates */}
      <div className="shrink-0 px-5 py-3 border-b border-gray-100 dark:border-white/[0.06]">
        <p className="text-[10px] font-bold text-gray-400 dark:text-white/25 uppercase tracking-wider mb-2">Plantillas rápidas</p>
        <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-0 pb-0.5">
          {TEMPLATES.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => sendMessage(t.prompt)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${t.bg} hover:opacity-90 disabled:opacity-40`}
              >
                <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700 dark:text-white/60">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6850E8] to-violet-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-[#6850E8]/40"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-5 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111118]">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Describe la situación o pide un script de venta..."
              rows={1}
              className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl text-gray-700 dark:text-white/70 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all resize-none"
              style={{ maxHeight: 120 }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl bg-[#6850E8] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#5a44d4] transition-colors shadow-sm flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        <p className="text-[10px] text-gray-300 dark:text-white/15 mt-2 text-center">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
