"use client";

import { Users, User, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";

interface MobileNavProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  selectedEvent: string | null;
  isViewingProfile?: boolean;
  isCurrentUser?: boolean;
}

export function MobileNav({
  activeScreen,
  setActiveScreen,
  selectedEvent,
  isViewingProfile = false,
  isCurrentUser = true,
}: MobileNavProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in and fetch profile data
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      
      // If user is logged in, fetch their profile data
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!error && profileData) {
          setUserProfile(profileData);
        }
      }
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

  // Custom component for profile icon that can show the avatar
  const ProfileIcon = ({ className }: { className?: string }) => {
    if (userProfile?.avatar_url) {
      return (
        <Avatar className={`h-5 w-5 ${className}`}>
          <Image
            src={userProfile.avatar_url}
            alt="Profile"
            width={20}
            height={20}
            className="object-cover"
          />
        </Avatar>
      );
    }
    return <User className={className} />;
  };

  type NavItem = {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }> | React.FC<{ className?: string }>;
  };

  const navItems: NavItem[] = [
    { id: "events", label: "Events", icon: Home },
    { id: "bands", label: "Bands", icon: Users },
    { id: "profile", label: user ? "Profile" : "Login", icon: ProfileIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around px-2 z-10">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive =
          activeScreen === item.id ||
          (item.id === "events" && activeScreen === "event");

        // Determine if the button should be interactive
        const isProfileButton = item.id === "profile";
        const isInteractive = !isProfileButton || !isViewingProfile || isCurrentUser;

        return (
          <button
            key={item.id}
            data-screen={item.id}
            onClick={() => {
              if (!isInteractive) return;
              
              // If we're in an event and clicking the home/events button, go back to events list
              if (activeScreen === "event" && item.id === "events") {
                setActiveScreen("events");
              } else {
                setActiveScreen(item.id);
              }
            }}
            className={`flex flex-col items-center justify-center h-full w-full ${!isInteractive ? "opacity-50 cursor-default" : ""}`}
          >
            <IconComponent
              className={item.id !== 'profile' || !userProfile?.avatar_url ? `h-5 w-5 ${
                isActive ? "text-[#ffac6d]" : "text-gray-500"
              }` : isActive ? "text-[#ffac6d]" : "text-gray-500"}
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
