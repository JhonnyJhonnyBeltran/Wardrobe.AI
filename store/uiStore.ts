import { create } from 'zustand';

type MessageType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

interface SystemMessage {
    title: string;
    message: string;
    type: MessageType;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

interface UiStore {
    modal: SystemMessage | null;
    showModal: (message: SystemMessage) => void;
    closeModal: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
    modal: null,
    showModal: (modal) => set({ modal }),
    closeModal: () => set({ modal: null }),
}));
