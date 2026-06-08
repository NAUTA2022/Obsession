import { apiClient } from "./client";

export interface WorkTeam {
  id: number;
  name: string;
  status: string;
  owner_id: number;
  commission_split_leader: number | null;
  commission_split_member: number | null;
  members?: any[];
  owner?: { id: number; username: string; profile_photo_url: string | null };
  role: 'owner' | 'member';
  created_at?: string;
}

export interface WorkTeamCreator {
  assignmentId: number;
  creatorId: number;
  creatorUsername: string;
  creatorPhoto: string | null;
  collaborationId: number;
  creatorLink: string | null;
  referralCode: string | null;
  myCommission: number;
  mySales: number;
}

export interface WorkTeamsResponse {
  ownedGroups: WorkTeam[];
  memberGroups: WorkTeam[];
}

export interface WorkTeamCreatorsResponse {
  creators: WorkTeamCreator[];
  groupName: string;
}

export interface TouchAppCreatorProduct {
  id: string;
  numericId: number;
  title: string;
  description: string;
  price: number;
  type: string;
  thumbnailUrl: string | null;
  blurredThumbnailUrl: string | null;
  source: 'touchapp';
}

class WorkTeamsService {
  async getWorkTeams(): Promise<WorkTeamsResponse> {
    const response = await apiClient.get<WorkTeamsResponse>('/work-teams');
    if (response.success && response.data) {
      return response.data;
    }
    return { ownedGroups: [], memberGroups: [] };
  }

  async resolveVendorLinkByName(creatorUsername: string, productId: number): Promise<string> {
    const response = await apiClient.get<{ linkCode: string }>(
      `/work-teams/resolve-vendor-link-by-name?creatorUsername=${encodeURIComponent(creatorUsername)}&productId=${productId}`,
    );
    return response.data?.linkCode ?? '';
  }

  async resolveVendorLink(collaborationId: number, productId: number): Promise<string> {
    const response = await apiClient.get<{ linkCode: string }>(
      `/work-teams/resolve-vendor-link?collaborationId=${collaborationId}&productId=${productId}`,
    );
    return response.data?.linkCode ?? '';
  }

  async getCreatorProductsByName(username: string): Promise<TouchAppCreatorProduct[]> {
    const response = await apiClient.get<TouchAppCreatorProduct[]>(`/work-teams/creator-by-name/${encodeURIComponent(username)}/products`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async getCreatorProducts(creatorId: number): Promise<TouchAppCreatorProduct[]> {
    const response = await apiClient.get<TouchAppCreatorProduct[]>(`/work-teams/creator/${creatorId}/products`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async getWorkTeamCreators(teamId: number): Promise<WorkTeamCreatorsResponse> {
    const response = await apiClient.get<WorkTeamCreatorsResponse>(`/work-teams/${teamId}/creators`);
    if (response.success && response.data) {
      return response.data;
    }
    return { creators: [], groupName: '' };
  }
}

export const workTeamsService = new WorkTeamsService();
