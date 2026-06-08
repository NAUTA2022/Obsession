import Modal from "../Modal";
import { cn } from "../../../utils/cn";

interface CancelCollaborationModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    profileImage?: string;
    onConfirm: () => void;
}

export default function CancelCollaborationModal({
    isOpen,
    onClose,
    username,
    profileImage,
    onConfirm
}: CancelCollaborationModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="flex flex-col items-center p-6">
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt={`Foto de perfil de ${username}`}
                        className="w-20 h-20 rounded-full object-cover mb-4"
                    />
                ) : (
                    <div className="w-20 h-20 bg-gray-300 rounded-full mb-4"></div>
                )}
                <h3 className="text-lg font-bold text-gray-900 text-center mb-6">
                    ¿Deseas dejar de colaborar con @{username}?
                </h3>
                <div className="flex gap-3 w-full mb-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 border-2 border-orange-500 text-orange-500 bg-white rounded-lg font-medium hover:bg-orange-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 py-2 px-4 bg-[#487FFF] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Aceptar
                    </button>
                </div>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                    Las colaboraciones tienen una duración de 1 Mes. Si cancelas esta se vera cerrada una vez finalice el mes.
                </p>
            </div>
        </Modal>
    );
}
