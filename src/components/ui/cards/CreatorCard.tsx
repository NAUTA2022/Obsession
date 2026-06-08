import { cn } from "../../../utils/cn";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { ROUTES } from "../../../constants/routes";

interface CreatorCardProps {
  id: string | number;
  username?: string;
  name: string;
  description: string;
  imageUrl?: string;
  followers?: number;
  className?: string;
}

export default function CreatorCard({
  id,
  username,
  name,
  description,
  imageUrl,
  followers = 0,
  className,
}: CreatorCardProps) {
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate(`/creators/${id}`);
  };

  const handleContact = () => {
    const target = username ?? String(id);
    navigate(`${ROUTES['client-inbox']}?creator=${target}`);
  };

  return (
    <div
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/60 hover:shadow-[0_24px_50px_-20px_rgba(104,80,232,0.45)] dark:border-white/10 dark:bg-gray-900',
        className,
      )}
    >
      {/* Cover */}
      <div className="relative h-36 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={`Portada de ${name}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        {followers > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm">
            {followers >= 1000 ? `${(followers / 1000).toFixed(1)}k` : followers} fans
          </span>
        )}
      </div>

      {/* Avatar superpuesto (fuera del cover para que no lo recorte el overflow-hidden) */}
      <img
        src={imageUrl}
        alt={`Avatar de ${name}`}
        className="absolute left-3 top-36 z-10 h-12 w-12 -translate-y-1/2 rounded-xl border-2 border-white object-cover shadow-md dark:border-gray-900"
      />

      <div className="flex flex-1 flex-col gap-1.5 p-3 pt-7">
        <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</span>
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {description}
        </p>
        <div className="mt-1 flex flex-col gap-1.5">
          <button
            onClick={handleViewMore}
            className="w-full rounded-full border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Ver más
          </button>
          <button
            onClick={handleContact}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary-600 hover:bg-primary-700 px-2.5 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_-8px_rgba(104,80,232,0.8)] transition-all hover:shadow-[0_12px_26px_-8px_rgba(104,80,232,0.9)]"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Contactar
          </button>
        </div>
      </div>
    </div>
  );
}
