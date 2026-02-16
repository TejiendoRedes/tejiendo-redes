'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/components/ui/utils';

interface Item {
    id: string;
    label: string;
    secondaryLabel?: string;
    [key: string]: any;
}

interface SearchableSelectProps {
    items: any[];
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
    id?: string;
}

export function SearchableSelect({
    items,
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
    id // Add id prop
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const formattedItems: Item[] = useMemo(() => {
        return items.map(item => ({
            id: item[idField]?.toString() || '',
            label: item[labelField]?.toString() || '',
            secondaryLabel: secondaryLabelField ? item[secondaryLabelField]?.toString() : undefined,
            original: item
        }));
    }, [items, idField, labelField, secondaryLabelField]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return formattedItems;
        const lowerSearch = searchTerm.toLowerCase();
        return formattedItems.filter(item =>
            item.label.toLowerCase().includes(lowerSearch) ||
            item.id.toLowerCase().includes(lowerSearch) ||
            (item.secondaryLabel && item.secondaryLabel.toLowerCase().includes(lowerSearch))
        );
    }, [formattedItems, searchTerm]);

    const selectedItem = useMemo(() =>
        formattedItems.find(item => item.id === value),
        [formattedItems, value]);

    const handleSelect = (itemId: string) => {
        onValueChange(itemId);
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
                {selectedItem ? (
                    <span className="truncate flex flex-col items-start leading-tight">
                        <span className="font-medium">{selectedItem.label}</span>
                        {selectedItem.secondaryLabel && (
                            <span className="text-[10px] text-gray-500">{selectedItem.secondaryLabel}</span>
                        )}
                    </span>
                ) : (
                    <span className="text-gray-400">{placeholder}</span>
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
                            {filteredItems.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredItems.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => handleSelect(item.id)}
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
                                                <span className="text-xs text-gray-500 mt-0.5 mt-1 opacity-80 italic">
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
                                    <p className="text-xs">Prueba con otros términos de búsqueda</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Add a simple scrollbar style if needed, otherwise browser default is fine
