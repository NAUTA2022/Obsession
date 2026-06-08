import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Link as LinkIcon, ShoppingBag, Heart, PlusCircle, MessageCircle, Users, Loader2, Bot, X } from 'lucide-react';
import { workTeamsService, type WorkTeam, type WorkTeamCreator } from '../../services/api/work-teams.service';
import { chatService } from '../../services/api/chat.service';
import { botService, type BotConfig } from '../../services/api/bot.service';
import { BotConfigPanel } from '../chat/BotConfigPanel';
import type { ChatConversation } from '../../types/chat-native';
import { useAuthStore } from '../../store/auth';
import { env } from '../../config/env';
import toast from 'react-hot-toast';

interface GroupCreatorsState {
  creators: WorkTeamCreator[];
  loading: boolean;
  loaded: boolean;
}

export default function SidebarTeams() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const touchAppUrl = env.TOUCHAPP_URL;

  const [ownedGroups, setOwnedGroups] = useState<WorkTeam[]>([]);
  const [memberGroups, setMemberGroups] = useState<WorkTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedCreators, setExpandedCreators] = useState<Set<string>>(new Set());
  const [groupCreators, setGroupCreators] = useState<Record<number, GroupCreatorsState>>({});

  const fetchWorkTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await workTeamsService.getWorkTeams();
      setOwnedGroups(data.ownedGroups);
      setMemberGroups(data.memberGroups);
    } catch {
      // silently fail in sidebar
    } finally {
      setIsLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) fetchWorkTeams();
  }, [loaded, fetchWorkTeams]);

  const toggleGroup = async (groupId: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
        if (!groupCreators[groupId]?.loaded) {
          loadCreators(groupId);
        }
      }
      return next;
    });
  };

  const loadCreators = async (groupId: number) => {
    setGroupCreators(prev => ({
      ...prev,
      [groupId]: { creators: [], loading: true, loaded: false },
    }));
    try {
      const data = await workTeamsService.getWorkTeamCreators(groupId);
      setGroupCreators(prev => ({
        ...prev,
        [groupId]: { creators: data.creators, loading: false, loaded: true },
      }));
    } catch {
      setGroupCreators(prev => ({
        ...prev,
        [groupId]: { creators: [], loading: false, loaded: true },
      }));
    }
  };

  const toggleCreator = (key: string) => {
    setExpandedCreators(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
  };

  const allGroups = [...ownedGroups, ...memberGroups];

  if (isLoading) {
    return (
      <div className="ml-6 py-2 flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        <span className="text-xs text-gray-400">Cargando...</span>
      </div>
    );
  }

  if (allGroups.length === 0) {
    return (
      <div className="ml-6 py-2">
        <span className="text-xs text-gray-400">Sin equipos</span>
      </div>
    );
  }

  return (
    <ul className="ml-4 mt-1 space-y-0.5">
      {allGroups.map((group) => {
        const isGroupExpanded = expandedGroups.has(group.id);
        const creatorsState = groupCreators[group.id];

        return (
          <li key={`${group.role}-${group.id}`}>
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown className={`h-3 w-3 flex-shrink-0 transition-transform ${isGroupExpanded ? '' : '-rotate-90'}`} />
              <span className="truncate">{group.name}</span>
              {group.role === 'owner' && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex-shrink-0 dark:bg-blue-900/30 dark:text-blue-300">Líder</span>
              )}
            </button>

            {/* Creators list */}
            {isGroupExpanded && (
              <ul className="ml-3 mt-0.5 space-y-0.5">
                {creatorsState?.loading ? (
                  <li className="flex items-center gap-2 px-2 py-1">
                    <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                    <span className="text-xs text-gray-400">Cargando...</span>
                  </li>
                ) : creatorsState?.creators.length === 0 ? (
                  <li className="px-2 py-1 text-xs text-gray-400">Sin creadores</li>
                ) : (
                  creatorsState?.creators.map((creator) => {
                    const creatorKey = `${group.id}-${creator.creatorId}`;
                    const isCreatorExpanded = expandedCreators.has(creatorKey);

                    return (
                      <li key={creator.assignmentId}>
                        {/* Creator row */}
                        <div className="flex items-center gap-1 rounded-md px-1 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <button
                            onClick={() => toggleCreator(creatorKey)}
                            className="flex items-center gap-2 flex-1 min-w-0"
                          >
                            {creator.creatorPhoto ? (
                              <img src={creator.creatorPhoto} alt="" className="h-5 w-5 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <Users className="h-3 w-3 text-gray-500" />
                              </div>
                            )}
                            <span className="text-xs text-gray-800 dark:text-gray-200 truncate">{creator.creatorUsername}</span>
                          </button>

                          {/* Action icons */}
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => {
                                if (creator.creatorLink) {
                                  const linkCode = creator.creatorLink.replace('https://touch.vip/', '');
                                  const url = `${touchAppUrl}/shared-profile/${linkCode}${creator.referralCode ? `?ref=${creator.referralCode}` : ''}`;
                                  copyToClipboard(url);
                                  toast.success('Link copiado');
                                }
                              }}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Link tienda"
                            >
                              <LinkIcon className="h-3 w-3" />
                            </button>
                            <a
                              href={`${touchAppUrl}/home/tab/group-detail/${group.id}?action=products&creatorId=${creator.creatorId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Productos"
                            >
                              <ShoppingBag className="h-3 w-3" />
                            </a>
                            <a
                              href={`${touchAppUrl}/home/tab/group-detail/${group.id}?action=services&creatorId=${creator.creatorId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Servicios"
                            >
                              <Heart className="h-3 w-3" />
                            </a>
                            <button
                              onClick={() => {
                                if (user?.username && creator.creatorUsername) {
                                  const params = new URLSearchParams();
                                  params.set('dcn', creator.creatorUsername);
                                  if (creator.creatorPhoto) params.set('dcp', creator.creatorPhoto);
                                  params.set('dci', String(creator.creatorId));
                                  if (creator.referralCode) params.set('drc', creator.referralCode);
                                  if (creator.collaborationId) params.set('dcol', String(creator.collaborationId));
                                  if (creator.creatorLink) params.set('tl', creator.creatorLink.replace('https://touch.vip/', ''));
                                  const chatLink = `${window.location.origin}/p/${user.username}?${params.toString()}`;
                                  copyToClipboard(chatLink);
                                  toast.success('Link de chat copiado');
                                }
                              }}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Link de chat"
                            >
                              <PlusCircle className="h-3 w-3" />
                            </button>
                            <CreatorBotButton vendorId={user!.id} creatorUsername={creator.creatorUsername} />
                          </div>
                        </div>

                        {/* Creator sub-items */}
                        {isCreatorExpanded && (
                          <CreatorSubItems
                            creatorUsername={creator.creatorUsername}
                            onOpenConversation={() => navigate('/inbox')}
                          />
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function CreatorBotButton({ vendorId, creatorUsername }: { vendorId: string; creatorUsername: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Partial<BotConfig> | null>(null);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const data = await botService.getDelegatedConfig(vendorId, creatorUsername);
      setConfig(data ?? { autoPilot: false });
    } catch {
      setConfig({ autoPilot: false });
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={loading}
        className="p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
        title="Configurar IA"
      >
        {loading
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <Bot className="h-3 w-3" />
        }
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-2xl my-auto py-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
                <p className="text-sm font-semibold text-indigo-700">
                  Configurando IA de <span className="font-bold">{creatorUsername}</span>
                </p>
                <p className="text-xs text-indigo-400 mt-0.5">
                  Esta IA responderá a los clientes que lleguen por tu link de esta creadora
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2.5 rounded-2xl bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700 shadow-md transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <BotConfigPanel
              initialConfig={config ?? undefined}
              onSaveConfig={async (cfg) => {
                await botService.updateDelegatedConfig(vendorId, creatorUsername, cfg);
                setOpen(false);
                toast.success(`IA de ${creatorUsername} configurada`);
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function CreatorSubItems({ creatorUsername, onOpenConversation }: { creatorUsername: string; onOpenConversation: () => void }) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatService.getDelegatedConversations(creatorUsername)
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [creatorUsername]);

  return (
    <div className="ml-7 mt-0.5 space-y-0.5 pb-1">
      {/* Conversaciones */}
      <div>
        <div className="flex items-center gap-1.5 px-1 py-1 text-xs text-gray-500">
          <MessageCircle className="h-3 w-3" />
          <span>Conversaciones</span>
          {conversations.length > 0 && (
            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1 rounded-full">{conversations.length}</span>
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-1 px-1 ml-4">
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            <span className="text-[10px] text-gray-400">Cargando...</span>
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-[10px] text-gray-400 ml-5 py-0.5">Sin conversaciones</p>
        ) : (
          <div className="ml-4 space-y-0.5">
            {conversations.map((conv) => {
              const clientName = conv.client?.displayName || conv.client?.firstName || conv.client?.username || 'Visitante';
              return (
                <button
                  key={conv.id}
                  onClick={onOpenConversation}
                  className="w-full flex items-center gap-1.5 px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-300 text-[9px] font-semibold">{clientName[0].toUpperCase()}</span>
                  </div>
                  <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate">{clientName}</span>
                  {conv.unreadCount > 0 && (
                    <span className="w-3.5 h-3.5 bg-blue-600 text-white text-[8px] rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Contactos */}
      <div className="flex items-center gap-1.5 px-1 py-1 text-xs text-gray-400">
        <Users className="h-3 w-3" />
        <span>Contactos</span>
        <span className="text-[10px] ml-auto">Próximamente</span>
      </div>
    </div>
  );
}
