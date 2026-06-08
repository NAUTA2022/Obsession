import { useRef } from 'react';

interface VideoBubbleProps {
  src: string;
  createdAt: string;
  isOwn: boolean;
  formatTime: (date: string) => string;
}

export function VideoBubble({ src, createdAt, isOwn, formatTime }: VideoBubbleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const tailRadius = {
    borderBottomRightRadius: isOwn ? 4 : undefined,
    borderBottomLeftRadius: isOwn ? undefined : 4,
  };

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen();
  };

return (
    <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      {/* Video */}
      <div className="rounded-2xl overflow-hidden max-w-[280px] shadow-sm bg-gray-900" style={tailRadius}>
        <video
          ref={videoRef}
          src={src}
          controls
          controlsList="nofullscreen"
          className="block w-full max-h-64"
        />
      </div>

      {/* Barra de acciones: timestamp · fullscreen · descargar */}
      <div className={`flex items-center gap-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-1">
          {formatTime(createdAt)}
        </span>

        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Pantalla completa"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2" />
          </svg>
        </button>

      </div>
    </div>
  );
}
