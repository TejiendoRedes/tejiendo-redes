"use client"

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Button } from './button';

interface AlertDialogContextType {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  openDialog: (config: { title: string; description: string; onConfirm: () => void }) => void;
  closeDialog: () => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

export function AlertDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});

  const openDialog = useCallback((config: { title: string; description: string; onConfirm: () => void }) => {
    setTitle(config.title);
    setDescription(config.description);
    setOnConfirm(() => config.onConfirm);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <AlertDialogContext.Provider value={{ open, title, description, onConfirm, openDialog, closeDialog }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-gray-600 mb-6">{description}</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    onConfirm();
                    closeDialog();
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AlertDialogContext.Provider>
  );
}

export function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within AlertDialogProvider');
  }
  return context;
}

// Componentes individuales para usar en el componente PeticionesClient
interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-lg max-w-lg w-full animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function AlertDialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function AlertDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function AlertDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>;
}

export function AlertDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-600 ${className || ''}`}>{children}</p>;
}

export function AlertDialogAction({ 
  children, 
  className, 
  onClick,
  disabled 
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Button 
      onClick={onClick} 
      className={className}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

export function AlertDialogCancel({ 
  children, 
  className, 
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button 
      variant="outline" 
      onClick={onClick} 
      className={className}
    >
      {children}
    </Button>
  );
}