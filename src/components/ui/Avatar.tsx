import { useState } from 'react';
import { User } from 'lucide-react';

type AvatarProps = {
  src?: string | null;
  alt?: string;
  /** Texto/iniciales a mostrar si no hay imagen. Tiene prioridad sobre `name`. */
  fallback?: string;
  /** Nombre del usuario; se derivan iniciales si no se pasa `fallback`. */
  name?: string;
  /** Tamaño en px (si no se controla por className). */
  size?: number;
  className?: string;
};

function deriveInitials(name?: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Avatar con placeholder de "sin usuario": si no hay `src` o la imagen falla al
 * cargar, muestra iniciales (de `fallback`/`name`) o, en su defecto, un ícono de
 * usuario en un círculo gris — en vez de una imagen rota.
 */
export default function Avatar({ src, alt = 'avatar', fallback, name, size = 32, className = '' }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const valid = !!src && !errored;
  const initials = fallback ?? deriveInitials(name);
  const dimension = `${size}px`;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300 ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {valid ? (
        <img
          src={src as string}
          alt={alt}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2" />
      )}
    </div>
  );
}
