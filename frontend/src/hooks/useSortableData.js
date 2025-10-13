import { useState, useMemo } from "react";

/**
 * Hook customizado para adicionar funcionalidades de ordenação e filtro a qualquer array de dados.
 * * @param {Array} items - O array de dados a ser ordenado.
 * @param {Object} config - Configuração inicial da ordenação { key: string, direction: 'ascending' | 'descending' }.
 * @returns {Object} - { sortedItems, sortConfig, requestSort, getSortIcon }
 */

export const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = useState(config || { key: null, direction: 'ascending' });

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return 'FaSort';
        }

        return sortConfig.direction === 'ascending' ? 'FaSortUp' : 'FaSortDown';
    };

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];

        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();

                if (aVal < bVal) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';

        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        setSortConfig({ key, direction });
    }

    return { sortedItems, sortConfig, requestSort, getSortIcon };
};