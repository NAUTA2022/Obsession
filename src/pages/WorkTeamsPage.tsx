import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon, ShoppingBag, Heart, PlusCircle, ChevronDown, ChevronRight, MessageCircle, Users, Loader2, Bot, X } from 'lucide-react';
import { workTeamsService, type WorkTeam, type WorkTeamCreator } from '../services/api/work-teams.service';
import { chatService } from '../services/api/chat.service';
import { botService, type BotConfig } from '../services/api/bot.service';
import { BotConfigPanel } from '../components/chat/BotConfigPanel';
import type { ChatConversation } from '../types/chat-native';
import { useAuthStore } from '../store/auth';
import { env } from '../config/env';
import toast from 'react-hot-toast';

interface GroupCreatorsState {
  creators: WorkTeamCreator[];
  loading: boolean;
  loaded: boolean;
}

export default function WorkTeamsPage() {
  const user = useAuthStore((s) => s.user);
  const [ownedGroups, setOwnedGroups] = useState<WorkTeam[]>([]);
  const [memberGroups, setMemberGroups] = useState<WorkTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [touchAppError, setTouchAppError] = useState<'expired' | 'not-linked' | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedCreators, setExpandedCreators] = useState<Set<string>>(new Set());
  const [groupCreators, setGroupCreators] = useState<Record<number, GroupCreatorsState>>({});

  const fetchWorkTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTouchAppError(null);
      const data = await workTeamsService.getWorkTeams();
      setOwnedGroups(data.ownedGroups);
      setMemberGroups(data.memberGroups);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('not linked') || msg.includes('404')) {
        setTouchAppError('not-linked');
      } else if (msg.includes('expired') || msg.includes('401')) {
        setTouchAppError('expired');
      } else {
        setError(msg || 'Error al cargar equipos');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkTeams();
  }, [fetchWorkTeams]);

  useEffect(() => {
    const onFocus = () => {
      if (touchAppError) fetchWorkTeams();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [touchAppError, fetchWorkTeams]);

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

  const toggleCreator = (groupId: number, creatorId: number) => {
    const key = `${groupId}-${creatorId}`;
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

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando equipos...</div>
      </div>
    );
  }

  if (touchAppError === 'not-linked') {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Equipos de Trabajo</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Vincula tu cuenta de TouchApp para ver tus equipos de trabajo.</p>
          <a href="/profile" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Vincular TouchApp
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const allGroups = [...ownedGroups, ...memberGroups];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Equipos de Trabajo</h1>
      </div>

      {touchAppError === 'expired' && (
        <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
          Tu vinculacion con TouchApp expiro. Ve a tu{' '}
          <a href="/profile" className="underline font-medium">perfil</a>{' '}
          para vincular de nuevo.
        </div>
      )}

      {allGroups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No perteneces a ningun equipo de trabajo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allGroups.map((group) => (
            <GroupAccordion
              key={`${group.role}-${group.id}`}
              group={group}
              isExpanded={expandedGroups.has(group.id)}
              onToggle={() => toggleGroup(group.id)}
              creatorsState={groupCreators[group.id]}
              expandedCreators={expandedCreators}
              onToggleCreator={(creatorId) => toggleCreator(group.id, creatorId)}
              onCopyLink={copyToClipboard}
              memberUsername={user?.username}
              vendorId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface GroupAccordionProps {
  group: WorkTeam;
  isExpanded: boolean;
  onToggle: () => void;
  creatorsState?: GroupCreatorsState;
  expandedCreators: Set<string>;
  onToggleCreator: (creatorId: number) => void;
  onCopyLink: (text: string) => void;
  memberUsername?: string;
  vendorId?: string;
}

function GroupAccordion({ group, isExpanded, onToggle, creatorsState, expandedCreators, onToggleCreator, onCopyLink, memberUsername, vendorId }: GroupAccordionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-900">{group.name}</span>
          {group.role === 'owner' && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Lider</span>
          )}
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 pb-4">
          {creatorsState?.loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Cargando creadores...</span>
            </div>
          ) : creatorsState?.creators.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              No tienes creadores asignados en este equipo
            </div>
          ) : (
            <div className="space-y-1 pt-3">
              {creatorsState?.creators.map((creator) => (
                <CreatorRow
                  key={creator.assignmentId}
                  creator={creator}
                  groupId={group.id}
                  isExpanded={expandedCreators.has(`${group.id}-${creator.creatorId}`)}
                  onToggle={() => onToggleCreator(creator.creatorId)}
                  onCopyLink={onCopyLink}
                  memberUsername={memberUsername}
                  vendorId={vendorId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CreatorRowProps {
  creator: WorkTeamCreator;
  groupId: number;
  isExpanded: boolean;
  onToggle: () => void;
  onCopyLink: (text: string) => void;
  memberUsername?: string;
  vendorId?: string;
}

function CreatorRow({ creator, groupId, isExpanded, onToggle, onCopyLink, memberUsername, vendorId }: CreatorRowProps) {
  const touchAppUrl = env.TOUCHAPP_URL;
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [convsLoaded, setConvsLoaded] = useState(false);
  const [botModalOpen, setBotModalOpen] = useState(false);
  const [botConfig, setBotConfig] = useState<Partial<BotConfig> | null>(null);
  const [loadingBotConfig, setLoadingBotConfig] = useState(false);

  useEffect(() => {
    if (isExpanded && !convsLoaded) {
      setLoadingConvs(true);
      chatService.getDelegatedConversations(creator.creatorUsername)
        .then(setConversations)
        .catch(() => {})
        .finally(() => { setLoadingConvs(false); setConvsLoaded(true); });
    }
  }, [isExpanded, convsLoaded, creator.creatorUsername]);

  const handleOpenConversation = (_convId: string) => {
    navigate(`/inbox`);
  };

  const handleOpenBotConfig = async () => {
    if (!vendorId) return;
    setLoadingBotConfig(true);
    try {
      const config = await botService.getDelegatedConfig(vendorId, creator.creatorUsername);
      setBotConfig(config ?? { autoPilot: false });
    } catch {
      setBotConfig({ autoPilot: false });
    } finally {
      setLoadingBotConfig(false);
      setBotModalOpen(true);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
        <button onClick={onToggle} className="flex items-center gap-3 flex-1 min-w-0">
          {creator.creatorPhoto ? (
            <img src={creator.creatorPhoto} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-900 truncate">{creator.creatorUsername}</span>
          <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button
            onClick={() => {
              if (creator.creatorLink) {
                const linkCode = creator.creatorLink.replace('https://touch.vip/', '');
                const url = `${touchAppUrl}/shared-profile/${linkCode}${creator.referralCode ? `?ref=${creator.referralCode}` : ''}`;
                onCopyLink(url);
                toast.success('Link de tienda copiado');
              }
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Link de la tienda"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <a
            href={`${touchAppUrl}/home/tab/group-detail/${groupId}?action=products&creatorId=${creator.creatorId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Productos"
          >
            <ShoppingBag className="h-4 w-4" />
          </a>
          <a
            href={`${touchAppUrl}/home/tab/group-detail/${groupId}?action=services&creatorId=${creator.creatorId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Servicios"
          >
            <Heart className="h-4 w-4" />
          </a>
          <button
            onClick={() => {
              if (memberUsername && creator.creatorUsername) {
                const params = new URLSearchParams();
                params.set('dcn', creator.creatorUsername);
                if (creator.creatorPhoto) params.set('dcp', creator.creatorPhoto);
                params.set('dci', String(creator.creatorId));
                if (creator.referralCode) params.set('drc', creator.referralCode);
                if (creator.collaborationId) params.set('dcol', String(creator.collaborationId));
                if (creator.creatorLink) params.set('tl', creator.creatorLink.replace('https://touch.vip/', ''));
                const chatLink = `${window.location.origin}/p/${memberUsername}?${params.toString()}`;
                onCopyLink(chatLink);
                toast.success('Link de chat copiado');
              }
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Copiar link de chat"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenBotConfig}
            disabled={loadingBotConfig}
            className="p-1.5 rounded-md hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
            title="Configurar IA"
          >
            {loadingBotConfig
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Bot className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      {/* Modal de configuración de IA */}
      {botModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setBotModalOpen(false); }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-3 flex items-center gap-2 px-1">
              <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
                <p className="text-sm font-semibold text-indigo-700">
                  Configurando IA de <span className="font-bold">@{creator.creatorUsername}</span>
                </p>
                <p className="text-xs text-indigo-400 mt-0.5">
                  Esta IA responderá a los clientes que lleguen por tu link de esta creadora
                </p>
              </div>
              <button
                onClick={() => setBotModalOpen(false)}
                className="p-2 rounded-xl bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 shadow transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <BotConfigPanel
              initialConfig={botConfig ?? undefined}
              onSaveConfig={async (cfg) => {
                await botService.updateDelegatedConfig(vendorId!, creator.creatorUsername, cfg);
                setBotModalOpen(false);
                toast.success(`IA de ${creator.creatorUsername} configurada`);
              }}
            />
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="ml-14 pb-2 space-y-1">
          {/* Conversaciones */}
          <div>
            <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 font-medium">
              <MessageCircle className="h-4 w-4" />
              <span>Conversaciones</span>
              {conversations.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-1">{conversations.length}</span>
              )}
            </div>
            {loadingConvs ? (
              <div className="flex items-center gap-2 px-2 py-1 ml-6">
                <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                <span className="text-xs text-gray-400">Cargando...</span>
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-gray-400 ml-8 py-1">Sin conversaciones aun</p>
            ) : (
              <div className="ml-6 space-y-0.5">
                {conversations.map((conv) => {
                  const clientName = conv.client?.displayName || conv.client?.firstName || conv.client?.username || 'Visitante';
                  const lastMsg = conv.lastMessage?.content;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleOpenConversation(conv.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs font-semibold">{clientName[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-800 truncate">{clientName}</span>
                          {conv.unreadCount > 0 && (
                            <span className="w-4 h-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        {lastMsg && <p className="text-[11px] text-gray-400 truncate">{lastMsg}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contactos */}
          <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-500 rounded hover:bg-gray-50 cursor-default">
            <Users className="h-4 w-4" />
            <span>Contactos</span>
            <span className="text-xs text-gray-400 ml-auto">Proximamente</span>
          </div>
        </div>
      )}
    </div>
  );
}
