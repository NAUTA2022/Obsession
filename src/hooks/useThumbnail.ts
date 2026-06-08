import { useState, useCallback } from 'react';

export interface ThumbnailOptions {
    maxSize: number;
    quality: number;
    format: 'jpeg' | 'png' | 'webp';
}

export function useThumbnail() {
    const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());

    const generateThumbnail = useCallback((file: File, options: Partial<ThumbnailOptions> = {}): Promise<string> => {
        const {
            maxSize = 500,
            quality = 0.95,
            format = 'jpeg'
        } = options;

        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                const video = document.createElement('video');
                video.onloadedmetadata = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Error obtaining canvas context'));
                        return;
                    }

                    canvas.width = maxSize;
                    canvas.height = maxSize;
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    video.currentTime = 0;
                    video.onseeked = () => {
                        ctx.drawImage(video, 0, 0, maxSize, maxSize);
                        const thumbnail = canvas.toDataURL(`image/${format}`, quality);
                        resolve(thumbnail);
                    };
                };
                video.onerror = () => reject(new Error('Error loading video'));
                video.src = URL.createObjectURL(file);
            } else {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Error obtaining canvas context'));
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    const thumbnail = canvas.toDataURL(`image/${format}`, quality);
                    resolve(thumbnail);
                };
                img.onerror = () => reject(new Error('Error loading image'));
                img.src = URL.createObjectURL(file);
            }
        });
    }, []);

    const generateGalleryThumbnail = useCallback((file: File): Promise<string> => {
        return generateThumbnail(file, {
            maxSize: 500,
            quality: 0.95,
            format: 'jpeg'
        });
    }, [generateThumbnail]);
    const generatePreviewThumbnail = useCallback((file: File): Promise<string> => {
        return generateThumbnail(file, {
            maxSize: 200,
            quality: 0.9,
            format: 'jpeg'
        });
    }, [generateThumbnail]);

    const addThumbnail = useCallback((fileId: string, thumbnail: string) => {
        setThumbnails(prev => new Map(prev).set(fileId, thumbnail));
    }, []);

    const getThumbnail = useCallback((fileId: string) => {
        return thumbnails.get(fileId);
    }, [thumbnails]);

    const removeThumbnail = useCallback((fileId: string) => {
        setThumbnails(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
        });
    }, []);

    return {
        generateThumbnail,
        generateGalleryThumbnail,
        generatePreviewThumbnail,
        addThumbnail,
        getThumbnail,
        removeThumbnail,
        thumbnails
    };
}
