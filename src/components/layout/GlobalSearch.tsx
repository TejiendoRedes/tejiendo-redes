'use client';

import React from 'react';
import { Search, X, Edit, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { searchGlobal, type SearchResult, type GroupedSearchResults } from '@/actions/global-search-actions';
import { toast } from 'sonner';
import { useEditModalStore } from '@/lib/store/edit-modal-store';

const categoryLabels: Record<string, string> = {
    pacientes: 'Pacientes',
    comunidades: 'Comunidades',
    medicamentos: 'Medicamentos',
    enfermedades: 'Enfermedades',
    abordajes: 'Abordajes',
    tejedores: 'Tejedores',
    responsables: 'Responsables',
    aspirantes: 'Aspirantes',
};

export function GlobalSearch() {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<GroupedSearchResults | null>(null);
    const [isSearching, setIsSearching] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const debouncedQuery = useDebounce(query, 300);
    const { openEditModal } = useEditModalStore();

    // Ctrl+K / Cmd+K keyboard shortcut
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                inputRef.current?.blur();
                setIsOpen(false);
                setQuery('');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Click outside to close
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search on debounced query
    React.useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults(null);
            return;
        }

        const performSearch = async () => {
            setIsSearching(true);
            try {
                const data = await searchGlobal(debouncedQuery);
                setResults(data);
            } catch {
                toast.error('Error al buscar');
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);

    const totalResults = React.useMemo(() => {
        if (!results) return 0;
        return Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    }, [results]);

    const handleEdit = (result: SearchResult) => {
        openEditModal(result.type, result.id);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative max-w-md w-full" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar... (Ctrl+K)"
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="pl-10 pr-10"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults(null); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Limpiar búsqueda"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Resultados */}
            {isOpen && (query.length >= 2) && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {isSearching ? (
                        <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Buscando...</span>
                        </div>
                    ) : totalResults === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No se encontraron resultados para &quot;{debouncedQuery}&quot;
                        </div>
                    ) : (
                        results && Object.entries(results).map(([type, items]) => {
                            if (items.length === 0) return null;
                            return (
                                <div key={type}>
                                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 border-b border-border">
                                        {categoryLabels[type] || type}
                                    </div>
                                    {items.map((item: SearchResult) => (
                                        <button
                                            key={`${item.type}-${item.id}`}
                                            onClick={() => handleEdit(item)}
                                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors group"
                                        >
                                            <div className="text-left truncate">
                                                <span className="block truncate">{item.title}</span>
                                                <span className="block text-xs text-muted-foreground truncate">{item.subtitle}</span>
                                            </div>
                                            <Edit className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                                        </button>
                                    ))}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
