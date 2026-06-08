import apiClient from './client';

export type DealStage = 'selection' | 'proposal' | 'negotiation' | 'review' | 'closing-green' | 'closing-red' | 'delivery';

export interface Deal {
    id: string;
    userId: string;
    contactId: string;
    stage: DealStage;
    orderIndex: number;
    value: number;
    contact?: {
        id: string;
        name: string;
        phoneNumber: string;
        avatar?: string;
    };
}

export const dealsService = {
    // Get all deals for the authenticated user
    getDeals: async (): Promise<Deal[]> => {
        try {
            const response = await apiClient.get<{ data: Deal[] }>('/deals');
            return response.data?.data ?? [];
        } catch (error) {
            console.error('Error fetching deals:', error);
            throw new Error(
                error instanceof Error ? error.message : "Error fetching deals",
            );
        }
    },

    // Create a new deal
    createDeal: async (data: { contactId: string; stage?: DealStage; value?: number }): Promise<Deal> => {
        try {
            const response = await apiClient.post<Deal>('/deals', data);
            return response.data!;
        } catch (error) {
            console.error('Error creating deal:', error);
            throw new Error(
                error instanceof Error ? error.message : "Error creating deal",
            );
        }
    },

    // Update a deal's stage and order (for drag and drop)
    updateDealStage: async (id: string, stage: DealStage, newOrderIndex: number): Promise<Deal[]> => {
        try {
            const response = await apiClient.patch<Deal[]>(`/deals/${id}/stage`, {
                stage,
                newOrderIndex
            });
            return response.data || [];
        } catch (error) {
            console.error('Error updating deal stage:', error);
            throw new Error(
                error instanceof Error ? error.message : "Error updating deal",
            );
        }
    }
};
