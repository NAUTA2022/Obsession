import apiClient from './client';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  whatsappChatId?: string;
  purchases: number;
  note?: string;
  status: 'Aprobado' | 'Pendiente' | 'Rechazado';
  source?: 'whatsapp' | 'manual' | 'import';
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContactDto {
  name: string;
  email?: string;
  phoneNumber?: string;
  whatsappChatId?: string;
  purchases?: number;
  note?: string;
  status?: 'Aprobado' | 'Pendiente' | 'Rechazado';
  source?: 'whatsapp' | 'manual' | 'import';
  avatar?: string;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {}

class ContactsService {
  async getAll(): Promise<Contact[]> {
    const response = await apiClient.get<{ data: Contact[] }>('/contacts');
    return response.data?.data ?? [];
  }

  async getById(id: string): Promise<Contact> {
    const response = await apiClient.get<Contact>(`/contacts/${id}`);
    return response.data;
  }

  async create(data: CreateContactDto): Promise<Contact> {
    const response = await apiClient.post<Contact>('/contacts', data);
    return response.data;
  }

  async update(id: string, data: UpdateContactDto): Promise<Contact> {
    const response = await apiClient.patch<Contact>(`/contacts/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/contacts/${id}`);
  }

  async updateStatus(id: string, status: 'Aprobado' | 'Pendiente' | 'Rechazado'): Promise<Contact> {
    const response = await apiClient.patch<Contact>(`/contacts/${id}/status`, { status });
    return response.data;
  }

  async incrementPurchases(id: string): Promise<Contact> {
    const response = await apiClient.post<Contact>(`/contacts/${id}/increment-purchases`);
    return response.data;
  }
}

const contactsServiceInstance = new ContactsService();

export const contactsService = contactsServiceInstance;
export default contactsServiceInstance;
