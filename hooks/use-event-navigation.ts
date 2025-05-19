"use client";

import { useRouter } from "next/navigation";

/**
 * Hook for consistent event navigation throughout the app
 * Provides methods to navigate to events while maintaining sidebar visibility
 */
export function useEventNavigation() {
  const router = useRouter();

  /**
   * Navigate to an event page
   * @param eventId - The ID of the event to navigate to
   */
  const navigateToEvent = (eventId: string) => {
    router.push(`/?event=${eventId}`);
  };

  /**
   * Set up an event listener for custom event navigation
   * This is used when components need to listen for navigation events
   * @param callback - Optional callback to run after navigation
   */
  const setupEventListener = (callback?: () => void) => {
    if (typeof window === 'undefined') return () => {};
    
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const eventId = customEvent.detail?.eventId;
      if (eventId) {
        router.push(`/?event=${eventId}`);
        if (callback) callback();
      }
    };
    
    window.addEventListener('openEvent', handleOpenEvent);
    
    return () => {
      window.removeEventListener('openEvent', handleOpenEvent);
    };
  };

  return {
    navigateToEvent,
    setupEventListener
  };
}
