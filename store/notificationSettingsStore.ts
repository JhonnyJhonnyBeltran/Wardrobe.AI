'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  updateSetting: (key: keyof NotificationSettings, value: boolean) => void;
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

      updateSetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        }));
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
          case 'system':
          case 'outfit_shared':
          case 'reminder':
            return settings.reminders;
          default:
            return true;
        }
      },
    }),
    {
      name: 'klozet_notification_settings',
    }
  )
);
