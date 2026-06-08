import React from 'react';
import { cn } from '../../../utils/cn';
import { ChevronDown } from 'lucide-react';

export type TableColumn = {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
};

export type TableRow = {
    [key: string]: string | number | React.ReactNode;
};

export type DataTableProps = {
    title: string;
    columns: TableColumn[];
    data: TableRow[];
    filterOptions?: string[];
    selectedFilter?: string;
    onFilterChange?: (filter: string) => void;
    className?: string;
};

export default function DataTable({
    title,
    columns,
    data,
    filterOptions = [],
    selectedFilter,
    onFilterChange,
    className,
}: DataTableProps) {
    return (
        <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
            <div className="flex items-center justify-between pt-4 px-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {filterOptions.length > 0 && (
                    <div className="relative">
                        <select
                            value={selectedFilter}
                            onChange={(e) => onFilterChange?.(e.target.value)}
                            className="appearance-none bg-white border text-center border-gray-300 rounded-full px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#6F5AF6] focus:border-transparent"
                        >
                            {filterOptions.map((option) => (
                                <option className=''  key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                )}
            </div>
            <div className="overflow-x-auto p-4 ">
                <table className="w-full  border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right',
                                        column.className
                                    )}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn(
                                            'px-4 py-3 text-sm text-gray-900',
                                            column.align === 'center' && 'text-center',
                                            column.align === 'right' && 'text-right',
                                            column.className
                                        )}
                                    >
                                        {row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
