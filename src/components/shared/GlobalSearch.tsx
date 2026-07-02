'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, Hospital, HeartHandshake } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { globalSearch, type SearchResult } from '@/actions/search-actions';

export function GlobalSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Búsqueda con Debounce
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsLoading(true);
                const res = await globalSearch(query);
                if (res.success && res.data) {
                    setResults(res.data);
                    setIsOpen(true);
                } else {
                    setResults([]);
                }
                setIsLoading(false);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (url: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(url);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'paciente': return <User className="h-4 w-4 text-blue-600" />;
            case 'abordaje': return <Hospital className="h-4 w-4 text-emerald-600" />;
            case 'tejedor': return <HeartHandshake className="h-4 w-4 text-orange-600" />;
            default: return <Search className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <div ref={wrapperRef} className="relative hidden lg:block z-50">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
                type="search"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value.length >= 2) setIsOpen(true);
                }}
                onFocus={() => {
                    if (query.length >= 2) setIsOpen(true);
                }}
                placeholder="Buscar paciente, abordaje..."
                className="h-10 w-[280px] rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm font-medium text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {isLoading && (
                <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
            )}

            {isOpen && (query.length >= 2) && (
                <div className="absolute top-full mt-2 w-[350px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="max-h-[400px] overflow-y-auto py-2">
                        {isLoading && results.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">Buscando...</div>
                        ) : results.length > 0 ? (
                            <ul className="flex flex-col">
                                {results.map((result) => (
                                    <li key={`${result.type}-${result.id}`}>
                                        <button
                                            onClick={() => handleSelect(result.url)}
                                            className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <div className="mt-0.5 rounded-full bg-gray-100 p-1.5">
                                                {getIcon(result.type)}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="truncate text-sm font-bold text-gray-900">{result.title}</p>
                                                {result.subtitle && (
                                                    <p className="truncate text-xs text-gray-500">{result.subtitle}</p>
                                                )}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No se encontraron resultados</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
