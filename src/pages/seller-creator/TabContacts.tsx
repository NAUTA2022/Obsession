import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Users, ShoppingBag, Clock, Plus, X, Save, Phone, Mail } from 'lucide-react';
import ContactTable from '../../components/ui/ContactTable';
import type { Contact, DealStage } from '../../types/contacts';
import { MOCK_CONTACTS } from './mockData';
import toast from 'react-hot-toast';

// ── Add Contact Modal ─────────────────────────────────────────────────────────

function AddContactModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Contact) => void }) {
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note,  setNote]  = useState('');

  const save = () => {
    if (!name.trim()) { toast.error('El nombre es requerido'); return; }
    const newContact: Contact = {
      id: `ct_${Date.now()}`,
      name: name.trim(),
      email: email.trim() || undefined,
      phoneNumber: phone.trim() || undefined,
      purchases: 0,
      note: note.trim(),
      status: 'Pendiente',
      source: 'manual',
      createdAt: new Date().toISOString(),
    };
    onAdd(newContact);
    toast.success(`${newContact.name} añadido`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#1A1A2E] rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white/90">Nuevo contacto</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Añadir a tu lista de prospectos</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">
              Nombre *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20" />
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 focus:border-[#6850E8]/50 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20" />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                type="email"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 focus:border-[#6850E8]/50 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">
              Teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20" />
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                type="tel"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 focus:border-[#6850E8]/50 transition-all"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">
              Nota inicial
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Contexto del prospecto..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 focus:border-[#6850E8]/50 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#6850E8] text-white hover:bg-[#5a44d4] transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Guardar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TabContacts() {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [selected, setSelected] = useState<string[]>([]);
  const [search,   setSearch]   = useState('');
  const [addOpen,  setAddOpen]  = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSelectContact = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSelectAll = () =>
    setSelected(selected.length === contacts.length ? [] : contacts.map(c => c.id));

  const handleStatusChange = (id: string, status: Contact['status']) =>
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));

  const handleDealStageChange = (dealId: string, stage: DealStage) =>
    setContacts(prev =>
      prev.map(c => c.dealId === dealId ? { ...c, dealStage: stage } : c)
    );

  const handleNoteChange = (id: string, note: string) =>
    setContacts(prev => prev.map(c => c.id === id ? { ...c, note } : c));

  const handleDelete = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setSelected(prev => prev.filter(x => x !== id));
    toast.success('Contacto eliminado');
  };

  const handleAdd = (c: Contact) => setContacts(prev => [c, ...prev]);

  const handleChat    = (id: string) => toast(`Abrir chat con ${contacts.find(c => c.id === id)?.name}`);
  const handleEdit    = (id: string) => toast(`Editar ${contacts.find(c => c.id === id)?.name}`);
  const handleView    = (id: string) => toast(`Ver perfil de ${contacts.find(c => c.id === id)?.name}`);
  const handleProducts = (id: string) => toast(`Productos de ${contacts.find(c => c.id === id)?.name}`);
  const handleCoupon   = (id: string) => toast(`Enviar cupón a ${contacts.find(c => c.id === id)?.name}`);

  // ── Filtering ────────────────────────────────────────────────────────────────

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phoneNumber ?? '').includes(search)
  );

  const total   = contacts.length;
  const buyers  = contacts.filter(c => c.purchases > 0).length;
  const pending = contacts.filter(c => c.status === 'Pendiente').length;

  return (
    <div className="flex flex-col h-full">
      {/* Demo banner + add button */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-400/[0.08] border border-amber-200/60 dark:border-amber-400/20 rounded-xl px-3 py-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <p className="text-[11px] text-amber-700 dark:text-amber-400/90 flex-1">
            Contactos de ejemplo — aquí verás los prospectos captados a través de esta creadora
          </p>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6850E8] text-white text-xs font-semibold rounded-lg hover:bg-[#5a44d4] transition-colors flex-shrink-0 shadow-sm"
          >
            <Plus className="w-3 h-3" />
            Añadir
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 pb-3 shrink-0">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-2.5 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6850E8]/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-3 h-3 text-[#6850E8]" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white/90 leading-none">{total}</p>
              <p className="text-[9px] text-gray-400 dark:text-white/30">Total</p>
            </div>
          </div>
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-2.5 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-3 h-3 text-emerald-500" />
            </div>
            <div>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-none">{buyers}</p>
              <p className="text-[9px] text-gray-400 dark:text-white/30">Compraron</p>
            </div>
          </div>
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-2.5 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-3 h-3 text-amber-500" />
            </div>
            <div>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400 leading-none">{pending}</p>
              <p className="text-[9px] text-gray-400 dark:text-white/30">Pendientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-700 dark:text-white/70 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 focus:border-[#6850E8]/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <ContactTable
          contacts={filtered}
          selectedContacts={selected}
          onSelectContact={handleSelectContact}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onStatusChange={handleStatusChange}
          onDealStageChange={handleDealStageChange}
          onNoteChange={handleNoteChange}
          onChat={handleChat}
          onViewProducts={handleProducts}
          onSendCoupon={handleCoupon}
        />

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-8 h-8 text-gray-200 dark:text-white/10 mb-3" />
            <p className="text-sm font-medium text-gray-400 dark:text-white/30">Sin contactos</p>
            {search ? (
              <p className="text-xs text-gray-300 dark:text-white/20 mt-1">No hay resultados para "{search}"</p>
            ) : (
              <button
                onClick={() => setAddOpen(true)}
                className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-[#6850E8] text-white text-xs font-semibold rounded-xl hover:bg-[#5a44d4] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir primer contacto
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add contact modal */}
      <AnimatePresence>
        {addOpen && <AddContactModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}
