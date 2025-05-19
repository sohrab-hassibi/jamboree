"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEventNavigation } from "@/hooks/use-event-navigation";

interface ProfileLayoutProps {
  children: React.ReactNode;
  isCurrentUser?: boolean;
}

export function ProfileLayout({ children, isCurrentUser = false }: ProfileLayoutProps) {
  // When viewing another user's profile, don't highlight the profile button
  const [activeScreen, setActiveScreen] = useState<string>(isCurrentUser ? "profile" : "");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { navigateToEvent, setupEventListener } = useEventNavigation();
  
  // Set up event listener for custom event navigation
  useEffect(() => {
    const cleanup = setupEventListener();
    return cleanup;
  }, [setupEventListener]);

  // Function to handle opening an event (redirects to main page)
  const handleOpenEvent = (eventId: string) => {
    navigateToEvent(eventId);
  };

  // Function to handle navigation between screens
  const handleScreenChange = (screen: string) => {
    if (screen === "events" || screen === "bands") {
      // Navigate to main app for these screens
      window.location.href = "/";
      return;
    }
    
    setActiveScreen(screen);
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {isDesktop && (
          <Sidebar
            activeScreen={activeScreen}
            setActiveScreen={handleScreenChange}
            selectedEvent={selectedEvent}
            onOpenEvent={handleOpenEvent}
          />
        )}

        <main className="flex-1 lg:overflow-hidden w-full">{children}</main>
      </div>

      {!isDesktop && (
        <MobileNav 
          activeScreen={activeScreen} 
          setActiveScreen={handleScreenChange} 
          selectedEvent={selectedEvent} 
        />
      )}
    </div>
  );
}
