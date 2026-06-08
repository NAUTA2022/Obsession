import type { PaginationProps } from '../../types/contacts';
import { icons } from '../../config/icons';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 lg:px-6 py-3 lg:py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
        <span className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 text-center sm:text-left">
          Mostrando {startItem} a {endItem} de {totalItems} entradas
        </span>
      </div>

      <div className="flex items-center justify-center space-x-1 lg:space-x-2">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1 sm:p-2 lg:p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <icons.chevronsLeft className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 sm:p-2 lg:p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <icons.chevronLeft className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1 lg:space-x-2">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-xs sm:text-sm lg:text-base font-medium rounded-md ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 sm:p-2 lg:p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <icons.chevronRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1 sm:p-2 lg:p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <icons.chevronsRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </button>
      </div>
    </div>
  );
}
