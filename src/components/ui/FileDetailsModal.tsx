import Modal from './Modal';
import { Image, Video, Download, Trash2, Edit } from 'lucide-react';
import Button from './Button';
import type { GalleryItemProps } from './GalleryItem';

export interface FileDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: GalleryItemProps | null;
    onDownload?: (file: GalleryItemProps) => void;
    onEdit?: (file: GalleryItemProps) => void;
    onDelete?: (file: GalleryItemProps) => void;
}

export default function FileDetailsModal({
    isOpen,
    onClose,
    file,
    onDownload,
    onEdit,
    onDelete
}: FileDetailsModalProps) {
    if (!file) return null;

    const handleDownload = () => {
        onDownload?.(file);
        onClose();
    };

    const handleEdit = () => {
        onEdit?.(file);
        onClose();
    };

    const handleDelete = () => {
        onDelete?.(file);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Detalles del Archivo</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* File Preview */}
                <div className="mb-6">
                    <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4">
                        {file.thumbnail ? (
                            <img 
                                src={file.thumbnail} 
                                alt={file.name}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <div className="text-center">
                                {file.type === 'image' ? (
                                    <Image className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                ) : (
                                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                )}
                                <p className="text-sm text-gray-500">{file.name}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* File Information */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Nombre:</span>
                        <span className="text-sm text-gray-900">{file.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Tipo:</span>
                        <span className="text-sm text-gray-900 capitalize">{file.type}</span>
                    </div>
                    {file.size && (
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Tamaño:</span>
                            <span className="text-sm text-gray-900">{file.size}</span>
                        </div>
                    )}
                    {file.uploadedAt && (
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Subido:</span>
                            <span className="text-sm text-gray-900">
                                {file.uploadedAt.toLocaleDateString('es-ES')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={handleDownload}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                    </Button>
                    <Button
                        onClick={handleEdit}
                        variant="outline"
                        className="flex-1"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="danger"
                        className="flex-1"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
