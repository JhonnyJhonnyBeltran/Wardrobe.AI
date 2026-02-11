/**
 * Processing Queue Module
 * Manages batch processing of multiple images with priority queuing
 * Prevents browser freezing during bulk uploads
 */

import type { 
    QueuedTask, 
    ProcessingResult, 
    BatchProcessingResult,
    ProcessingOptions,
    ProgressCallback 
} from './types';
import { MAX_CONCURRENT_PROCESSING, DEFAULT_PROCESSING_OPTIONS } from './config';
import { processClothingImage } from './processor';

/** Active processing queue */
const processingQueue: QueuedTask[] = [];

/** Currently processing count */
let activeProcessingCount = 0;

/** Queue processing state */
let isQueueProcessing = false;

/** Generate unique task ID */
function generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Adds an image to the processing queue
 * Returns a promise that resolves when processing is complete
 */
export function queueImageForProcessing(
    input: File | Blob | string,
    options: ProcessingOptions = {},
    onProgress?: ProgressCallback
): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
        const task: QueuedTask = {
            id: generateTaskId(),
            input,
            options: { ...DEFAULT_PROCESSING_OPTIONS, ...options },
            priority: options.priority ?? 0,
            createdAt: Date.now(),
            resolve,
            reject,
            abortController: new AbortController(),
        };

        // Insert based on priority (higher priority first)
        const insertIndex = processingQueue.findIndex(t => t.priority < task.priority);
        if (insertIndex === -1) {
            processingQueue.push(task);
        } else {
            processingQueue.splice(insertIndex, 0, task);
        }

        // Start processing if not already running
        processQueue(onProgress);
    });
}

/**
 * Process queued tasks with concurrency limit
 */
async function processQueue(onProgress?: ProgressCallback): Promise<void> {
    if (isQueueProcessing) return;
    isQueueProcessing = true;

    while (processingQueue.length > 0 && activeProcessingCount < MAX_CONCURRENT_PROCESSING) {
        const task = processingQueue.shift();
        if (!task) continue;

        activeProcessingCount++;
        
        // Process task without blocking the queue
        processTask(task, onProgress).finally(() => {
            activeProcessingCount--;
            // Continue processing remaining tasks
            if (processingQueue.length > 0) {
                processQueue(onProgress);
            }
        });
    }

    isQueueProcessing = false;
}

/**
 * Process a single queued task
 */
async function processTask(
    task: QueuedTask, 
    onProgress?: ProgressCallback
): Promise<void> {
    try {
        const result = await processClothingImage(
            task.input,
            task.options,
            onProgress,
            task.abortController?.signal
        );
        task.resolve(result);
    } catch (error) {
        task.resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Process multiple images in batch with progress tracking
 */
export async function processBatch(
    inputs: Array<{ input: File | Blob | string; options?: ProcessingOptions }>,
    onProgress?: (completed: number, total: number, current: ProcessingResult | null) => void
): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    const results: ProcessingResult[] = [];
    const total = inputs.length;
    let completed = 0;

    // Queue all images
    const promises = inputs.map(async ({ input, options }, index) => {
        const result = await queueImageForProcessing(input, {
            ...options,
            priority: options?.priority ?? (total - index), // Earlier items have higher priority
        });
        
        completed++;
        results[index] = result;
        onProgress?.(completed, total, result);
        
        return result;
    });

    // Wait for all to complete
    await Promise.all(promises);

    const successCount = results.filter(r => r.success).length;

    return {
        results,
        totalTime: Date.now() - startTime,
        successCount,
        failureCount: total - successCount,
    };
}

/**
 * Cancel all pending tasks
 */
export function cancelAllPending(): void {
    while (processingQueue.length > 0) {
        const task = processingQueue.pop();
        if (task) {
            task.abortController?.abort();
            task.resolve({
                success: false,
                error: 'Processing cancelled',
            });
        }
    }
}

/**
 * Cancel a specific task by ID
 */
export function cancelTask(taskId: string): boolean {
    const index = processingQueue.findIndex(t => t.id === taskId);
    if (index === -1) return false;

    const task = processingQueue.splice(index, 1)[0];
    task.abortController?.abort();
    task.resolve({
        success: false,
        error: 'Processing cancelled',
    });
    
    return true;
}

/**
 * Get current queue status
 */
export function getQueueStatus(): { 
    pending: number; 
    active: number; 
    total: number;
} {
    return {
        pending: processingQueue.length,
        active: activeProcessingCount,
        total: processingQueue.length + activeProcessingCount,
    };
}

/**
 * Check if queue is empty
 */
export function isQueueEmpty(): boolean {
    return processingQueue.length === 0 && activeProcessingCount === 0;
}
