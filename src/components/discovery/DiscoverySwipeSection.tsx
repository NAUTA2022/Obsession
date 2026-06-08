import { useNavigate } from 'react-router-dom';
import { useDiscovery } from '../../hooks/useDiscovery';
import type { DiscoveryAudience } from '../../types/discovery';
import SwipeDeck from './SwipeDeck';
import MatchModal from './MatchModal';

interface Props {
  audience: DiscoveryAudience;
  emptyLabel?: string;
  fullscreen?: boolean;
  onClose?: () => void;
  onSecondChance?: () => void;
  onViewLiked?: () => void;
}

export default function DiscoverySwipeSection({ audience, emptyLabel, fullscreen, onClose, onSecondChance, onViewLiked }: Props) {
  const navigate = useNavigate();
  const {
    profiles,
    loading,
    handleLike,
    handlePass,
    handleMessage,
    match,
    dismissMatch,
    openConversation,
  } = useDiscovery(audience);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${fullscreen ? 'h-full bg-black' : 'min-h-[300px]'}`}>
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#6850E8]" />
      </div>
    );
  }

  return (
    <>
      <SwipeDeck
        profiles={profiles}
        onLike={handleLike}
        onPass={handlePass}
        onMessage={handleMessage}
        emptyLabel={emptyLabel}
        fullscreen={fullscreen}
        onClose={onClose}
        onSecondChance={onSecondChance}
        onViewLiked={onViewLiked}
        onViewProfile={(id) => navigate(`/customer/creator/${id}`)}
      />
      {match && (
        <MatchModal
          match={match}
          onMessage={() => {
            if (match.conversationId) openConversation(match.conversationId);
            dismissMatch();
          }}
          onClose={dismissMatch}
        />
      )}
    </>
  );
}
