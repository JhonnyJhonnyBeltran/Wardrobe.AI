import { supabase } from '@/lib/supabase/client';
import type { Notification } from '@/components/Notifications/NotificationList';

// IDs únicos para evitar colisiones
const SUGGESTIONS = {
    EMPTY_WARDROBE: 'sugg_empty_wardrobe',
    FIRST_OUTFIT: 'sugg_first_outfit',
    EMPTY_CALENDAR: 'sugg_empty_calendar',
    USE_AI: 'sugg_use_ai',
    COMPLETE_PROFILE: 'sugg_complete_profile',
};

// Tiempos de enfriamiento (en milisegundos)
const COOLDOWNS = {
    [SUGGESTIONS.EMPTY_WARDROBE]: 24 * 60 * 60 * 1000, // 1 día
    [SUGGESTIONS.FIRST_OUTFIT]: 24 * 60 * 60 * 1000, // 1 día
    [SUGGESTIONS.EMPTY_CALENDAR]: 12 * 60 * 60 * 1000, // 12 horas
    [SUGGESTIONS.USE_AI]: 3 * 24 * 60 * 60 * 1000, // 3 días
    [SUGGESTIONS.COMPLETE_PROFILE]: 7 * 24 * 60 * 60 * 1000, // 7 días
};

/**
 * Obtiene sugerencias inteligentes basadas en el estado del usuario.
 * Utiliza localStorage para manejar tiempos de enfriamiento (cooldowns) y no ser molesto.
 */
export async function getSmartSuggestions(userId: string): Promise<Notification[]> {
    const suggestions: Notification[] = [];
    const now = new Date();
    
    // Función helper para comprobar y actualizar el cooldown
    const canShowSuggestion = (id: string) => {
        if (typeof window === 'undefined') return false;
        
        const lastShownStr = localStorage.getItem(`last_shown_${id}`);
        if (!lastShownStr) return true;
        
        const lastShown = new Date(lastShownStr).getTime();
        const cooldown = COOLDOWNS[id] || 24 * 60 * 60 * 1000;
        
        return now.getTime() - lastShown > cooldown;
    };
    
    const markAsShown = (id: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`last_shown_${id}`, now.toISOString());
        }
    };

    // Helper to format date as YYYY-MM-DD local time
    const formatDateToSQL = (date: Date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    };

    try {
        // 1. Consultar estado del usuario (en paralelo para mayor velocidad)
        const [
            { count: itemsCount },
            { count: outfitsCount },
            { count: calendarCount },
            { data: userData }
        ] = await Promise.all([
            supabase.from('clothing_items').select('*', { count: 'exact', head: true }).eq('user_id', userId),
            supabase.from('outfits').select('*', { count: 'exact', head: true }).eq('user_id', userId),
            supabase.from('calendar_outfits').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('date', formatDateToSQL(now)),
            supabase.from('users').select('avatar_url, full_name').eq('id', userId).single()
        ]);

        const items = itemsCount || 0;
        const outfits = outfitsCount || 0;
        const hasCalendarToday = (calendarCount || 0) > 0;
        
        // 2. Evaluar reglas

        // Armario Vacío
        if (items < 3 && canShowSuggestion(SUGGESTIONS.EMPTY_WARDROBE)) {
            suggestions.push({
                id: SUGGESTIONS.EMPTY_WARDROBE + '_' + now.getTime(),
                type: 'system',
                content: 'Empieza a digitalizar tu armario subiendo tus prendas favoritas.',
                time: 'Justo ahora',
                timestamp: now.getTime(),
                actor: { id: 'system', username: 'klozet', name: 'Klozet', avatar: '' }
            });
            markAsShown(SUGGESTIONS.EMPTY_WARDROBE);
        }
        
        // Primer Outfit (Si tiene ropa pero no outfits)
        if (items >= 3 && outfits === 0 && canShowSuggestion(SUGGESTIONS.FIRST_OUTFIT)) {
            suggestions.push({
                id: SUGGESTIONS.FIRST_OUTFIT + '_' + now.getTime(),
                type: 'system',
                content: 'Ya tienes ropa en tu armario, ¡es hora de crear tu primer outfit!',
                time: 'Justo ahora',
                timestamp: now.getTime() - 1000,
                actor: { id: 'system', username: 'klozet', name: 'Klozet', avatar: '' }
            });
            markAsShown(SUGGESTIONS.FIRST_OUTFIT);
        }

        // Calendario Vacío (Si tiene outfits pero no ha planeado hoy)
        if (outfits > 0 && !hasCalendarToday && canShowSuggestion(SUGGESTIONS.EMPTY_CALENDAR)) {
            suggestions.push({
                id: SUGGESTIONS.EMPTY_CALENDAR + '_' + now.getTime(),
                type: 'system',
                content: 'No tienes outfit planeado para hoy. ¿Te ayudamos a elegir?',
                time: 'Justo ahora',
                timestamp: now.getTime() - 2000,
                actor: { id: 'system', username: 'klozet', name: 'Klozet', avatar: '' }
            });
            markAsShown(SUGGESTIONS.EMPTY_CALENDAR);
        }

        // Usar IA aleatorio (1 de cada 3 veces si cumple cooldown)
        if (outfits > 3 && items > 5 && canShowSuggestion(SUGGESTIONS.USE_AI) && Math.random() > 0.6) {
            suggestions.push({
                id: SUGGESTIONS.USE_AI + '_' + now.getTime(),
                type: 'system',
                content: '¿Dudas con qué ponerte? Deja que Kloe te genere un outfit hoy.',
                time: 'Hace un momento',
                timestamp: now.getTime() - 3000,
                actor: { id: 'system', username: 'klozet', name: 'Klozet', avatar: '' }
            });
            markAsShown(SUGGESTIONS.USE_AI);
        }

        // Completar Perfil
        if (userData && (!userData.avatar_url || !userData.full_name) && canShowSuggestion(SUGGESTIONS.COMPLETE_PROFILE)) {
             suggestions.push({
                id: SUGGESTIONS.COMPLETE_PROFILE + '_' + now.getTime(),
                type: 'system',
                content: 'Completa tu perfil subiendo una foto y tu nombre para que otros te reconozcan.',
                time: 'Hace un momento',
                timestamp: now.getTime() - 4000,
                actor: { id: 'system', username: 'klozet', name: 'Klozet', avatar: '' }
            });
            markAsShown(SUGGESTIONS.COMPLETE_PROFILE);
        }

    } catch (err) {
        console.error('Error fetching smart suggestions:', err);
    }

    return suggestions;
}
