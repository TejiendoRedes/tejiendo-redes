'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, Home, Pill, Stethoscope, Briefcase, Users, FileText, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { searchGlobal, type GroupedSearchResults, type SearchResult } from '@/actions/global-search-actions';
import Link from 'next/link';
import { useEditModalStore, type EntityType } from '@/lib/store/edit-modal-store';

export function GlobalSearch() {
    const { openEditModal } = useEditModalStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GroupedSearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const debouncedQuery = useDebounce(query, 300);
    const containerRef = useRef<HTMLDivElement>(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Efecto para buscar
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setResults(null);
                return;
            }

            setLoading(true);
            setOpen(true);
            try {
                const data = await searchGlobal(debouncedQuery);
                setResults(data);
            } catch (error) {
                console.error('Error searching:', error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);

    const handleSelect = () => {
        setOpen(false);
        // Opcional: limpiar query si se desea
        // setQuery(''); 
    };

    const hasResults = results && Object.values(results).some(arr => arr.length > 0);

    const renderSection = (title: string, items: SearchResult[], icon: React.ReactNode, colorClass: string, iconBgClass: string, entityType: EntityType) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="py-2 border-t first:border-t-0 border-gray-50">
                <div className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    {icon} {title}
                </div>
                {items.map((item) => (
                    <div
                        key={`${item.type}-${item.id}`}
                        onClick={() => {
                            handleSelect();
                            if (entityType && item.id) {
                                openEditModal(entityType, item.id);
                            }
                        }}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer group transition-colors"
                        role="button"
                    >
                        <div className={`w-8 h-8 rounded-full ${iconBgClass} ${colorClass} flex items-center justify-center mr-3 flex-shrink-0 group-hover:opacity-80 transition-opacity`}>
                            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" }) : icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {item.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {item.subtitle}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="relative w-full max-w-xl" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Buscar general (Ctrl + K)..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length >= 2) setOpen(true);
                    }}
                    onFocus={() => {
                        if (query.length >= 2) setOpen(true);
                    }}
                    className="pl-10 pr-4 w-full bg-gray-50/50 focus:bg-white transition-colors"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    </div>
                )}
            </div>

            {open && (query.length >= 2 || hasResults) && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    {!loading && !hasResults && query.length >= 2 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No se encontraron resultados para "{query}"
                        </div>
                    )}

                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {results && (
                            <>
                                {renderSection('Pacientes', results.pacientes, <User className="w-3 h-3" />, 'text-blue-600', 'bg-blue-100', 'paciente')}
                                {renderSection('Comunidades', results.comunidades, <Home className="w-3 h-3" />, 'text-green-600', 'bg-green-100', 'comunidad')}
                                {renderSection('Medicamentos', results.medicamentos, <Pill className="w-3 h-3" />, 'text-purple-600', 'bg-purple-100', 'medicamento')}
                                {renderSection('Enfermedades', results.enfermedades, <Stethoscope className="w-3 h-3" />, 'text-red-600', 'bg-red-100', 'enfermedad')}
                                {renderSection('Abordajes', results.abordajes, <FileText className="w-3 h-3" />, 'text-orange-600', 'bg-orange-100', 'abordaje')}
                                {renderSection('Tejedores', results.tejedores, <Users className="w-3 h-3" />, 'text-indigo-600', 'bg-indigo-100', 'tejedor')}
                                {renderSection('Responsables', results.responsables, <Briefcase className="w-3 h-3" />, 'text-teal-600', 'bg-teal-100', 'responsable')}
                                {renderSection('Aspirantes', results.aspirantes, <User className="w-3 h-3" />, 'text-yellow-600', 'bg-yellow-100', 'aspirante')}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
