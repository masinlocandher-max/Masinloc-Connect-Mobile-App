import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { handleAuthCallback } from './lib/platform.js';

if (Capacitor.isNativePlatform()) {
  const browserOpen = window.open.bind(window);

  // Keep existing application call sites simple while ensuring links leave the
  // WebView in a real native browser tab.
  window.open = (url, target, features) => {
    if (typeof url === 'string' && (target === '_blank' || /^https?:\/\//i.test(url))) {
      Browser.open({ url }).catch(() => browserOpen(url, target, features));
      return null;
    }
    return browserOpen(url, target, features);
  };

  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  SplashScreen.hide().catch(() => {});

  const consumeAuthUrl = (url) => {
    if (!url || !url.startsWith('masinlocconnect://auth/callback')) return;
    handleAuthCallback(url).catch((error) => {
      console.error('Could not complete mobile sign-in callback', error);
    });
  };

  CapacitorApp.addListener('appUrlOpen', ({ url }) => consumeAuthUrl(url)).catch(() => {});
  CapacitorApp.getLaunchUrl().then((launch) => consumeAuthUrl(launch?.url)).catch(() => {});
}
