import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PurchaseGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  images: string[];
}

export default function PurchaseGalleryModal({ isOpen, onClose, title, images }: PurchaseGalleryModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [imagesPerPage, setImagesPerPage] = useState(6);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const updateImagesPerPage = () => {
      if (window.innerWidth < 640) {
        setImagesPerPage(1);
      } else {
        setImagesPerPage(6);
      }
    };
    updateImagesPerPage();
    window.addEventListener('resize', updateImagesPerPage);
    return () => window.removeEventListener('resize', updateImagesPerPage);
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(images.length / imagesPerPage);
    if (currentPage >= totalPages) {
      setCurrentPage(0);
    }
  }, [imagesPerPage, images.length, currentPage]);

  const totalPages = Math.ceil(images.length / imagesPerPage);
  const handlePageChange = (pageIndex: number) => setCurrentPage(pageIndex);

  const startIndex = currentPage * imagesPerPage;
  const currentImages = images.slice(startIndex, startIndex + imagesPerPage);

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-lg">
          {/* Header del modal */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Contenido del modal - mismo diseño que PhotoGallery */}
          <div className="flex flex-col justify-between h-full">
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl'>
              {currentImages.map((image, index) => (
                <div key={index} className="cursor-pointer" onClick={() => handleImageClick(image)}>
                  <img
                    src={image}
                    alt="Foto"
                    className="w-full h-[160px] sm:h-[180px] md:h-[200px] w900:h-[220px] w1280:h-[260px] h700:h-[170px] h800:h-[200px] h900:h-[250px] object-cover rounded-lg hover:opacity-80 transition-opacity" />
                </div>
              ))}
            </div>
            
            {/* Paginación - mismo diseño que PhotoGallery */}
            <div className="flex justify-center items-center py-4 space-x-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentPage
                    ? 'bg-[#7B5CF6] scale-110'
                    : 'bg-gray-300 hover:bg-[#7B5CF6]'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para imagen ampliada - mismo que PhotoGallery */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Botón X para cerrar */}
            <button
              onClick={handleCloseModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Imagen ampliada */}
            <img
              src={selectedImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
