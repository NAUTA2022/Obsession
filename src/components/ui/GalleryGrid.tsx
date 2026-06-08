import GalleryItem, { type GalleryItemProps } from './GalleryItem';

export interface GalleryGridProps {
    items: GalleryItemProps[];
    columns?: {
        mobile?: number;
        tablet?: number;
        desktop?: number;
        large?: number;
    };
    onItemClick?: (item: GalleryItemProps) => void;
}

// Mapas estáticos: Tailwind no genera clases construidas dinámicamente
// (`grid-cols-${n}`), así que hay que referenciar las clases completas.
const BASE_COLS: Record<number, string> = {
    1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3',
    4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6',
};
const SM_COLS: Record<number, string> = {
    1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6',
};
const MD_COLS: Record<number, string> = {
    1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3',
    4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6',
};
const LG_COLS: Record<number, string> = {
    1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6',
};

export default function GalleryGrid({
    items,
    columns = {
        mobile: 2,
        tablet: 3,
        desktop: 4,
        large: 6
    },
    onItemClick
}: GalleryGridProps) {
    const getGridColumns = () => {
        return [
            BASE_COLS[columns.mobile ?? 2] ?? 'grid-cols-2',
            SM_COLS[columns.tablet ?? 3] ?? 'sm:grid-cols-3',
            MD_COLS[columns.desktop ?? 4] ?? 'md:grid-cols-4',
            LG_COLS[columns.large ?? 6] ?? 'lg:grid-cols-6',
        ].join(' ');
    };

    return (
        <div className={`grid ${getGridColumns()} gap-4`}>
            {items.map((item) => (
                <GalleryItem
                    key={item.id}
                    {...item}
                    onClick={() => onItemClick?.(item)}
                />
            ))}
        </div>
    );
}
