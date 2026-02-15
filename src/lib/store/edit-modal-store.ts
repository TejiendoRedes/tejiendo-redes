import { create } from 'zustand';

export type EntityType =
    | 'paciente'
    | 'tejedor'
    | 'comunidad'
    | 'medicamento'
    | 'enfermedad'
    | 'abordaje'
    | 'responsable'
    | 'aspirante'
    | null;

interface EditModalState {
    isOpen: boolean;
    entityType: EntityType;
    entityId: string | null;
    openEditModal: (type: EntityType, id: string) => void;
    closeEditModal: () => void;
}

export const useEditModalStore = create<EditModalState>((set) => ({
    isOpen: false,
    entityType: null,
    entityId: null,
    openEditModal: (type, id) => set({ isOpen: true, entityType: type, entityId: id }),
    closeEditModal: () => set({ isOpen: false, entityType: null, entityId: null }),
}));
