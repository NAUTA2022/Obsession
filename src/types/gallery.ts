export interface GalleryItem {
    id: number;
    type: 'image' | 'video';
    thumbnail?: string | null;
    name: string;
    size?: string;
    uploadedAt?: Date;
    description?: string;
    tags?: string[];
    category?: string;
}

export interface GalleryFilter {
    type?: 'all' | 'image' | 'video';
    category?: string;
    tags?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
}

export interface GalleryUploadOptions {
    allowedTypes: string[];
    maxFileSize: number; // en bytes
    multiple: boolean;
    accept: string;
}
