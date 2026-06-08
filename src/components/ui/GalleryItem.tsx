import { Image, Video, Play } from 'lucide-react';
import './GalleryItem.css';

export interface GalleryItemProps {
    id: number;
    type: 'image' | 'video';
    thumbnail?: string | null;
    name: string;
    size?: string;
    uploadedAt?: Date;
    onClick?: () => void;
}

export default function GalleryItem({ 
    type, 
    thumbnail, 
    name, 
    onClick 
}: GalleryItemProps) {
    return (
        <div 
            className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-200 hover:scale-105 group overflow-hidden relative"
            onClick={onClick}
        >
            {thumbnail ? (
                <div className="relative w-full h-full">
                    <img 
                        src={thumbnail} 
                        alt={name}
                        className="w-full h-full object-cover rounded-lg gallery-item-thumbnail"
                    />
                    {type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-12 h-12 text-white drop-shadow-lg" fill="white" />
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-xs text-white font-medium truncate">{name}</p>
                    </div>
                </div>
            ) : (
                <div className="text-center p-4">
                    {type === 'image' ? (
                        <Image className="w-16 h-16 text-gray-400 mx-auto mb-3 group-hover:text-gray-600 transition-colors" />
                    ) : (
                        <Video className="w-16 h-16 text-gray-400 mx-auto mb-3 group-hover:text-gray-600 transition-colors" />
                    )}
                    <p className="text-sm text-gray-600 font-medium group-hover:text-gray-800 transition-colors">
                        {name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                        {type === 'image' ? 'Imagen' : 'Video'}
                    </p>
                </div>
            )}
        </div>
    );
}
