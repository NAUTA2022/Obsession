import { useState } from 'react';
import { SellerCard } from '../components/ui/cards';
import { images } from '../config/assets';

const sellersData = [
    {
        id: 1,
        username: 'Santiago Zapata',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '5/10',
        quotaValue: 5,
        quotaMax: 10,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 2,
        username: 'Juan Perez',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 3,
        username: 'Maria Lopez',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 4,
        username: 'Pedro Rodriguez',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 5,
        username: 'Ana Garcia',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 6,
        username: 'Luis Rodriguez',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 7,
        username: 'Ana Garcia',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 8,
        username: 'Juan Perez',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 9,
        username: 'Maria Lopez',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 10,
        username: 'Pedro Rodriguez',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 11,
        username: 'Ana Garcia',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
    {
        id: 12,
        username: 'Luis Rodriguez',
        description: 'Esta es una breve descripción del vendedor y sus habilidades principales.',
        languages: 7,
        sales: 500,
        quota: '3/15',
        quotaValue: 3,
        quotaMax: 15,
        isAvailable: true,
        coverImage: images.bgImage,
        profileImage: images.sampleProfile,
    },
];

export default function SalesPeoplePage() {
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const filteredSellers = sellersData.filter(seller =>
        seller.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalEntries = filteredSellers.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const startEntry = (currentPage - 1) * entriesPerPage + 1;
    const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);
    const currentSellers = filteredSellers.slice(startEntry - 1, endEntry);

    const handleHire = (_sellerId: number) => {};

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className=" bg-white  rounded-lg shadow-sm min-h-screen">
            <div className="mb-6 border-b border-gray-200 p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendedores</h1>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show</span>
                            <select
                                value={entriesPerPage}
                                onChange={(e) => {
                                    setEntriesPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-300 rounded-lg pl-2 pr-4 py-2 text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium w-full sm:w-auto">
                        Mis vendedores
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4 px-4 ">
                {currentSellers.map((seller) => (
                    <SellerCard
                        key={seller.id}
                        username={seller.username}
                        description={seller.description}
                        languages={seller.languages}
                        sales={seller.sales}
                        quota={seller.quota}
                        quotaValue={seller.quotaValue}
                        quotaMax={seller.quotaMax}
                        isAvailable={seller.isAvailable}
                        coverImage={seller.coverImage}
                        profileImage={seller.profileImage}
                        onHire={() => handleHire(seller.id)}
                    />
                ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 pb-4">
                <div className="text-sm text-gray-600">
                    Showing {startEntry} to {endEntry} of {totalEntries} entries
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1">
                    <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &lt;&lt;
                    </button>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &lt;
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`px-3 py-1 text-sm border rounded ${currentPage === pageNum
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &gt;
                    </button>
                    <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &gt;&gt;
                    </button>
                </div>
            </div>
        </div>
    );
}