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
    name?: string;
    batchItems?: any[];
}

export interface SaveToast {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
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

    // Global Save Toast
    saveToast: SaveToast | null;
    showSaveToast: (toast: SaveToast) => void;
    hideSaveToast: () => void;

    // Folder Modal
    folderModalPostId: string | null;
    openFolderModal: (postId: string) => void;
    closeFolderModal: () => void;

    // Create Menu
    isCreateMenuOpen: boolean;
    setCreateMenuOpen: (isOpen: boolean) => void;
    toggleCreateMenu: () => void;

    // TabBar State
    isTabBarHidden: boolean;
    setTabBarHidden: (isHidden: boolean) => void;

    // Selection State
    isSelectionMode: boolean;
    setSelectionMode: (isActive: boolean) => void;

    // Stability & Lifecycle
    refetchTrigger: number;
    triggerRefetch: () => void;
    lastFocusTimestamp: number;
    setLastFocusTimestamp: (ts: number) => void;
}

const PENDING_STORAGE_KEY = 'wardrobe_pending_upload_item';

const getInitialPendingItem = (): PendingUploadItem | null => {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(PENDING_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to parse stored pending upload item:', e);
    }
    return null;
};

function sanitizePendingForLocalStorage(item: PendingUploadItem): string {
    if (item.batchItems && item.batchItems.length > 0) {
        const lightweightBatch = item.batchItems.map((b) => ({
            id: b.id,
            // Keep only 1 processed/preview image string per item, drop redundant copies
            image: b.processedImage || b.image || b.originalImage || '',
            formData: b.formData,
            isProcessing: b.isProcessing,
            stage: b.stage,
            error: b.error,
        }));

        const payload = {
            name: item.name,
            formData: item.formData,
            image: item.image || lightweightBatch[0]?.image || '',
            batchItems: lightweightBatch,
        };

        return JSON.stringify(payload);
    }

    const singlePayload = {
        formData: item.formData,
        image: item.processedImage || item.image || item.originalImage || '',
        name: item.name || item.formData?.name || 'Nueva prenda',
    };
    return JSON.stringify(singlePayload);
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

    pendingUploadItem: getInitialPendingItem(),
    setPendingUploadItem: (item) => {
        // Zustand in-memory state always maintains the full, lossless object for runtime navigation
        set({ pendingUploadItem: item });

        if (typeof window !== 'undefined') {
            if (item) {
                try {
                    const serialized = sanitizePendingForLocalStorage(item);
                    // Standard localStorage limit is ~5MB total across domain; keep payload under 2MB
                    if (serialized.length < 2000000) {
                        localStorage.setItem(PENDING_STORAGE_KEY, serialized);
                    } else {
                        // If too large for localStorage, save metadata with first item thumbnail only
                        const compactBatch = item.batchItems?.map((b, idx) => ({
                            id: b.id,
                            image: idx === 0 ? (b.processedImage || b.image || b.originalImage || '') : '',
                            formData: b.formData,
                            isProcessing: b.isProcessing,
                            stage: b.stage,
                            error: b.error,
                        }));
                        const compactPayload = JSON.stringify({
                            name: item.name,
                            formData: item.formData,
                            image: item.image || (item.batchItems?.[0]?.image) || '',
                            batchItems: compactBatch,
                        });
                        localStorage.setItem(PENDING_STORAGE_KEY, compactPayload);
                    }
                } catch {
                    // If localStorage quota is completely saturated, fallback to lightweight metadata
                    try {
                        const emergencyPayload = JSON.stringify({
                            name: item.name || 'Subida pendiente',
                            formData: item.formData,
                        });
                        localStorage.setItem(PENDING_STORAGE_KEY, emergencyPayload);
                    } catch {
                        // Silently keep in memory (Zustand) without throwing errors to the console
                    }
                }
            } else {
                try {
                    localStorage.removeItem(PENDING_STORAGE_KEY);
                } catch {
                    // Ignore removal error
                }
            }
        }
    },
    clearPendingUploadItem: () => {
        set({ pendingUploadItem: null });
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(PENDING_STORAGE_KEY);
            } catch {
                // Ignore removal error
            }
        }
    },

    saveToast: null,
    showSaveToast: (toast) => set({ saveToast: toast }),
    hideSaveToast: () => set({ saveToast: null }),

    folderModalPostId: null,
    openFolderModal: (postId) => set({ folderModalPostId: postId }),
    closeFolderModal: () => set({ folderModalPostId: null }),

    // Create Menu
    isCreateMenuOpen: false,
    setCreateMenuOpen: (isOpen: boolean) => set({ isCreateMenuOpen: isOpen }),
    toggleCreateMenu: () => set((state: any) => ({ isCreateMenuOpen: !state.isCreateMenuOpen })),

    // TabBar State
    isTabBarHidden: false,
    setTabBarHidden: (isHidden) => set({ isTabBarHidden: isHidden }),

    // Selection State
    isSelectionMode: false,
    setSelectionMode: (isActive) => set({ isSelectionMode: isActive }),

    // Stability & Lifecycle
    refetchTrigger: 0,
    triggerRefetch: () => set((state: any) => ({ refetchTrigger: state.refetchTrigger + 1 })),
    lastFocusTimestamp: Date.now(),
    setLastFocusTimestamp: (ts) => set({ lastFocusTimestamp: ts }),
}));
