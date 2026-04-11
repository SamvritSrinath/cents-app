/**
 * Keeps daily summary notifications aligned with preferences and today's spend when the user
 * is signed in. Resyncs when the app returns to foreground.
 */

import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { loadDevicePreferences } from '../lib/devicePreferences';
import { syncNotificationsForCurrentSessionAsync } from '../lib/notificationSessionSync';

export function NotificationPreferenceSync() {
  const { user } = useAuth();
  const userId = user?.id;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const run = useCallback(async () => {
    const preferences = await loadDevicePreferences();
    const uid = userIdRef.current;
    await syncNotificationsForCurrentSessionAsync(
      preferences,
      uid ? { id: uid } : null
    );
  }, []);

  useEffect(() => {
    void run();
  }, [run, userId]);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active') {
        void run();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [run]);

  return null;
}
