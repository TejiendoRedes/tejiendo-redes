/**
 * @module store/edit-modal-store
 * @description Store global de Zustand para gestionar el estado de los modales de edición.
 *
 * Cuando el usuario hace clic en "Editar" en cualquier entidad (paciente, tejedor,
 * comunidad, etc.), este store almacena el tipo de entidad y su ID para que el
 * componente modal correspondiente lo consuma y cargue los datos a editar.
 *
 * Se eligió Zustand sobre React Context porque el estado del modal necesita ser
 * accesible desde cualquier componente sin propagación manual de props.
 */

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
