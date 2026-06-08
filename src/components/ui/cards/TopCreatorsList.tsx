import { cn } from "../../../utils/cn";
import { useTranslation } from "../../../hooks/useTranslation";

type Creator = {
    id: string | number;
    rank: number;
    avatar: string;
    name: string;
};

type TopCreatorsListProps = {
    title: string;
    creators: Creator[];
    onViewProfile?: (creatorId: string | number) => void;
    className?: string;
};

export default function TopCreatorsList({
    title,
    creators,
    onViewProfile,
    className,
}: TopCreatorsListProps) {
    const { t } = useTranslation();
    return (
        <div className={cn('bg-white rounded-xl p-4 border border-gray-200', className)}>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
                {title}
            </h3>
            <div className="space-y-3">
                {creators.map((creator) => (
                    <div
                        key={creator.id}
                        className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-gray-900 min-w-[24px] sm:min-w-[30px]">
                                #{creator.rank}
                            </span>
                            
                            <img
                                src={creator.avatar}
                                alt={`Avatar de ${creator.name}`}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                            />
                            <span className="text-xs sm:text-sm text-gray-900 font-medium truncate">
                                {creator.name}
                            </span>
                        </div>
                        <button
                            onClick={() => onViewProfile?.(creator.id)}
                            className="px-2 sm:px-4 py-1.5 sm:py-2 bg-[#6F5AF6] text-white text-xs sm:text-sm font-medium rounded-full hover:bg-[#5A4BD9] transition-colors whitespace-nowrap"
                        >
                            {t('dashboard.viewProfile')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
