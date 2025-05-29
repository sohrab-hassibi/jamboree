"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/SupabaseContext"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign up the user with email (no email confirmation)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      // Check if the user was created but not confirmed
      if (data?.user && !data.user.email_confirmed_at) {
        console.log('User created but not confirmed, attempting to sign in anyway');
        
        // Try to sign in even though email isn't confirmed
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (signInError) {
          // If we get an error about email confirmation, we'll handle it specially
          if (signInError.message.includes('Email not confirmed')) {
            console.log('Email not confirmed error, but proceeding anyway');
            // We'll continue with the flow despite the error
          } else {
            // For other errors, we'll throw them
            throw signInError;
          }
        }
      } else {
        // Normal sign in if user was created and confirmed
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (signInError) throw signInError;
      }
      
      // Add a small delay to ensure the auth record is fully propagated
      // This helps with foreign key constraints
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // First create a user entry - this is needed for the foreign key constraint in profiles
        // Ensure data.user exists before using it
        if (!data?.user?.id) {
          console.error('User data not available after signup');
          throw new Error('User data not available after signup');
        }
        
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: formData.email,
            full_name: formData.fullName,
            created_at: new Date().toISOString(),
          });
            
        if (userError) {
          console.error('Error creating user record:', userError);
          console.error('User error details:', JSON.stringify(userError));
        } else {
          console.log('User record created successfully');
          
          // Now create the profile entry after the user entry is created
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              full_name: formData.fullName,
              bio: '',
              instruments: [],
              genres: [],
              updated_at: new Date().toISOString(),
            });
              
          if (profileError) {
            console.error('Error creating profile:', profileError);
            console.error('Profile error details:', JSON.stringify(profileError));
          } else {
            console.log('Profile created successfully');
          }
        }
      } catch (dbError) {
        console.error('Database operation error:', dbError);
      }
      
      toast.success("Account created successfully!");
      // Instead of redirecting, show the onboarding flow
      setShowOnboarding(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  // If onboarding should be shown, render the onboarding flow
  if (showOnboarding) {
    return <OnboardingFlow />;
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <Input
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
            minLength={6}
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-[#ffac6d] hover:bg-[#fdc193] text-black"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-[#ffac6d] hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
