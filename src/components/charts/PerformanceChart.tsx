import ReactApexChart from 'react-apexcharts';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export type PerformanceChartProps = {
    title: string;
    data: number[];
    categories: string[];
    selectedPeriod?: string;
    onPeriodChange?: (period: string) => void;
    className?: string;
};

export default function PerformanceChart({
    title,
    data,
    categories,
    selectedPeriod = 'November',
    onPeriodChange,
    className,
}: PerformanceChartProps) {
    const chartOptions = {
        chart: {
            type: 'line' as const,
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        stroke: {
            curve: 'smooth' as const,
            width: 3,
        },
        colors: ['#6F5AF6'],
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 5,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        xaxis: {
            categories,
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                },
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                },
                formatter: (value: number) => {
                    if (value >= 1000) {
                        return (value / 1000).toFixed(0) + 'k';
                    }
                    return value.toString();
                },
            },
        },
        tooltip: {
            x: {
                show: false,
            },
            y: {
                formatter: (value: number) => value.toLocaleString(),
            },
            marker: {
                show: false,
            },
            style: {
                fontSize: '12px',
            },
        },
        markers: {
            size: 0,
            hover: {
                size: 6,
                sizeOffset: 3,
            },
        },
        dataLabels: {
            enabled: false,
        },
    };

    const series = [
        {
            name: 'Rendimiento',
            data,
        },
    ];

    return (
        <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-4', className)}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {onPeriodChange && (
                    <div className="relative">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => onPeriodChange(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#6F5AF6] focus:border-transparent"
                        >
                            <option value="November">November</option>
                            <option value="October">October</option>
                            <option value="September">September</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                )}
            </div>
            <div className="w-full">
                <ReactApexChart
                    options={chartOptions}
                    series={series}
                    type="line"
                    height={300}
                />
            </div>
        </div>
    );
}
