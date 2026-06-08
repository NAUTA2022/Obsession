import { useState } from 'react';
import type { ContactTableProps, DealStage } from '../../types/contacts';
import Avatar from './Avatar';
import Checkbox from './Checkbox';
import StatusBadge from './StatusBadge';
import {
  ChevronDown, MessageSquare, ShoppingBag, Tag, Pencil, Trash2, Check, X,
} from 'lucide-react';

const STATUSES: Array<'Pendiente' | 'Aprobado' | 'Rechazado'> = ['Pendiente', 'Aprobado', 'Rechazado'];

const DEAL_STAGES: Array<{ value: DealStage; label: string; pill: string }> = [
  { value: 'selection',     label: 'Selección',         pill: 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40' },
  { value: 'proposal',      label: 'Propuesta enviada', pill: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { value: 'negotiation',   label: 'En negociación',    pill: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { value: 'review',        label: 'En revisión',       pill: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { value: 'closing-green', label: 'Cierre exitoso',    pill: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { value: 'closing-red',   label: 'Cierre perdido',    pill: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' },
  { value: 'delivery',      label: 'Seguimiento',       pill: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
];

function DealStageBadge({
  dealId, stage, onChange,
}: {
  dealId?: string | null;
  stage?: DealStage | null;
  onChange: (dealId: string, stage: DealStage) => void;
}) {
  if (!dealId) return <span className="text-xs text-gray-300 dark:text-white/15">—</span>;
  const current = DEAL_STAGES.find(s => s.value === stage) ?? DEAL_STAGES[0];
  return (
    <div className="relative inline-flex">
      <select
        value={current.value}
        onChange={e => onChange(dealId, e.target.value as DealStage)}
        className={`appearance-none text-[11px] font-semibold pl-2.5 pr-6 py-1 rounded-full cursor-pointer outline-none transition-colors ${current.pill}`}
      >
        {DEAL_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
    </div>
  );
}

function InlineNote({
  note, contactId, onSave,
}: {
  note: string;
  contactId: string;
  onSave: (id: string, note: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(note);

  const save = () => {
    onSave(contactId, value);
    setEditing(false);
  };

  const cancel = () => {
    setValue(note);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          className="flex-1 min-w-0 text-xs bg-white dark:bg-white/[0.05] border border-[#6850E8]/30 rounded-lg px-2.5 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6850E8]/20"
          placeholder="Añadir nota..."
        />
        <button onClick={save} className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 flex-shrink-0">
          <Check className="w-3 h-3" />
        </button>
        <button onClick={cancel} className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.05] text-gray-400 dark:text-white/25 hover:bg-gray-200 dark:hover:bg-white/[0.08] flex-shrink-0">
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group/note flex items-center gap-1.5 max-w-full text-left hover:bg-gray-50 dark:hover:bg-white/[0.03] rounded-lg px-1.5 py-1 -mx-1.5 transition-colors"
    >
      <span className="text-xs text-gray-400 dark:text-white/30 truncate max-w-[180px]">
        {note || <span className="italic text-gray-300 dark:text-white/15">Sin nota</span>}
      </span>
      <Pencil className="w-3 h-3 text-gray-300 dark:text-white/15 flex-shrink-0 opacity-0 group-hover/note:opacity-100 transition-opacity" />
    </button>
  );
}

function ActionBtn({
  onClick, title, icon: Icon, className,
}: {
  onClick: () => void;
  title: string;
  icon: React.ElementType;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

export default function ContactTable({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onEdit,
  onDelete,
  onStatusChange,
  onDealStageChange,
  onNoteChange,
  onChat,
  onViewProducts,
  onSendCoupon,
}: ContactTableProps) {
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;

  const cycleStatus = (id: string, current: string) => {
    const idx = STATUSES.indexOf(current as 'Pendiente' | 'Aprobado' | 'Rechazado');
    const next = STATUSES[(idx + 1) % STATUSES.length];
    onStatusChange(id, next);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/60 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.04]">
            <tr>
              <th className="pl-4 pr-2 py-3 text-[11px] font-semibold text-gray-300 dark:text-white/20 w-8">#</th>
              <th className="px-2 py-3 w-8">
                <Checkbox checked={allSelected} onChange={onSelectAll} className="rounded" />
              </th>
              {['Nombre', 'Correo', 'Teléfono', 'Compras', 'Nota', 'Estado', 'Categorización', 'Acciones'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-white/25 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
            {contacts.map((contact, index) => (
              <tr key={contact.id} className="group hover:bg-gray-50/40 dark:hover:bg-white/[0.015] transition-colors">
                {/* # */}
                <td className="pl-4 pr-2 py-3.5 text-[11px] text-gray-300 dark:text-white/15 font-mono w-8 text-right">
                  {(index + 1).toString().padStart(2, '0')}
                </td>
                {/* Checkbox */}
                <td className="px-2 py-3.5 w-8">
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => onSelectContact(contact.id)}
                    className="rounded"
                  />
                </td>
                {/* Nombre */}
                <td className="px-3 py-3.5 min-w-[160px]">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={contact.avatar} alt={contact.name} fallback={contact.name.charAt(0)} size={32} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">{contact.name}</p>
                      {contact.source && (
                        <span className="text-[10px] text-gray-300 dark:text-white/20 capitalize">{contact.source}</span>
                      )}
                    </div>
                  </div>
                </td>
                {/* Correo */}
                <td className="px-3 py-3.5 min-w-[160px]">
                  {contact.email
                    ? <a href={`mailto:${contact.email}`} className="text-xs text-gray-500 dark:text-white/40 hover:text-[#6850E8] transition-colors truncate block">{contact.email}</a>
                    : <span className="text-xs text-gray-200 dark:text-white/15">—</span>}
                </td>
                {/* Teléfono */}
                <td className="px-3 py-3.5 min-w-[130px]">
                  {contact.phoneNumber
                    ? <a href={`tel:${contact.phoneNumber}`} className="text-xs text-gray-500 dark:text-white/40 hover:text-[#6850E8] transition-colors">{contact.phoneNumber}</a>
                    : <span className="text-xs text-gray-200 dark:text-white/15">—</span>}
                </td>
                {/* Compras */}
                <td className="px-3 py-3.5 w-20">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold ${
                    contact.purchases > 0
                      ? 'bg-[#6850E8]/10 text-[#6850E8]'
                      : 'bg-gray-100 dark:bg-white/[0.04] text-gray-300 dark:text-white/20'
                  }`}>
                    {contact.purchases}
                  </span>
                </td>
                {/* Nota editable */}
                <td className="px-3 py-3.5 min-w-[180px] max-w-[220px]">
                  <InlineNote note={contact.note || ''} contactId={contact.id} onSave={onNoteChange} />
                </td>
                {/* Estado */}
                <td className="px-3 py-3.5 w-32">
                  <button
                    title="Clic para cambiar estado"
                    onClick={() => cycleStatus(contact.id, contact.status)}
                    className="hover:opacity-75 transition-opacity"
                  >
                    <StatusBadge status={contact.status} />
                  </button>
                </td>
                {/* Categorización */}
                <td className="px-3 py-3.5 min-w-[150px]">
                  <DealStageBadge dealId={contact.dealId} stage={contact.dealStage} onChange={onDealStageChange} />
                </td>
                {/* Acciones */}
                <td className="px-3 py-3.5 w-44">
                  <div className="flex items-center gap-1">
                    <ActionBtn onClick={() => onChat(contact.id)} title="Ir al chat" icon={MessageSquare}
                      className="text-[#6850E8] bg-[#6850E8]/10 hover:bg-[#6850E8]/20" />
                    <ActionBtn onClick={() => onViewProducts(contact.id)} title="Ver compras" icon={ShoppingBag}
                      className="text-blue-500 bg-blue-500/10 hover:bg-blue-500/20" />
                    <ActionBtn onClick={() => onSendCoupon(contact.id)} title="Enviar cupón" icon={Tag}
                      className="text-amber-500 bg-amber-500/10 hover:bg-amber-500/20" />
                    <ActionBtn onClick={() => onEdit(contact.id)} title="Editar contacto" icon={Pencil}
                      className="text-gray-400 dark:text-white/25 bg-gray-100 dark:bg-white/[0.04] hover:bg-gray-200 dark:hover:bg-white/[0.08]" />
                    <ActionBtn onClick={() => onDelete(contact.id)} title="Eliminar" icon={Trash2}
                      className="text-red-400 bg-red-500/10 hover:bg-red-500/20" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden divide-y divide-gray-50 dark:divide-white/[0.04]">
        {contacts.map((contact, index) => (
          <div key={contact.id} className="px-4 py-4 hover:bg-gray-50/40 dark:hover:bg-white/[0.015] transition-colors">
            {/* Row 1: checkbox + avatar + name + status */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-[10px] text-gray-300 dark:text-white/15 font-mono w-4 text-right flex-shrink-0">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <Checkbox
                checked={selectedContacts.includes(contact.id)}
                onChange={() => onSelectContact(contact.id)}
                className="rounded flex-shrink-0"
              />
              <Avatar src={contact.avatar} alt={contact.name} fallback={contact.name.charAt(0)} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">{contact.name}</p>
                <p className="text-xs text-gray-400 dark:text-white/30 truncate">{contact.email || contact.phoneNumber || '—'}</p>
              </div>
              <button onClick={() => cycleStatus(contact.id, contact.status)} className="flex-shrink-0">
                <StatusBadge status={contact.status} />
              </button>
            </div>

            {/* Row 2: contact info */}
            {contact.email && contact.phoneNumber && (
              <div className="flex items-center gap-4 pl-[52px] mb-2.5">
                <a href={`mailto:${contact.email}`} className="text-xs text-gray-400 dark:text-white/30 hover:text-[#6850E8] truncate">{contact.email}</a>
                <span className="text-[10px] text-gray-300 dark:text-white/15">·</span>
                <a href={`tel:${contact.phoneNumber}`} className="text-xs text-gray-400 dark:text-white/30 hover:text-[#6850E8]">{contact.phoneNumber}</a>
              </div>
            )}

            {/* Row 3: note + deal stage */}
            <div className="flex items-center gap-3 pl-[52px] mb-3">
              <InlineNote note={contact.note || ''} contactId={contact.id} onSave={onNoteChange} />
              <DealStageBadge dealId={contact.dealId} stage={contact.dealStage} onChange={onDealStageChange} />
            </div>

            {/* Row 4: actions */}
            <div className="flex items-center gap-1.5 pl-[52px]">
              <ActionBtn onClick={() => onChat(contact.id)} title="Ir al chat" icon={MessageSquare}
                className="text-[#6850E8] bg-[#6850E8]/10 hover:bg-[#6850E8]/20" />
              <ActionBtn onClick={() => onViewProducts(contact.id)} title="Ver compras" icon={ShoppingBag}
                className="text-blue-500 bg-blue-500/10 hover:bg-blue-500/20" />
              <ActionBtn onClick={() => onSendCoupon(contact.id)} title="Enviar cupón" icon={Tag}
                className="text-amber-500 bg-amber-500/10 hover:bg-amber-500/20" />
              <ActionBtn onClick={() => onEdit(contact.id)} title="Editar" icon={Pencil}
                className="text-gray-400 dark:text-white/25 bg-gray-100 dark:bg-white/[0.04] hover:bg-gray-200 dark:hover:bg-white/[0.08]" />
              <ActionBtn onClick={() => onDelete(contact.id)} title="Eliminar" icon={Trash2}
                className="text-red-400 bg-red-500/10 hover:bg-red-500/20" />
              <span className="ml-2 text-xs text-gray-300 dark:text-white/20 flex-shrink-0">
                {contact.purchases} compra{contact.purchases !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
