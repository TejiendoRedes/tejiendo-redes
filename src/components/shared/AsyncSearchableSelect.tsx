'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/components/ui/utils';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this exists or I'll implement a simple one inside

interface Item {
    id: string;
    label: string;
    secondaryLabel?: string;
    [key: string]: any;
}

interface AsyncSearchableSelectProps {
    fetcher: (query: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    label?: string;
    idField?: string;
    labelField?: string;
    secondaryLabelField?: string;
    disabled?: boolean;
    className?: string;
    initialLabel?: string; // To show when value is set but items not loaded
    id?: string;
}

export function AsyncSearchableSelect({
    fetcher,
    value,
    onValueChange,
    placeholder = 'Seleccionar...',
    searchPlaceholder = 'Buscar...',
    label,
    idField = 'id',
    labelField = 'label',
    secondaryLabelField,
    disabled = false,
    className,
    initialLabel,
    id // Add id prop
}: AsyncSearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(initialLabel || '');
    const [initialized, setInitialized] = useState(false);

    // Simple debounce implementation if hook doesn't exist
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch data when debounced search term changes
    useEffect(() => {
        if (!open) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const res = await fetcher(debouncedSearchTerm);
                if (res.success && Array.isArray(res.data)) {
                    const mapped = res.data.map(item => ({
                        id: item[idField]?.toString() || '',
                        label: item[labelField]?.toString() || '',
                        secondaryLabel: secondaryLabelField ? item[secondaryLabelField]?.toString() : undefined,
                        original: item
                    }));
                    setItems(mapped);
                } else {
                    setItems([]);
                }
            } catch (error) {
                console.error("Error fetching data", error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [debouncedSearchTerm, open, fetcher, idField, labelField, secondaryLabelField]);

    // Update selected label if value changes and we have the item in current list
    useEffect(() => {
        const found = items.find(i => i.id === value);
        if (found) {
            setSelectedLabel(found.label);
        } else if (!value) {
            setSelectedLabel('');
        }
        // If value exists but not in list (e.g. initial load), we rely on initialLabel or parent to handle it
        // Or we could fetch specific item if API supported it, but for now we keep it simple
    }, [value, items]);

    const handleSelect = (item: Item) => {
        onValueChange(item.id);
        setSelectedLabel(item.label);
        setOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={cn("w-full", className)}>
            {label && <label htmlFor={id} className="text-sm font-medium mb-1 block text-gray-700">{label}</label>}
            <Button
                id={id}
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-label={label || placeholder}
                className="w-full justify-between bg-white font-normal text-left h-10 px-3 border-gray-300 hover:bg-gray-50 transition-colors"
                onClick={() => !disabled && setOpen(true)}
                disabled={disabled}
            >
                {value ? (
                    <span className="truncate flex-1 text-left">
                        <span className="font-medium truncate block">{selectedLabel || value}</span>
                    </span>
                ) : (
                    <span className="text-gray-400 truncate flex-1 text-left">{placeholder}</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-4 border-b bg-gray-50">
                        <DialogTitle className="text-lg font-semibold text-gray-900">{placeholder}</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 bg-white">
                        <div className="relative flex items-center group mb-2">
                            <Search className="absolute left-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-lg"
                                autoFocus
                                aria-label={searchPlaceholder}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Borrar búsqueda"
                                    className="absolute right-3 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="mt-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                            {loading ? (
                                <div className="py-8 flex justify-center items-center text-gray-400">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    <span>Cargando...</span>
                                </div>
                            ) : items.length > 0 ? (
                                <div className="space-y-1">
                                    {items.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => handleSelect(item)}
                                            className={cn(
                                                "flex flex-col w-full text-left px-4 py-3 rounded-xl transition-all duration-200",
                                                value === item.id
                                                    ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                                                    : "hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-100"
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="font-semibold text-sm">{item.label}</span>
                                                <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase tracking-tighter">
                                                    {item.id}
                                                </span>
                                            </div>
                                            {item.secondaryLabel && (
                                                <span className="text-xs text-gray-500 mt-0.5 opacity-80 italic">
                                                    {item.secondaryLabel}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium">No se encontraron resultados</p>
                                    <p className="text-xs">
                                        {searchTerm ? 'Prueba con otros términos' : 'Escribe para buscar...'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
