export type DealStage = 'selection' | 'proposal' | 'negotiation' | 'review' | 'closing-green' | 'closing-red' | 'delivery';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  whatsappChatId?: string;
  purchases: number;
  note: string;
  status: 'Aprobado' | 'Pendiente' | 'Rechazado';
  source?: 'whatsapp' | 'manual' | 'import';
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  dealId?: string | null;
  dealStage?: DealStage | null;
}

export interface ContactTableProps {
  contacts: Contact[];
  selectedContacts: string[];
  onSelectContact: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onStatusChange: (id: string, status: Contact['status']) => void;
  onDealStageChange: (dealId: string, stage: DealStage) => void;
  onNoteChange: (id: string, note: string) => void;
  onChat: (id: string) => void;
  onViewProducts: (id: string) => void;
  onSendCoupon: (id: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}
