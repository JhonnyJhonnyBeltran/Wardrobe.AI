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
