import { Heart } from 'lucide-react';
import type { MatchInfo } from '../../hooks/useDiscovery';

interface Props {
  match: MatchInfo;
  onMessage: () => void;
  onClose: () => void;
}

export default function MatchModal({ match, onMessage, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-800">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
          <Heart className="h-8 w-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">¡Es un match!</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          A ti y a <span className="font-semibold">{match.profile.name}</span> les interesa
          colaborar.
        </p>

        <img
          src={match.profile.mainPhoto}
          alt={match.profile.name}
          className="mx-auto my-5 h-24 w-24 rounded-full object-cover ring-4 ring-pink-200"
        />

        <div className="flex flex-col gap-2">
          {match.conversationId && (
            <button
              onClick={onMessage}
              className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Enviar mensaje
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-gray-300 py-3 font-medium text-gray-600 transition hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
          >
            Seguir descubriendo
          </button>
        </div>
      </div>
    </div>
  );
}
