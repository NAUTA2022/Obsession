import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/api/client';
import { creatorsService } from '../services/api/creators.service';
import { sellerService } from '../services/api/seller.service';
import { swipeService } from '../services/api/swipe.service';
import { chatService } from '../services/api/chat.service';
import { useAuthStore } from '../store/auth';
import { ROUTES } from '../constants/routes';
import { USER_ROLES } from '../types/auth';
import { images } from '../config/assets';
import {
  getCategoryLabel,
  getCountryName,
  getLanguageLabel,
} from '../constants/sellerOptions';
import type { DiscoveryAudience, DiscoveryProfile } from '../types/discovery';

const GALLERY_FETCH_CAP = 20; // máximo de galerías a precargar

async function fetchGallery(userId: string): Promise<string[]> {
  try {
    const res = await apiClient.get<any[]>(`/gallery/user/${userId}`);
    const items = (res.data as any[]) ?? [];
    return items.map((i) => i.imageUrl).filter(Boolean);
  } catch {
    return [];
  }
}

export interface MatchInfo {
  profile: DiscoveryProfile;
  conversationId?: string;
}

export function useDiscovery(audience: DiscoveryAudience) {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);

  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<MatchInfo | null>(null);

  const inboxRoute =
    role === USER_ROLES.CREATOR ? ROUTES['creator-inbox'] : ROUTES['client-inbox'];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [swipedIds, base] = await Promise.all([
        swipeService.getSwipedIds().catch(() => [] as string[]),
        audience === 'creators'
          ? creatorsService.getAllCreators().then((r) => r.data?.data ?? [])
          : sellerService.listSellers(),
      ]);

      const swiped = new Set(swipedIds);

      const mapped: DiscoveryProfile[] =
        audience === 'creators'
          ? (base as any[]).map((c) => ({
              id: c.id,
              username: c.username,
              name: c.displayName || c.username,
              description: c.bio || 'Contenido exclusivo',
              mainPhoto: c.profilePicture || images.sampleProfile,
              gallery: [],
              meta: [
                ...(c.location ? [{ label: '', value: c.location }] : []),
                ...(c.contentType ? [{ label: '', value: c.contentType }] : []),
              ],
              productCount: c.productCount,
              priceRange: (c.priceMin != null && c.priceMax != null)
                ? `$${c.priceMin} – $${c.priceMax}`
                : undefined,
            }))
          : (base as any[]).map((s) => ({
              id: s.userId,
              username: s.username,
              name: s.displayName || s.username,
              description: s.description || s.bio || 'Vendedor colaborativo',
              mainPhoto: s.profilePicture || images.sampleProfile,
              gallery: [],
              meta: [
                ...(s.nationality
                  ? [{ label: 'País', value: getCountryName(s.nationality) }]
                  : []),
                ...(s.languages?.length
                  ? [{ label: 'Idiomas', value: s.languages.map(getLanguageLabel).join(', ') }]
                  : []),
                ...(s.productCategories?.length
                  ? [
                      {
                        label: 'Categorías',
                        value: s.productCategories.map(getCategoryLabel).join(', '),
                      },
                    ]
                  : []),
                { label: 'Comisión', value: `${s.commissionPercentage}%` },
              ],
            }));

      // Excluir ya swipeados y a uno mismo
      const meId = useAuthStore.getState().user?.id;
      const filtered = mapped.filter((p) => !swiped.has(p.id) && p.id !== meId);

      // Precargar galerías (limitado)
      const galleries = await Promise.all(
        filtered.slice(0, GALLERY_FETCH_CAP).map((p) => fetchGallery(p.id)),
      );
      galleries.forEach((g, i) => {
        filtered[i].gallery = g;
      });

      setProfiles(filtered);
    } catch (e) {
      console.error('Error loading discovery profiles', e);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [audience]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePass = useCallback((profile: DiscoveryProfile) => {
    void swipeService.swipe(profile.id, 'pass').catch(() => {});
  }, []);

  const handleLike = useCallback(async (profile: DiscoveryProfile) => {
    try {
      const res = await swipeService.swipe(profile.id, 'like');
      if (res.match) {
        setMatch({ profile, conversationId: res.conversationId });
      } else if (role === USER_ROLES.CUSTOMER) {
        toast.success('Guardada en tus me gusta');
      } else {
        toast.success('Solicitud de colaboración enviada');
      }
    } catch {
      /* ignore */
    }
  }, [role]);

  const openConversation = useCallback(
    (conversationId: string) => {
      navigate(`${inboxRoute}?c=${conversationId}`);
    },
    [navigate, inboxRoute],
  );

  const handleMessage = useCallback(
    async (profile: DiscoveryProfile) => {
      try {
        const { conversationId } = await chatService.startConversationWith(profile.id);
        openConversation(conversationId);
      } catch (e: any) {
        toast.error('No se pudo iniciar la conversación');
      }
    },
    [openConversation],
  );

  const dismissMatch = useCallback(() => setMatch(null), []);

  return {
    profiles,
    loading,
    reload: load,
    handleLike,
    handlePass,
    handleMessage,
    match,
    dismissMatch,
    openConversation,
  };
}
