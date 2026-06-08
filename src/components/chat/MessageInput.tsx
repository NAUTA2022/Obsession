import React, { useState, useRef } from 'react';
import Button from '../ui/Button';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendFile?: (file: File) => Promise<void>;
  disabled?: boolean;
  onTyping?: () => void;
}

// Tamaños máximos (igual que el backend)
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 100;
const MAX_DOC_MB   = 20;

const IMAGE_ACCEPT  = 'image/jpeg,image/png,image/gif,image/webp';
const VIDEO_ACCEPT  = 'video/mp4,video/quicktime,video/webm,video/x-msvideo';
const DOC_ACCEPT    = '.pdf,.doc,.docx,.xls,.xlsx,.txt';

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendFile,
  disabled = false,
  onTyping,
}) => {
  const [message, setMessage]           = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading]   = useState(false);
  const [uploadError, setUploadError]   = useState<string | null>(null);

  const attachInputRef = useRef<HTMLInputElement>(null);

  // ─── Validar archivo seleccionado ─────────────────────────────────────────

  const validateAndSelect = (file: File) => {
    setUploadError(null);

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const maxMb   = isImage ? MAX_IMAGE_MB : isVideo ? MAX_VIDEO_MB : MAX_DOC_MB;
    const maxBytes = maxMb * 1024 * 1024;

    if (file.size > maxBytes) {
      setUploadError(`El archivo supera el límite de ${maxMb} MB para este tipo.`);
      console.warn(`[Chat] Archivo rechazado: ${file.name} (${formatBytes(file.size)}) supera ${maxMb} MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
    // Limpiar el input para que vuelva a disparar onChange si eligen el mismo archivo
    e.target.value = '';
  };

  // ─── Envío ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isUploading) return;

    if (selectedFile && onSendFile) {
      setIsUploading(true);
      setUploadError(null);
      try {
        await onSendFile(selectedFile);
        setSelectedFile(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al subir el archivo';
        setUploadError(msg);
        console.error(`[Chat] Error en upload:`, err);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const cancelFile = () => {
    setSelectedFile(null);
    setUploadError(null);
  };

  const canSend = !disabled && !isUploading && (!!message.trim() || !!selectedFile);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-lg">

      {/* Preview del archivo seleccionado */}
      {selectedFile && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
              {selectedFile.type.startsWith('image/') ? (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ) : selectedFile.type.startsWith('video/') ? (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={cancelFile}
              className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
              title="Cancelar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error de upload */}
      {uploadError && (
        <div className="px-4 pt-2">
          <p className="text-xs text-red-500">{uploadError}</p>
        </div>
      )}

      {/* Input principal */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4">

        {/* Input oculto único (imagen, video o documento) */}
        <input
          ref={attachInputRef}
          type="file"
          accept={`${IMAGE_ACCEPT},${VIDEO_ACCEPT},${DOC_ACCEPT}`}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); if (e.target.value) onTyping?.(); }}
            onKeyDown={handleKeyDown}
            placeholder={selectedFile ? 'Presiona Send para enviar el archivo...' : 'Write message'}
            disabled={disabled || isUploading || !!selectedFile}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-sm"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* Botón único de adjuntar (imagen, video o documento) */}
        <button
          type="button"
          onClick={() => attachInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Adjuntar archivo (imagen, video o documento)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Botón Send */}
        <Button
          type="submit"
          disabled={!canSend}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
        >
          {isUploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Send</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
