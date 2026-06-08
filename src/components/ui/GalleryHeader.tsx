import Button from './Button';
import { Upload } from 'lucide-react';

export interface GalleryHeaderProps {
    title: string;
    onUploadClick: () => void;
    uploadButtonText?: string;
    className?: string;
}

export default function GalleryHeader({ 
    title, 
    onUploadClick, 
    uploadButtonText = "Subir archivo",
    className = ""
}: GalleryHeaderProps) {
    return (
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 ${className}`}>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <Button 
                onClick={onUploadClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
                <Upload className="w-5 h-5" />
                {uploadButtonText}
            </Button>
        </div>
    );
}
