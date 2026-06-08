import { Search } from 'lucide-react';

type SearchInputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export default function SearchInput({ 
  placeholder = 'Buscar', 
  value, 
  onChange, 
  className = '' 
}: SearchInputProps) {
  return (
    <div className={`relative w-full max-w-lg ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        className="w-full rounded-lg border bg-white pl-9 pr-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}


