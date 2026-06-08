import { cn } from "../../../utils/cn";
import { useState } from "react";
import SellerModal from "./SellerModal";
import CancelCollaborationModal from "./CancelCollaborationModal";

type SellerCardProps = {
    username: string;
    description: string;
    languages: number;
    sales: number;
    quota: string;
    quotaValue: number;
    quotaMax: number;
    isAvailable: boolean;
    coverImage?: string;
    profileImage?: string;
    onHire?: () => void;
    className?: string;
};

export default function SellerCard({
    username,
    description,
    languages,
    sales,
    quota,
    quotaValue,
    quotaMax,
    isAvailable,
    coverImage,
    profileImage,
    onHire,
    className,
}: SellerCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isHired, setIsHired] = useState(false);
    const quotaPercentage = (quotaValue / quotaMax) * 100;
    const isQuotaLow = quotaPercentage <= 50;
    
    const handleHireClick = () => {
        if (!isHired) {
            setIsModalOpen(true);
        } else {
            setIsCancelModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const closeCancelModal = () => {
        setIsCancelModalOpen(false);
    };

    const handleHireFromModal = () => {
        if (!isHired) {
            setIsHired(true);
            onHire?.();
        }
    };

    const handleCancelFromModal = () => {
        setIsHired(false);
        closeCancelModal();
    };
    
    return (
        <>
            <div className={cn('flex flex-col w-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100', className)}>
                <div className='relative h-32 w-full bg-gray-200'>
                    {coverImage ? (
                        <img
                            src={coverImage}
                            alt="Portada del vendedor"
                            className='w-full h-full object-cover'
                        />
                    ) : (
                        <div className='w-full h-full bg-gradient-to-r from-blue-400 to-purple-500'></div>
                    )}
                    <div className='absolute -bottom-12 left-1/2 transform -translate-x-1/2'>
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt={`Foto de perfil de ${username}`}
                                className='w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover'
                            />
                        ) : (
                            <div className='w-24 h-24 bg-gray-300 rounded-full border-4 border-white shadow-lg'></div>
                        )}
                    </div>
                </div>  
                <div className='flex flex-col gap-3 p-4 pt-16'>
                    <h3 className='font-semibold text-gray-900 text-base'>{username}</h3>
                    <p className='text-sm text-gray-600 leading-tight line-clamp-2'>{description}</p>
                    <div className='flex justify-between items-center rounded-lg p-3 sm:p-4 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-100'>
                        <div className='text-center flex flex-col items-center flex-1 min-w-0'>
                            <div className='text-lg sm:text-xl font-bold text-gray-800'>{languages}</div>
                            <div className='text-xs text-gray-600 font-medium'>Idiomas</div>
                        </div>
                        <div className='w-px h-6 sm:h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-1 sm:mx-2'></div>
                        <div className='text-center flex flex-col items-center flex-1 min-w-0'>
                            <div className='text-lg sm:text-xl font-bold text-gray-800'>{sales}</div>
                            <div className='text-xs text-gray-600 font-medium'>Ventas</div>
                        </div>
                        <div className='w-px h-6 sm:h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-1 sm:mx-2'></div>
                        <div className='text-center flex flex-col items-center flex-1 min-w-0'>
                            <div className='text-lg sm:text-xl font-bold text-gray-800'>{quota}</div>
                            <div className='text-xs text-gray-600 font-medium'>Cupo</div>
                        </div>
                    </div>
                    <button
                        onClick={handleHireClick}
                        disabled={!isAvailable}
                        className={cn(
                            'w-full py-2 px-4 rounded-lg font-medium transition-colors',
                            isAvailable 
                                ? isHired
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : isQuotaLow
                                        ? 'bg-[#487FFF] text-white hover:bg-blue-700'
                                        : 'bg-blue-400 text-white hover:bg-blue-500'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        )}
                    >
                        {isHired ? "Cancelar Colaboración" : "Contratar"}
                    </button>
                </div>
            </div>
            <SellerModal
                isOpen={isModalOpen}
                onClose={closeModal}
                username={username}
                description={description}
                languages={languages}
                sales={sales}
                quota={quota}
                coverImage={coverImage}
                profileImage={profileImage}
                onHire={handleHireFromModal}
                onCancel={handleCancelFromModal}
                isHired={isHired}
            />
            <CancelCollaborationModal
                isOpen={isCancelModalOpen}
                onClose={closeCancelModal}
                username={username}
                profileImage={profileImage}
                onConfirm={handleCancelFromModal}
            />
        </>
    );
}
