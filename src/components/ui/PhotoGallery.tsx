import React, { useState, useEffect } from 'react'

interface PhotoGalleryProps {
    images: string[];
}

export default function PhotoGallery({ images }: PhotoGalleryProps) {
    const [currentPage, setCurrentPage] = useState(0)
    const [imagesPerPage, setImagesPerPage] = useState(6)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    useEffect(() => {
        const updateImagesPerPage = () => {
            if (window.innerWidth < 640) {
                setImagesPerPage(1)
            } else {
                setImagesPerPage(6)
            }
        }
        updateImagesPerPage()
        window.addEventListener('resize', updateImagesPerPage)
        return () => window.removeEventListener('resize', updateImagesPerPage)
    }, [])

    useEffect(() => {
        const totalPages = Math.ceil(images.length / imagesPerPage)
        if (currentPage >= totalPages) {
            setCurrentPage(0)
        }
    }, [imagesPerPage, images.length, currentPage])

    const totalPages = Math.ceil(images.length / imagesPerPage)
    const handlePageChange = (pageIndex: number) => setCurrentPage(pageIndex)

    const startIndex = currentPage * imagesPerPage
    const currentImages = images.slice(startIndex, startIndex + imagesPerPage)

    const handleImageClick = (image: string) => {
        setSelectedImage(image)
    }

    const handleCloseModal = () => {
        setSelectedImage(null)
    }

    return (
        <>
            <div className='bg-white border border-gray-200 rounded-xl h-full flex flex-col justify-between shadow-sm'>
                <div className='flex items-center border-b border-gray-200'>
                    <h1 className="text-xl font-semibold px-4 py-2 text-gray-900">Gallery</h1>
                </div>
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
                <div className="flex justify-center items-center py-4 space-x-2">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentPage
                                ? 'bg-[#7B5CF6] scale-110'
                                : 'bg-gray-300 hover:bg-[#7B5CF6]'
                                }`}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Modal para imagen ampliada */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
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
    )
}
