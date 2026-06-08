import * as React from "react";
import { Camera, User } from "lucide-react";

type ProfileImageUploaderProps = {
  initialSrc?: string;
  size?: number;
  hasEditButton?: boolean;
  onChange?: (file: File | null, previewUrl: string | null) => void;
  onImageChange?: (file: File) => void | Promise<void>;
  className?: string;
};

export default function ProfileImageUploader({
  initialSrc,
  size = 140,
  onChange,
  onImageChange,
  hasEditButton = true,
  className,
}: ProfileImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | undefined>(initialSrc);
  const [errored, setErrored] = React.useState(false);
  const dimension = `${size}px`;
  const badgeSize = Math.max(24, Math.round(size * 0.30));
  const badgeDimension = `${badgeSize}px`;
  const iconSize = Math.max(12, Math.round(badgeSize * 0.52));

  // Actualizar preview cuando cambie initialSrc
  React.useEffect(() => {
    setPreview(initialSrc);
    setErrored(false);
  }, [initialSrc]);

  // Limpia blobs previos para no filtrar memoria
  React.useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const openPicker = () => inputRef.current?.click();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      onChange?.(null, null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
    onChange?.(file, url);

    // Llamar al callback onImageChange si existe
    if (onImageChange) {
      await onImageChange(file);
    }
  };

  return (
    <div className={className}>
      <div
        className="relative inline-block"
        style={{ width: dimension, height: dimension }}
      >
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 dark:border-white/10">
          {preview && !errored ? (
            <img
              src={preview}
              alt="Profile"
              onError={() => setErrored(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-400 to-purple-600 dark:from-[#6850E8]/80 dark:to-purple-700 text-white">
              <User className="h-1/2 w-1/2" />
            </div>
          )}
        </div>

        {/* Botón cámara proporcional al avatar */}
        {hasEditButton && (
          <button
            type="button"
            aria-label="Cambiar foto de perfil"
            onClick={openPicker}
            style={{ width: badgeDimension, height: badgeDimension }}
            className="absolute bottom-0 right-0 z-20 flex items-center justify-center rounded-full border-2 border-white dark:border-[#111118] bg-[#6850E8] text-white shadow-md hover:bg-[#5a44d4] transition-colors"
          >
            <Camera size={iconSize} />
          </button>
        )}

        {/* Overlay clickeable dentro del círculo, debajo del botón */}
        <button
          type="button"
          aria-label="Seleccionar nueva imagen"
          onClick={hasEditButton ? openPicker : undefined}
          className="absolute inset-0 z-10 bg-transparent"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
