import { cn } from "../../../utils/cn";
import { DollarSign } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

type CardInfoProps = {
    productImage: string;
    creatorAvatar: string;
    creatorName: string;
    description?: string;
    price?: number;
    lastMonthEarnings?: number;
    variant?: 'product' | 'competitor';
    onEdit?: () => void;
    onViewProfile?: () => void;
    className?: string;
};

export default function CardInfo({
    productImage,
    creatorAvatar,
    creatorName,
    description,
    price,
    lastMonthEarnings,
    variant = 'product',
    onEdit,
    onViewProfile,
    className,
}: CardInfoProps) {
    const { t } = useTranslation();
    const isCompetitor = variant === 'competitor';
    
    return (
        <div className={cn('flex flex-col w-full bg-white rounded-lg shadow-md overflow-hidden', className)}>
            <div className={cn('w-full overflow-hidden', isCompetitor ? 'h-36 sm:h-48' : 'h-28 sm:h-32')}>
                <img
                    src={productImage}
                    alt={isCompetitor ? `Imagen de ${creatorName}` : "Producto"}
                    className='w-full h-full object-cover object-center rounded-b-xl'
                />
            </div>
            <div className={cn('flex flex-col gap-1.5 p-2', isCompetitor ? 'min-h-[120px] sm:min-h-[128px] gap-2 p-2.5 sm:p-3' : 'min-h-[120px] sm:min-h-[128px] p-2.5')}>
                <div className='flex items-center gap-1.5'>
                    <img
                        src={creatorAvatar}
                        alt={`Avatar de ${creatorName}`}
                        className='w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0'
                    />
                    <span className='font-medium text-gray-900 text-xs sm:text-sm truncate'>{creatorName}</span>
                </div>
                {isCompetitor ? (
                    <div className='flex flex-col gap-1.5 flex-1'>
                        <div className='flex items-center gap-1.5 bg-green-100 text-green-700 px-2 py-1 rounded-full w-fit'>
                            <DollarSign className="w-3 h-3 flex-shrink-0" />
                            <span className='text-xs font-medium'>{t('dashboard.lastMonth')}</span>
                        </div>
                        <span className='text-sm sm:text-base font-semibold text-green-600'>
                            +${lastMonthEarnings?.toLocaleString()}
                        </span>
                    </div>
                ) : (
                    <>
                        <p className='text-xs sm:text-sm text-gray-600 leading-tight line-clamp-2 flex-1'>{description}</p>
                        <div className='text-xs sm:text-sm font-semibold'>
                            Price: <span className='text-[#6F5AF6]'>${price}</span>
                        </div>
                    </>
                )}
                <button
                    onClick={isCompetitor ? onViewProfile : onEdit}
                    className={cn(
                        'w-full py-1.5 sm:py-2 px-2.5 sm:px-3 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors text-xs sm:text-sm',
                        isCompetitor && 'font-medium mt-auto text-gray-700'
                    )}
                >
                    {isCompetitor ? t('dashboard.viewProfile') : t('dashboard.edit')}
                </button>
            </div>
        </div>
    );
}
