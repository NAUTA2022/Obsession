import { useState, useRef } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Upload, X, Image, Video, File,} from 'lucide-react';
import type { GalleryItemProps } from './GalleryItem';
import { useThumbnail } from '../../hooks/useThumbnail';

export interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: GalleryItemProps[]) => void;
    acceptedTypes?: string[];
    maxFileSize?: number; // en MB
    multiple?: boolean;
}

export default function FileUploadModal({
    isOpen,
    onClose,
    onUpload,
    acceptedTypes = ['image/*', 'video/*'],
    maxFileSize = 50, 
    multiple = true
}: FileUploadModalProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { generateGalleryThumbnail, generatePreviewThumbnail, addThumbnail, getThumbnail } = useThumbnail();

    const handleFileSelect = async (files: FileList | null) => {
        if (!files) return;
        
        const validFiles = Array.from(files).filter(file => {
            const isValidType = acceptedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.slice(0, -1));
                }
                return file.type === type;
            });
            const isValidSize = file.size <= maxFileSize * 1024 * 1024;

            return isValidType && isValidSize;
        });
        for (const file of validFiles) {
            try {
                const thumbnail = await generateGalleryThumbnail(file);
                const fileId = `${file.name}-${file.size}-${file.lastModified}`;
                addThumbnail(fileId, thumbnail);
            } catch (error) {
                console.error('Error al generar miniatura:', error);
            }
        }

        setSelectedFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const removeFile = (index: number) => {
        const file = selectedFiles[index];
        if (file) {
            const fileId = `${file.name}-${file.size}-${file.lastModified}`;
        }
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const galleryItems: GalleryItemProps[] = selectedFiles.map((file, index) => {
                const fileId = `${file.name}-${file.size}-${file.lastModified}`;
                const thumbnail = getThumbnail(fileId);
                
                return {
                    id: Date.now() + index,
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    name: file.name,
                    size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
                    uploadedAt: new Date(),
                    thumbnail: thumbnail || null
                };
            });

            onUpload(galleryItems);
            setSelectedFiles([]);
            onClose();
        } catch (error) {
            console.error('Error al subir archivos:', error);
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
        if (file.type.startsWith('video/')) return <Video className="w-8 h-8 text-red-500" />;
        return <File className="w-8 h-8 text-gray-500" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFilePreview = (file: File) => {
        const fileId = `${file.name}-${file.size}-${file.lastModified}`;
        const thumbnail = getThumbnail(fileId);
        
        if (thumbnail) {
            return (
                <img 
                    src={thumbnail} 
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded-lg"
                />
            );
        }
        
        return getFileIcon(file);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Subir Archivos</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                        Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        Tipos soportados: Imágenes y Videos • Tamaño máximo: {maxFileSize}MB
                    </p>
                    <p className="text-xs text-blue-600 mb-2">
                    </p>
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="mx-auto"
                    >
                        Seleccionar Archivos
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple={multiple}
                        accept={acceptedTypes.join(',')}
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                    />
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Archivos Seleccionados ({selectedFiles.length})
                        </h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        {getFilePreview(file)}
                                        <div>
                                            <p className="font-medium text-gray-900">{file.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        disabled={uploading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploading}
                        className="min-w-[120px]"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Subir Archivos
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
