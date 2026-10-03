'use client';
import React, { useEffect, useLayoutEffect } from 'react';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { Uniwind } from 'uniwind';
import { script } from './script';
import { ThemeMode, THEME_NAMES } from '@/types';

const useSafeLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const VALID_THEME_MODES: readonly string[] = [...THEME_NAMES, 'system'];

// Persisted state can be corrupted or come from an older app version, so never
// trust it directly as a script-interpolation value even though it's typed ThemeMode.
function resolveSafeMode(mode: ThemeMode): ThemeMode {
  return VALID_THEME_MODES.includes(mode) ? mode : 'dark';
}

export function GluestackUIProvider({
  mode: rawMode = 'dark',
  ...props
}: {
  mode?: ThemeMode;
  children?: React.ReactNode;
}) {
  const mode = resolveSafeMode(rawMode);

  const handleMediaQuery = React.useCallback((e: MediaQueryListEvent) => {
    const resolvedMode = e.matches ? 'dark' : 'light';
    script(resolvedMode);
    Uniwind.setTheme(resolvedMode);
  }, []);

  useSafeLayoutEffect(() => {
    if (mode === 'system') return;
    script(mode);
    Uniwind.setTheme(mode);
  }, [mode]);

  useSafeLayoutEffect(() => {
    if (mode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addListener(handleMediaQuery);
    return () => media.removeListener(handleMediaQuery);
  }, [handleMediaQuery, mode]);

  return (
    <>
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `(${script.toString()})(${JSON.stringify(mode)})`,
        }}
      />
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </>
  );
}
