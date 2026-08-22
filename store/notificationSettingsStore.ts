'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';

export interface NotificationSettings {
  popupToasts: boolean; // Master toggle for on-screen popups
  likes: boolean;
  comments: boolean;
  follows: boolean;
  messages: boolean;
  reminders: boolean;
  email: boolean;
}

interface NotificationSettingsState {
  settings: NotificationSettings;
  isSaving: boolean;
  updateSetting: (key: keyof NotificationSettings, value: boolean, userId?: string) => Promise<void>;
  setAllSettings: (newSettings: NotificationSettings) => void;
  loadFromDatabase: (userId: string) => Promise<void>;
  isNotificationTypeAllowed: (type: string) => boolean;
}

const defaultSettings: NotificationSettings = {
  popupToasts: true,
  likes: true,
  comments: true,
  follows: true,
  messages: true,
  reminders: true,
  email: false,
};

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isSaving: false,

      setAllSettings: (settings) => set({ settings }),

      updateSetting: async (key, value, userId) => {
        const updated = {
          ...get().settings,
          [key]: value,
        };
        set({ settings: updated });

        if (userId) {
          try {
            set({ isSaving: true });
            await supabase
              .from('profiles')
              .update({
                notification_preferences: updated,
              } as any)
              .eq('id', userId);
          } catch (err) {
            console.warn('[NotificationSettingsStore] Failed to sync to Supabase:', err);
          } finally {
            set({ isSaving: false });
          }
        }
      },

      loadFromDatabase: async (userId) => {
        if (!userId) return;
        try {
          const { data } = await supabase
            .from('profiles')
            .select('notification_preferences')
            .eq('id', userId)
            .maybeSingle();

          if (data && (data as any).notification_preferences) {
            const prefs = (data as any).notification_preferences;
            set({
              settings: {
                ...defaultSettings,
                ...prefs,
              }
            });
          }
        } catch (err) {
          console.warn('[NotificationSettingsStore] Error loading preferences from DB:', err);
        }
      },

      isNotificationTypeAllowed: (type: string) => {
        const { settings } = get();
        if (!settings.popupToasts) return false;

        switch (type) {
          case 'like':
            return settings.likes;
          case 'comment':
            return settings.comments;
          case 'new_follower':
          case 'follow_request':
          case 'follow_accepted':
            return settings.follows;
          case 'new_message':
            return settings.messages;
          case 'kloe_reminder':
            return settings.reminders;
          default:
            return true;
        }
      },
    }),
    {
      name: 'wardrobe_notification_settings',
    }
  )
);
