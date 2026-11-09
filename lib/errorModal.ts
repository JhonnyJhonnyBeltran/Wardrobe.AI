import { useUiStore } from '@/store/uiStore';

export interface DatabaseErrorOptions {
    title?: string;
    message?: string;
    confirmText?: string;
    onConfirm?: () => void;
    redirectToAuth?: boolean;
}

/**
 * Normaliza y formatea cualquier error de base de datos o HTTP (401, 403, 404, 429, 500, etc.)
 * y muestra un modal limpio, elegante y no intrusivo con el estilo oficial de Klozet.
 */
export function showDatabaseError(error: any, fallbackMessage?: string, options?: DatabaseErrorOptions) {
    if (typeof window === 'undefined') return;

    let status: number | null = null;
    let rawMessage = '';

    if (error) {
        if (typeof error === 'number') {
            status = error;
        } else if (typeof error === 'string') {
            rawMessage = error;
            if (error.includes('401')) status = 401;
            else if (error.includes('403')) status = 403;
            else if (error.includes('404')) status = 404;
            else if (error.includes('429')) status = 429;
            else if (error.includes('500')) status = 500;
        } else if (typeof error === 'object') {
            status = error.status || error.statusCode || (typeof error.code === 'number' ? error.code : null);
            rawMessage = error.message || error.error_description || error.details || error.hint || '';

            const codeStr = String(error.code || '');
            if (codeStr === '401' || codeStr === 'PGRST301') status = 401;
            else if (codeStr === '403' || codeStr === '42501') status = 403;
            else if (codeStr === '404' || codeStr === 'PGRST116') status = 404;
            else if (codeStr === '429') status = 429;
        }
    }

    const msgLower = rawMessage.toLowerCase();

    // 401: Sesión expirada o no autenticado
    if (
        status === 401 ||
        msgLower.includes('jwt expired') ||
        msgLower.includes('token expired') ||
        msgLower.includes('unauthorized') ||
        msgLower.includes('session not found') ||
        msgLower.includes('not logged in')
    ) {
        useUiStore.getState().showModal({
            title: options?.title || 'Sesión no iniciada',
            message: options?.message || 'Tu sesión ha expirado o necesitas identificarte para continuar.',
            type: 'info',
            confirmText: options?.confirmText || 'Iniciar sesión',
            confirmVariant: 'primary',
            onConfirm: () => {
                if (options?.onConfirm) {
                    options.onConfirm();
                } else {
                    window.location.href = '/auth';
                }
            },
        });
        return;
    }

    // 403: Permisos denegados / RLS
    if (
        status === 403 ||
        msgLower.includes('row-level security') ||
        msgLower.includes('violates row-level security') ||
        msgLower.includes('permission denied') ||
        msgLower.includes('forbidden')
    ) {
        useUiStore.getState().showModal({
            title: options?.title || 'Acceso no disponible',
            message: options?.message || 'No tienes permisos suficientes para realizar esta acción.',
            type: 'warning',
            confirmText: options?.confirmText || 'Entendido',
            confirmVariant: 'primary',
            onConfirm: options?.onConfirm,
        });
        return;
    }

    // 404: No encontrado
    if (
        status === 404 ||
        msgLower.includes('not found') ||
        msgLower.includes('no rows found') ||
        msgLower.includes('the result contains 0 rows')
    ) {
        useUiStore.getState().showModal({
            title: options?.title || 'Elemento no encontrado',
            message: options?.message || 'El contenido o elemento que buscas ya no está disponible.',
            type: 'info',
            confirmText: options?.confirmText || 'Entendido',
            confirmVariant: 'primary',
            onConfirm: options?.onConfirm,
        });
        return;
    }

    // 429: Rate limit / demasiadas acciones seguidas
    if (
        status === 429 ||
        msgLower.includes('rate limit') ||
        msgLower.includes('too many requests')
    ) {
        useUiStore.getState().showModal({
            title: options?.title || 'Demasiadas solicitudes',
            message: options?.message || 'Has realizado varias acciones seguidas. Espera unos segundos antes de volver a intentarlo.',
            type: 'warning',
            confirmText: options?.confirmText || 'Entendido',
            confirmVariant: 'primary',
            onConfirm: options?.onConfirm,
        });
        return;
    }

    // 500 / Error de conexión con backend
    if (
        (status && status >= 500) ||
        msgLower.includes('failed to fetch') ||
        msgLower.includes('network error') ||
        msgLower.includes('networkerror')
    ) {
        useUiStore.getState().showModal({
            title: options?.title || 'Problema de conexión',
            message: options?.message || fallbackMessage || 'No hemos podido conectar con la base de datos. Comprueba tu conexión e inténtalo de nuevo.',
            type: 'error',
            confirmText: options?.confirmText || 'Reintentar',
            confirmVariant: 'primary',
            onConfirm: options?.onConfirm,
        });
        return;
    }

    // Fallback general limpio
    useUiStore.getState().showModal({
        title: options?.title || 'Ha ocurrido un error',
        message: options?.message || fallbackMessage || (rawMessage && !rawMessage.includes('{}') && rawMessage.length < 120 ? rawMessage : 'No se pudo completar la operación. Por favor, inténtalo de nuevo.'),
        type: 'error',
        confirmText: options?.confirmText || 'Entendido',
        confirmVariant: 'primary',
        onConfirm: options?.onConfirm,
    });
}
