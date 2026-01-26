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
    requestsCount: number;
    setRequestsCount: (count: number) => void;
    messageRequestsCount: number;
    setMessageRequestsCount: (count: number) => void;
}

export const useUiStore = create<UiStore>((set) => ({
    modal: null,
    showModal: (modal) => set({ modal }),
    closeModal: () => set({ modal: null }),
    requestsCount: 0,
    setRequestsCount: (count) => set({ requestsCount: count }),
    messageRequestsCount: 0,
    setMessageRequestsCount: (count) => set({ messageRequestsCount: count }),
}));
