"use client";

import { Users, User, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface MobileNavProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  selectedEvent: string | null;
}

export function MobileNav({
  activeScreen,
  setActiveScreen,
  selectedEvent,
}: MobileNavProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { id: "events", label: "Events", icon: Home },
    { id: "bands", label: "Bands", icon: Users },
    { id: "profile", label: user ? "Profile" : "Login", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around px-2 z-10">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          activeScreen === item.id ||
          (item.id === "events" && activeScreen === "event");

        return (
          <button
            key={item.id}
            data-screen={item.id}
            onClick={() => {
              // If we're in an event and clicking the home/events button, go back to events list
              if (activeScreen === "event" && item.id === "events") {
                setActiveScreen("events");
              } else {
                setActiveScreen(item.id);
              }
            }}
            className="flex flex-col items-center justify-center h-full w-full"
          >
            <Icon
              className={`h-5 w-5 ${
                isActive ? "text-[#ffac6d]" : "text-gray-500"
              }`}
            />
            <span
              className={`text-xs mt-1 ${
                isActive ? "text-[#ffac6d] font-medium" : "text-gray-500"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
