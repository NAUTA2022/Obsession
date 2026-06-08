import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type DropdownProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
};

export default function Dropdown({ trigger, children, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      <div
        className={twMerge(
          'absolute z-50 mt-2 min-w-40 overflow-hidden rounded-lg border bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900',
          align === 'right' ? 'right-0' : 'left-0',
          open ? 'block' : 'hidden'
        )}
      >
        {children}
      </div>
    </div>
  );
}


