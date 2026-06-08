import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { GalleryHeader, GalleryGrid, FileDetailsModal, FileUploadModal } from '../components/ui';
import { Image, Video } from 'lucide-react';
import type { GalleryItemProps } from '../components/ui/GalleryItem';

export default function GalleryPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedFile, setSelectedFile] = useState<GalleryItemProps | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [galleryItems, setGalleryItems] = useState<GalleryItemProps[]>(
        Array.from({ length: 12 }, (_, index) => ({
            id: index + 1,
            type: index < 8 ? 'image' : 'video',
            thumbnail: null,
            name: `Archivo ${index + 1}`,
            size: `${Math.floor(Math.random() * 10) + 1}MB`,
            uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }))
    );

    const tabs = [
        { value: 'all', label: 'All', icon: null },
        { value: 'images', label: 'Imágenes', icon: Image },
        { value: 'videos', label: 'Videos', icon: Video }
    ];

    const handleFileUpload = () => {
        setIsUploadModalOpen(true);
    };

    const handleUploadFiles = (newFiles: GalleryItemProps[]) => {
        setGalleryItems(prev => [...newFiles, ...prev]);
        setIsUploadModalOpen(false);
    };

    const handleItemClick = (item: GalleryItemProps) => {
        setSelectedFile(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
    };

    const handleDownload = (_file: GalleryItemProps) => {};

    const handleEdit = (_file: GalleryItemProps) => {};

    const handleDelete = (file: GalleryItemProps) => {
        setGalleryItems(prev => prev.filter(item => item.id !== file.id));
        handleCloseModal();
    };

    const getFilteredItems = (type: 'all' | 'image' | 'video') => {
        if (type === 'all') return galleryItems;
        return galleryItems.filter(item => item.type === type);
    };

    return (
        <div className="min-h-screen bg-white p-4 sm:p-6">
            <div className="mx-auto">
                {/* Header */}
                <GalleryHeader
                    title="Galeria"
                    onUploadClick={handleFileUpload}
                />

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        {tabs.map((tab) => (
                            <TabsTrigger 
                                key={tab.value} 
                                value={tab.value}
                                className="flex items-center gap-2 py-3"
                            >
                                {tab.icon && <tab.icon className="w-4 h-4" />}
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Tab Content - All */}
                    <TabsContent value="all" className="mt-0">
                        <GalleryGrid 
                            items={getFilteredItems('all')}
                            onItemClick={handleItemClick}
                        />
                    </TabsContent>

                    {/* Tab Content - Images */}
                    <TabsContent value="images" className="mt-0">
                        <GalleryGrid 
                            items={getFilteredItems('image')}
                            onItemClick={handleItemClick}
                        />
                    </TabsContent>

                    {/* Tab Content - Videos */}
                    <TabsContent value="videos" className="mt-0">
                        <GalleryGrid 
                            items={getFilteredItems('video')}
                            onItemClick={handleItemClick}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de Detalles del Archivo */}
            <FileDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                file={selectedFile}
                onDownload={handleDownload}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Modal de Subida de Archivos */}
            <FileUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadFiles}
                acceptedTypes={['image/*', 'video/*']}
                maxFileSize={50}
                multiple={true}
            />
        </div>
    );
}