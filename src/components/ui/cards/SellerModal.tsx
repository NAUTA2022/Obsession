import Modal from "../Modal";
import { cn } from "../../../utils/cn";

interface SellerModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    description: string;
    languages: number;
    sales: number;
    quota: string;
    coverImage?: string;
    profileImage?: string;
    onHire?: () => void;
    onCancel?: () => void;
    isHired: boolean;
}

export default function SellerModal({
    isOpen,
    onClose,
    username,
    description,
    languages,
    sales,
    quota,
    coverImage,
    profileImage,
    onHire,
    onCancel,
    isHired
}: SellerModalProps) {
    const handleHire = () => {
        if (!isHired) {
            onHire?.();
            onClose();
        } else {
            onCancel?.();
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="relative h-32 w-full bg-gray-200">
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

            <div className="flex flex-col gap-4 p-6 pt-16">
                <h3 className="font-semibold text-gray-900 text-lg text-center">{username}</h3>
                <p className="text-sm text-gray-600 text-center leading-tight">{description}</p>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-800">{languages}</div>
                            <div className="text-xs text-gray-600 font-medium">Idiomas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-800">{sales}</div>
                            <div className="text-xs text-gray-600 font-medium">Ventas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-800">{quota}</div>
                            <div className="text-xs text-gray-600 font-medium">Cupo</div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-sm font-semibold text-gray-800">05/12/2022</div>
                            <div className="text-xs text-gray-600">Desde</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold text-gray-800">20%</div>
                            <div className="text-xs text-gray-600">Comisión</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold text-gray-800">4/5</div>
                            <div className="text-xs text-gray-600">Calificación</div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleHire}
                    className={cn(
                        "w-full py-3 px-4 rounded-lg font-medium transition-colors",
                        isHired 
                            ? "bg-red-600 text-white hover:bg-red-700" 
                            : "bg-[#487FFF] text-white hover:bg-blue-700"
                    )}
                >
                    {isHired ? "Cancelar Colaboración" : "Contratar"}
                </button>
            </div>
        </Modal>
    );
}
