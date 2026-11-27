'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect, useCallback } from 'react';
import { ClothingItem } from '@/types/clothing';
import { DraggableItem } from './DraggableItem';

export interface ItemState {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    zIndex: number;
}

interface FreeDragCanvasProps {
    items: ClothingItem[]; // Flat list of items to show
    onRemoveItem?: (itemId: string) => void;
    initialState?: Record<string, any>;
    onStateChange?: (state: Record<string, ItemState>) => void;
    onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

export interface FreeDragCanvasRef {
    exportToImage: () => Promise<string | null>;
    getItemsState: () => Record<string, any>;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

export const FreeDragCanvas = forwardRef<FreeDragCanvasRef, FreeDragCanvasProps>(function FreeDragCanvas(
    { items, onRemoveItem, initialState, onStateChange, onHistoryChange },
    ref
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
    const [maxZIndex, setMaxZIndex] = useState(10);

    // Keep track of latest state in ref for instantaneous commits
    const latestItemStatesRef = useRef<Record<string, ItemState>>({});
    latestItemStatesRef.current = itemStates;

    // History stack for undo / redo
    const historyRef = useRef<Record<string, ItemState>[]>([]);
    const historyIndexRef = useRef<number>(-1);

    // Ref callbacks
    const onStateChangeRef = useRef(onStateChange);
    useEffect(() => {
        onStateChangeRef.current = onStateChange;
    }, [onStateChange]);

    const onHistoryChangeRef = useRef(onHistoryChange);
    useEffect(() => {
        onHistoryChangeRef.current = onHistoryChange;
    }, [onHistoryChange]);

    const notifyHistory = useCallback(() => {
        const canUndo = historyIndexRef.current > 0;
        const canRedo = historyIndexRef.current >= 0 && historyIndexRef.current < historyRef.current.length - 1;
        onHistoryChangeRef.current?.(canUndo, canRedo);
    }, []);

    const commitToHistory = useCallback((stateToCommit?: Record<string, ItemState>) => {
        const target = stateToCommit || latestItemStatesRef.current;
        if (!target || Object.keys(target).length === 0) return;

        const currentSnapshot = historyRef.current[historyIndexRef.current];
        if (currentSnapshot && JSON.stringify(currentSnapshot) === JSON.stringify(target)) {
            return;
        }

        const snapshot = JSON.parse(JSON.stringify(target));
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push(snapshot);

        // Keep maximum 40 history snapshots
        if (newHistory.length > 40) {
            newHistory.shift();
        }

        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;

        notifyHistory();
    }, [notifyHistory]);

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current -= 1;
            const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
            latestItemStatesRef.current = targetState;
            setItemStates(targetState);
            onStateChangeRef.current?.(targetState);
            notifyHistory();
        }
    }, [notifyHistory]);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current += 1;
            const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
            latestItemStatesRef.current = targetState;
            setItemStates(targetState);
            onStateChangeRef.current?.(targetState);
            notifyHistory();
        }
    }, [notifyHistory]);

    const previousItemStates = useRef<Record<string, ItemState>>({});
    useEffect(() => {
        if (onStateChangeRef.current && Object.keys(itemStates).length > 0) {
            if (JSON.stringify(previousItemStates.current) !== JSON.stringify(itemStates)) {
                previousItemStates.current = itemStates;
                onStateChangeRef.current(itemStates);
            }
        }
    }, [itemStates]);

    // Initialize/Update items
    useEffect(() => {
        setItemStates(prev => {
            const next = { ...prev };
            let hasChanges = false;

            // Set grid positions for new items
            items.forEach((item, index) => {
                if (!next[item.id]) {
                    hasChanges = true;
                    const saved = initialState?.[item.id];
                    
                    const col = index % 3;
                    const row = Math.floor(index / 3);

                    next[item.id] = {
                        x: saved?.x ?? (30 + col * 20),
                        y: saved?.y ?? (30 + row * 20),
                        scale: saved?.scale ?? 1,
                        rotation: saved?.rotation ?? 0,
                        zIndex: saved?.zIndex ?? (index + 1)
                    };
                }
            });

            // Cleanup removed items
            Object.keys(next).forEach(id => {
                if (!items.find(i => i.id === id)) {
                    hasChanges = true;
                    delete next[id];
                }
            });

            if (hasChanges) {
                latestItemStatesRef.current = next;
                setTimeout(() => {
                    commitToHistory(next);
                }, 30);
                return next;
            }

            return prev;
        });
    }, [items, initialState, commitToHistory]);

    useImperativeHandle(ref, () => ({
        getItemsState: () => latestItemStatesRef.current,
        undo,
        redo,
        canUndo: () => historyIndexRef.current > 0,
        canRedo: () => historyIndexRef.current >= 0 && historyIndexRef.current < historyRef.current.length - 1,
        exportToImage: async () => {
            if (!containerRef.current) return null;
            // Deselect before capture
            setSelectedId(null);

            // Wait for React to render the deselection (next tick)
            await new Promise(resolve => setTimeout(resolve, 120));

            try {
                const html2canvas = (await import('html2canvas')).default;
                const canvas = await html2canvas(containerRef.current, {
                    backgroundColor: '#ffffff',
                    scale: 2.5, // Crisp 2.5x retina quality
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    imageTimeout: 12000,
                });
                try {
                    return canvas.toDataURL('image/webp', 0.95);
                } catch {
                    return canvas.toDataURL('image/png');
                }
            } catch (error) {
                console.error('Canvas export failed:', error);
                return null;
            }
        }
    }), [undo, redo]);

    const handleSelect = (id: string) => {
        setSelectedId(id);
        // Bring to front
        const nextZ = maxZIndex + 1;
        setMaxZIndex(nextZ);
        updateState(id, { zIndex: nextZ });
    };

    const updateState = (id: string, updates: Partial<ItemState>) => {
        latestItemStatesRef.current = {
            ...latestItemStatesRef.current,
            [id]: { ...latestItemStatesRef.current[id], ...updates }
        };
        setItemStates(prev => ({
            ...prev,
            [id]: { ...prev[id], ...updates }
        }));
    };

    const handleCommit = () => {
        commitToHistory();
    };

    return (
        <div
            className="w-full h-full min-h-[320px] bg-white overflow-hidden relative touch-none select-none"
            ref={containerRef}
            onClick={() => setSelectedId(null)} // Click background to deselect
        >
            {/* Grid pattern background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {items.map(item => {
                const state = itemStates[item.id];
                if (!state) return null;

                return (
                    <DraggableItem
                        key={item.id}
                        item={item}
                        state={state}
                        isSelected={selectedId === item.id}
                        onSelect={() => handleSelect(item.id)}
                        onChange={(updates) => updateState(item.id, updates)}
                        onCommit={handleCommit}
                        onRemove={() => onRemoveItem?.(item.id)}
                        containerRef={containerRef}
                    />
                );
            })}
        </div>
    );
});
