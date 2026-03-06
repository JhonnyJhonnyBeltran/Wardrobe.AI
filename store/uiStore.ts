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

export interface PendingUploadItem {
    formData?: any;
    image?: string | null;
    originalImage?: string | null;
    processedImage?: string | null;
}

interface UiStore {
    modal: SystemMessage | null;
    showModal: (message: SystemMessage) => void;
    closeModal: () => void;
    requestsCount: number;
    setRequestsCount: (count: number) => void;
    messageRequestsCount: number;
    setMessageRequestsCount: (count: number) => void;
    isPremiumModalOpen: boolean;
    openPremiumModal: () => void;
    closePremiumModal: () => void;

    // Closet State
    isDoorsOpen: boolean;
    openDoors: () => void;
    closeDoors: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setDoorsOpen: (isOpen: boolean) => void;

    // Add Item Pendency
    pendingUploadItem: PendingUploadItem | null;
    setPendingUploadItem: (item: PendingUploadItem | null) => void;
    clearPendingUploadItem: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
    modal: null,
    showModal: (modal) => set({ modal }),
    closeModal: () => set({ modal: null }),
    requestsCount: 0,
    setRequestsCount: (count) => set({ requestsCount: count }),
    messageRequestsCount: 0,
    setMessageRequestsCount: (count) => set({ messageRequestsCount: count }),
    isPremiumModalOpen: false,
    openPremiumModal: () => set({ isPremiumModalOpen: true }),
    closePremiumModal: () => set({ isPremiumModalOpen: false }),

    // Closet State
    isDoorsOpen: false,
    openDoors: () => set({ isDoorsOpen: true }),
    closeDoors: () => set({ isDoorsOpen: false }),
    setDoorsOpen: (isOpen) => set({ isDoorsOpen: isOpen }),
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),

    pendingUploadItem: null,
    setPendingUploadItem: (item) => set({ pendingUploadItem: item }),
    clearPendingUploadItem: () => set({ pendingUploadItem: null }),
}));
