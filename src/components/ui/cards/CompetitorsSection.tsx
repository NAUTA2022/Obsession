import { cn } from "../../../utils/cn";
import CardInfo from "./CardInfo";
import { useTranslation } from "../../../hooks/useTranslation";

type Competitor = {
    id: string | number;
    competitorImage: string;
    creatorAvatar: string;
    creatorName: string;
    lastMonthEarnings: number;
};

type CompetitorsSectionProps = {
    title: string;
    competitors: Competitor[];
    onViewAll?: () => void;
    onViewProfile?: (competitorId: string | number) => void;
    className?: string;
};

export default function CompetitorsSection({
    title,
    competitors,
    onViewAll,
    onViewProfile,
    className,
}: CompetitorsSectionProps) {
    const { t } = useTranslation();
    return (
        <div className={cn('bg-white rounded-xl p-3 sm:p-4 border border-gray-200', className)}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-xs sm:text-sm text-[#6F5AF6] hover:text-[#5A4BD9] font-medium transition-colors whitespace-nowrap"
                    >
                        {t('dashboard.seeAll')}
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {competitors.map((competitor) => (
                    <CardInfo
                        key={competitor.id}
                        productImage={competitor.competitorImage}
                        creatorAvatar={competitor.creatorAvatar}
                        creatorName={competitor.creatorName}
                        lastMonthEarnings={competitor.lastMonthEarnings}
                        variant="competitor"
                        onViewProfile={() => onViewProfile?.(competitor.id)}
                    />
                ))}
            </div>
        </div>
    );
}
