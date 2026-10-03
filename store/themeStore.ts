import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, THEME_NAMES } from '@/types';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const VALID_THEME_MODES: readonly string[] = [...THEME_NAMES, 'system'];

export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      mode: 'dark',
      setMode: mode => set({ mode }),
    }),
    {
      name: 're-theme-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // Rehydrated JSON isn't guaranteed to still match ThemeMode (corrupted
      // value, or an older app version with a since-removed theme name).
      migrate: persistedState => {
        const mode = (persistedState as Partial<ThemeStore> | undefined)?.mode;
        return {
          mode: typeof mode === 'string' && VALID_THEME_MODES.includes(mode) ? mode : 'dark',
        } as ThemeStore;
      },
    }
  )
);
