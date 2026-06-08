import React from 'react';
import { cn } from '../../../utils/cn';

export type StatCardProps = {
  icon?: React.ReactNode;
  value: number | string;
  label: string;
  className?: string;
};

export default function StatCard({ icon, value, label, className }: StatCardProps) {
  return (
    <div className={cn('flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200', className)}>
      <div className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6F5AF6] to-[#3CA1FF] text-white shadow'>
        {icon}
      </div>
      <div className='min-w-0'>
        <div className='text-base font-semibold leading-tight'>{value}</div>
        <div className='truncate text-xs text-gray-500'>{label}</div>
      </div>
    </div>
  );
}


