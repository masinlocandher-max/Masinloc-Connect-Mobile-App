import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { handleNativeAuthCallback } from '../lib/platform.js';

function reportAuthError(error) {
  const message = error instanceof Error ? error.message : 'The sign-in link could not be completed.';
  window.dispatchEvent(new CustomEvent('masinloc-auth-error', { detail: { message } }));
}

export default function NativeAuthBridge({ onBack }) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    let listenerHandle = null;
    let disposed = false;

    const open = async (url) => {
      if (!url || disposed) return;
      try {
        await handleNativeAuthCallback(url);
      } catch (error) {
        reportAuthError(error);
      }
    };

    CapacitorApp.addListener('appUrlOpen', ({ url }) => open(url))
      .then((handle) => {
        if (disposed) handle.remove();
        else listenerHandle = handle;
      })
      .catch(reportAuthError);

    CapacitorApp.getLaunchUrl()
      .then((result) => open(result?.url))
      .catch(() => {});

    return () => {
      disposed = true;
      listenerHandle?.remove();
    };
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !onBack) return undefined;
    let listenerHandle = null;
    let disposed = false;

    CapacitorApp.addListener('backButton', () => {
      const handled = onBack();
      if (!handled) CapacitorApp.exitApp();
    })
      .then((handle) => {
        if (disposed) handle.remove();
        else listenerHandle = handle;
      })
      .catch(() => {});

    return () => {
      disposed = true;
      listenerHandle?.remove();
    };
  }, [onBack]);

  return null;
}
