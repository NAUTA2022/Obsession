import { useState, useCallback, useMemo } from 'react';
import type { GalleryItem, GalleryFilter } from '../types/gallery';

export function useGallery(initialItems: GalleryItem[] = []) {
    const [items, setItems] = useState<GalleryItem[]>(initialItems);
    const [filter, setFilter] = useState<GalleryFilter>({ type: 'all' });
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar items basado en el filtro y término de búsqueda
    const filteredItems = useMemo(() => {
        let filtered = items;

        // Filtrar por tipo
        if (filter.type && filter.type !== 'all') {
            filtered = filtered.filter(item => item.type === filter.type);
        }

        // Filtrar por categoría
        if (filter.category) {
            filtered = filtered.filter(item => item.category === filter.category);
        }

        // Filtrar por tags
        if (filter.tags && filter.tags.length > 0) {
            filtered = filtered.filter(item => 
                item.tags?.some(tag => filter.tags!.includes(tag))
            );
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [items, filter, searchTerm]);

    // Agregar nuevo item
    const addItem = useCallback((item: Omit<GalleryItem, 'id'>) => {
        const newItem: GalleryItem = {
            ...item,
            id: Date.now(),
            uploadedAt: new Date()
        };
        setItems(prev => [...prev, newItem]);
    }, []);

    // Eliminar item
    const removeItem = useCallback((id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    // Actualizar item
    const updateItem = useCallback((id: number, updates: Partial<GalleryItem>) => {
        setItems(prev => prev.map(item => 
            item.id === id ? { ...item, ...updates } : item
        ));
    }, []);

    // Actualizar filtro
    const updateFilter = useCallback((newFilter: Partial<GalleryFilter>) => {
        setFilter(prev => ({ ...prev, ...newFilter }));
    }, []);

    // Limpiar filtros
    const clearFilters = useCallback(() => {
        setFilter({ type: 'all' });
        setSearchTerm('');
    }, []);

    return {
        items: filteredItems,
        allItems: items,
        filter,
        searchTerm,
        addItem,
        removeItem,
        updateItem,
        updateFilter,
        setSearchTerm,
        clearFilters
    };
}
