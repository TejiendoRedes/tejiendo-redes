'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/utils';
import { menuItems } from '@/config/navigation';
import { Home, ClipboardList, Pill, FileText, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';

interface MobileBottomNavProps {
    onMenuClick: () => void;
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
    const pathname = usePathname();

    const mainItems = [
        { label: 'Inicio', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
        { label: 'Abordajes', path: '/abordajes', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Reportes', path: '/reportes', icon: <FileText className="w-5 h-5" /> },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16 px-4 md:hidden">
            <nav className="h-full flex items-center justify-around">
                {mainItems.map((item) => {
                    const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {item.icon}
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={onMenuClick}
                    className="flex flex-col items-center justify-center gap-1 w-16 h-full text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Menú</span>
                </button>
            </nav>
        </div>
    );
}
