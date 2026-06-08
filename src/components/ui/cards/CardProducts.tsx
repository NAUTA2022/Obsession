import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Pencil, Link2, ExternalLink, Package, Layers, Wrench, Crown, ImageIcon, Video } from "lucide-react";
import { cn } from "../../../utils/cn";

type ProductType = 'Membresía' | 'Común' | 'Servicio' | 'Producto' | 'Paquete';

type CardProductsProps = {
    productImage: string | null;
    title: string;
    description: string;
    price: number;
    type: ProductType;
    photoCount?: number;
    videoCount?: number;
    onEdit?: () => void;
    onCopyLink?: () => void;
    onClick?: () => void;
    productLink?: string;
    className?: string;
    badge?: string;
};

const TYPE_CONFIG: Record<ProductType, {
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
}> = {
    Servicio:  { label: 'Servicio',  icon: <Wrench  className="w-3 h-3" />, color: 'text-violet-400', bg: 'bg-violet-500/15',  border: 'border-violet-500/25' },
    Producto:  { label: 'Producto',  icon: <Package className="w-3 h-3" />, color: 'text-blue-400',   bg: 'bg-blue-500/15',    border: 'border-blue-500/25'   },
    Paquete:   { label: 'Paquete',   icon: <Layers  className="w-3 h-3" />, color: 'text-emerald-400',bg: 'bg-emerald-500/15', border: 'border-emerald-500/25'},
    Membresía: { label: 'Membresía', icon: <Crown   className="w-3 h-3" />, color: 'text-amber-400',  bg: 'bg-amber-500/15',   border: 'border-amber-500/25'  },
    Común:     { label: 'Común',     icon: <Package className="w-3 h-3" />, color: 'text-blue-400',   bg: 'bg-blue-500/15',    border: 'border-blue-500/25'   },
};

export default function CardProducts({
    productImage,
    title,
    description,
    price,
    type,
    photoCount,
    videoCount,
    onEdit,
    onClick,
    productLink,
    badge,
    className,
}: CardProductsProps) {
    const [copied, setCopied] = useState(false);
    const [hovered, setHovered] = useState(false);
    const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG['Común'];

    const handleCopyLink = () => {
        const url = productLink ?? window.location.href;
        navigator.clipboard.writeText(url).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                'group relative flex flex-col rounded-3xl overflow-hidden',
                'bg-white dark:bg-[#111118]',
                'border border-gray-100 dark:border-white/[0.06]',
                'shadow-sm hover:shadow-xl hover:shadow-black/[0.08] dark:hover:shadow-black/30',
                'transition-shadow duration-300',
                className
            )}
        >
            {/* ── Image area (clickeable para abrir detalle) ── */}
            <div className="relative overflow-hidden aspect-[4/3] cursor-pointer" onClick={onClick}>
                {productImage ? (
                    <motion.img
                        src={productImage}
                        alt={title}
                        animate={{ scale: hovered ? 1.05 : 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/[0.04] dark:to-white/[0.02] flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-2xl ${cfg.bg} ${cfg.color} flex items-center justify-center`}>
                            <span className="scale-150">{cfg.icon}</span>
                        </div>
                    </div>
                )}

                {/* Bottom gradient for text */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Type pill — top left */}
                <div className={`absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    {cfg.icon}
                    {cfg.label}
                </div>

                {/* Touch/external badge — top right */}
                {badge ? (
                    <span className="absolute top-2.5 right-2.5 bg-[#6850E8] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {badge}
                    </span>
                ) : (
                    <button
                        onClick={handleCopyLink}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                        title="Copiar link"
                    >
                        <ExternalLink className="w-3 h-3" />
                    </button>
                )}

                {/* Price — bottom left on image */}
                <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-white font-black text-lg leading-none drop-shadow-md">
                        ${price}
                    </span>
                    <span className="text-white/60 text-[11px] font-medium ml-1">USD</span>
                </div>

                {/* Media counters — bottom right */}
                {((photoCount ?? 0) > 0 || (videoCount ?? 0) > 0) && (
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1">
                        {(photoCount ?? 0) > 0 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold">
                                <ImageIcon className="w-2.5 h-2.5" />{photoCount}
                            </span>
                        )}
                        {(videoCount ?? 0) > 0 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold">
                                <Video className="w-2.5 h-2.5" />{videoCount}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Content ── */}
            <div className="flex flex-col gap-3 p-4 flex-1">
                <div className="cursor-pointer" onClick={onClick}>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-1">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-white/35 mt-1 leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto">
                    {onEdit && (
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={onEdit}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.05] hover:bg-[#6850E8] hover:text-white dark:hover:bg-[#6850E8] text-gray-600 dark:text-white/50 text-xs font-semibold transition-all duration-200 border border-gray-100 dark:border-white/[0.06]"
                        >
                            <Pencil className="w-3 h-3" />
                            Editar
                        </motion.button>
                    )}

                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={handleCopyLink}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                            onEdit ? 'w-10 px-2.5 flex-shrink-0' : 'flex-1 px-3'
                        } ${
                            copied
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                : 'bg-gray-50 dark:bg-white/[0.05] border-gray-100 dark:border-white/[0.06] text-gray-500 dark:text-white/40 hover:bg-[#6850E8] hover:border-[#6850E8] hover:text-white dark:hover:bg-[#6850E8] dark:hover:text-white'
                        }`}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {copied ? (
                                <motion.span
                                    key="check"
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.7, opacity: 0 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <Check className="w-3 h-3" />
                                    {!onEdit && 'Copiado'}
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="link"
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.7, opacity: 0 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <Link2 className="w-3 h-3" />
                                    {!onEdit && 'Copiar link'}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
