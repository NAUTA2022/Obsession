import apiClient from './client';

export interface BotConfig {
  id?: string;
  creatorId?: string;
  delegatedCreatorName?: string | null;
  systemPrompt?: string | null;
  autoPilot: boolean;
  characterName?: string | null;
  personality?: string[] | null;
  tone?: string | null;
  language?: string | null;
  catchphrases?: string[] | null;
  avoidTopics?: string[] | null;
  priceHandlingInstructions?: string | null;
  useProfileBio?: boolean;
  extraInstructions?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

class BotService {
  async getConfig(creatorId: string): Promise<BotConfig | null> {
    const response = await apiClient.get<BotConfig>(`/bot/ai-config/${creatorId}`);
    return response.data ?? null;
  }

  async updateConfig(creatorId: string, config: Partial<BotConfig>): Promise<BotConfig> {
    const response = await apiClient.put<BotConfig>(`/bot/ai-config/${creatorId}`, config);
    return response.data;
  }

  async getDelegatedConfig(vendorId: string, delegatedCreatorName: string): Promise<BotConfig | null> {
    const response = await apiClient.get<BotConfig>(
      `/bot/ai-config/${vendorId}/delegated/${encodeURIComponent(delegatedCreatorName)}`,
    );
    return response.data ?? null;
  }

  async updateDelegatedConfig(vendorId: string, delegatedCreatorName: string, config: Partial<BotConfig>): Promise<BotConfig> {
    const response = await apiClient.put<BotConfig>(
      `/bot/ai-config/${vendorId}/delegated/${encodeURIComponent(delegatedCreatorName)}`,
      config,
    );
    return response.data;
  }
}

export const botService = new BotService();
export default botService;
