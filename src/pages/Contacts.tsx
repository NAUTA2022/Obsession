import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  SearchInput,
  Select,
  Button,
  ContactTable,
  Pagination,
} from "../components/ui";
import { contactsService } from "../services/api/index";
import { dealsService } from "../services/api/deals.service";
import type { Contact, DealStage } from "../types/contacts";

export const ContactsPage = () => {
  // Estados
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtros disponibles
  const statusOptions = [
    { value: "Todos", label: "Todos" },
    { value: "Aprobado", label: "Aprobado" },
    { value: "Pendiente", label: "Pendiente" },
    { value: "Rechazado", label: "Rechazado" },
  ];

  // Cargar contactos desde la API
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await contactsService.getAll();
      setContacts(data);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar contactos
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email &&
          contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.phoneNumber && contact.phoneNumber.includes(searchTerm));
      const matchesStatus =
        selectedStatus === "Todos" || contact.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchTerm, selectedStatus]);

  // Paginación
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, endIndex);

  // Handlers
  const handleSelectContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((contactId) => contactId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === currentContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(currentContacts.map((contact) => contact.id));
    }
  };

  const handleEdit = (_id: string) => {};

  const handleDelete = async (id: string) => {
    try {
      await contactsService.delete(id);
      await loadContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleView = (_id: string) => {};

  const handleNoteChange = async (id: string, note: string) => {
    setContacts(prev => prev.map(c => (c.id === id ? { ...c, note } : c)));
    try {
      await contactsService.update(id, { note });
    } catch {
      console.error('Error actualizando nota');
    }
  };

  const handleChat = (_id: string) => {};
  const handleViewProducts = (_id: string) => {};
  const handleSendCoupon = (_id: string) => {};

  const handleDealStageChange = async (dealId: string, stage: DealStage) => {
    try {
      await dealsService.updateDealStage(dealId, stage, 0);
      setContacts((prev) => prev.map((c) => (c.dealId === dealId ? { ...c, dealStage: stage } : c)));
    } catch {
      console.error('Error actualizando etapa del deal');
    }
  };

  const handleStatusChange = async (id: string, status: Contact['status']) => {
    try {
      await contactsService.updateStatus(id, status);
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    } catch {
      console.error('Error actualizando estado del contacto');
    }
  };

  const handleAddContact = () => {};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#6850E8]/20 border-t-[#6850E8] mx-auto mb-4" />
          <p className="text-sm text-gray-400 dark:text-white/30">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contactos</h1>
        <p className="text-sm text-gray-400 dark:text-white/30 mt-0.5">
          {filteredContacts.length} contacto{filteredContacts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 dark:text-white/30 whitespace-nowrap">Mostrar</span>
              <Select
                value={itemsPerPage.toString()}
                onChange={(value) => { setItemsPerPage(parseInt(value)); setCurrentPage(1); }}
                options={[
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                  { value: "100", label: "100" },
                ]}
                className="w-20"
              />
            </div>
            <div className="flex-1 w-full md:max-w-md">
              <SearchInput
                placeholder="Buscar contactos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              className="w-full md:w-36"
            />
          </div>
          <Button
            onClick={handleAddContact}
            className="bg-[#6850E8] hover:bg-[#5940d8] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 w-full md:w-auto text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Añadir contacto</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredContacts.length > 0 ? (
        <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
          <ContactTable
            contacts={currentContacts}
            selectedContacts={selectedContacts}
            onSelectContact={handleSelectContact}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
            onDealStageChange={handleDealStageChange}
            onNoteChange={handleNoteChange}
            onChat={handleChat}
            onViewProducts={handleViewProducts}
            onSendCoupon={handleSendCoupon}
          />
          <div className="border-t border-gray-50 dark:border-white/[0.04]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredContacts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
            />
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-300 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
            No se encontraron contactos
          </h3>
          <p className="text-sm text-gray-400 dark:text-white/30 mb-5 max-w-xs mx-auto">
            {searchTerm || selectedStatus !== "Todos"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza añadiendo tu primer contacto o espera a que te escriban"}
          </p>
          {!searchTerm && selectedStatus === "Todos" && (
            <Button
              onClick={handleAddContact}
              className="bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Añadir contacto
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
