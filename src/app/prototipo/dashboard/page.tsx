'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
    LayoutDashboard, Users, HeartPulse, Pill, FileText, Menu, Search, LogOut, 
    Home, Database, ClipboardList, Stethoscope, ChevronRight, Plus
} from 'lucide-react';

export default function PrototipoDashboardPage() {
    const [activeTab, setActiveTab] = useState('inicio');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { id: 'inicio', label: 'Inicio', icon: Home },
        { id: 'datos-basicos', label: 'Datos Básicos', icon: Database },
        { id: 'abordajes', label: 'Abordaje Tejiendo', icon: ClipboardList },
        { id: 'consultas', label: 'Consultas', icon: Stethoscope },
        { id: 'farmacia', label: 'Farmacia', icon: Pill },
        { id: 'reportes', label: 'Reportes', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-[#e0f2fe] flex flex-col font-sans text-slate-700 selection:bg-[#87ceeb] selection:text-[#1e40af]">
            {/* Bandera minimalista superior global */}
            <div className="w-full h-1.5 flex shrink-0 z-50">
                <div className="flex-1 bg-[#F4C430]"></div>
                <div className="flex-1 bg-[#1e40af]"></div>
                <div className="flex-1 bg-[#CF142B]"></div>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Azul Médico */}
                <aside className={`${sidebarOpen ? 'w-[280px]' : 'w-20'} bg-[#1e40af] transition-all duration-300 flex flex-col z-20 shrink-0 shadow-2xl shadow-blue-900/20`}>
                    
                    {/* Header Sidebar */}
                    <div className="h-20 bg-white flex items-center justify-between px-4 border-b border-slate-100">
                        {sidebarOpen && (
                            <div className="flex items-center gap-3">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={36}
                                    height={36}
                                    className="object-contain"
                                />
                                <span className="font-bold text-[#1e40af] text-base">Tejiendo Redes</span>
                            </div>
                        )}
                        {!sidebarOpen && (
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="object-contain mx-auto"
                            />
                        )}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-[#1e40af] hover:bg-slate-50 transition-colors rounded-xl cursor-pointer">
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Menú de Navegación */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {sidebarOpen && (
                            <p className="text-xs font-semibold text-sky-300 uppercase tracking-wider mb-4 px-2">Menú Principal</p>
                        )}
                        
                        {menuItems.map(item => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button 
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 font-medium text-sm transition-all duration-200 rounded-xl cursor-pointer
                                    ${isActive 
                                        ? 'bg-white text-[#1e40af] shadow-md shadow-black/5' 
                                        : 'bg-transparent text-white/80 hover:bg-white/10 hover:text-white'
                                    }`}
                                    title={!sidebarOpen ? item.label : undefined}
                                >
                                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#cf142b]' : ''}`} />
                                    {sidebarOpen && <span className="text-left truncate">{item.label}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Botón Cerrar Sesión */}
                    <div className="p-4 border-t border-white/10">
                        <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors rounded-xl group cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <LogOut className="w-4 h-4 text-sky-200 group-hover:text-white transition-colors" />
                            </div>
                            {sidebarOpen && <span>Cerrar Sesión</span>}
                        </button>
                    </div>
                </aside>

                {/* Contenido Principal */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    
                    {/* Topbar */}
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 z-10">
                        <div className="flex items-center gap-5">
                            <h1 className="text-xl font-bold text-slate-800">
                                Sistema de Abordajes Médicos
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            {/* Buscador Amigable */}
                            <div className="relative flex items-center bg-slate-100/80 border border-transparent focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm h-10 w-72 px-4 rounded-full transition-all duration-200">
                                <Search className="w-4 h-4 text-slate-400 mr-2" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar paciente o registro..." 
                                    className="w-full h-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent cursor-text"
                                />
                            </div>

                            {/* Avatar Circular */}
                            <div className="w-10 h-10 bg-sky-100 text-[#1e40af] flex items-center justify-center font-bold rounded-full cursor-pointer hover:bg-sky-200 transition-colors shadow-sm">
                                A
                            </div>
                        </div>
                    </header>

                    {/* Área de Trabajo */}
                    <div className="flex-1 overflow-auto p-8">
                        
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-800">
                                {menuItems.find(t => t.id === activeTab)?.label}
                            </h2>
                            <p className="text-slate-500 mt-1">
                                Gestión de información y control de jornadas
                            </p>
                        </div>

                        {/* Tarjeta Principal Data Table */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col">
                            
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Registros Recientes</h3>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-5 h-10 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm border border-slate-200 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Generar Reporte
                                    </button>
                                    <button className="px-5 h-10 bg-[#1e40af] text-white hover:bg-[#17338b] font-medium text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-blue-900/20 flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Nuevo Registro
                                    </button>
                                </div>
                            </div>

                            {/* Tabla Amigable */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-500">ID</th>
                                            <th className="px-6 py-4 font-semibold text-slate-500">Paciente / Detalle</th>
                                            <th className="px-6 py-4 font-semibold text-slate-500">Estado</th>
                                            <th className="px-6 py-4 font-semibold text-slate-500">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600">
                                        {[1, 2, 3, 4, 5].map((row) => (
                                            <tr key={row} className="bg-white hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    TR-{row}045
                                                </td>
                                                <td className="px-6 py-4">
                                                    Registro correspondiente a {menuItems.find(t => t.id === activeTab)?.label.toLowerCase()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                                        Activo
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-[#1e40af] hover:text-[#17338b] font-medium text-sm cursor-pointer hover:underline">
                                                        Revisar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Footer de tabla (Paginación simple) */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-sm text-slate-500">
                                <span>Mostrando 5 de 24 registros</span>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-white transition-colors cursor-pointer disabled:opacity-50" disabled>Anterior</button>
                                    <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-white transition-colors cursor-pointer">Siguiente</button>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </main>
            </div>
        </div>
    );
}
