"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
      // Sign up the user with email
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (signUpError) throw signUpError;
      
      // Show confirmation for email signup
      setEmail(formData.email);
      setShowConfirmation(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  // Show confirmation message if needed
  if (showConfirmation) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm text-center">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="mb-6">
          We've sent a confirmation link to <span className="font-medium">{email}</span>.
          Please check your inbox and click the link to verify your email address.
        </p>
        <p className="text-sm text-gray-600 mb-6">
          After verifying your email, you'll be taken through a quick setup process to customize your profile.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-[#ffac6d] hover:bg-[#fdc193] text-black"
          >
            Back to Login
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setIsLoading(true);
              try {
                const { error } = await supabase.auth.resend({
                  type: 'signup',
                  email: email,
                });
                if (error) throw error;
                toast.success('Confirmation email resent!');
              } catch (error: any) {
                toast.error(error.message || 'Failed to resend email');
              } finally {
                setIsLoading(false);
              }
            }}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Resend Confirmation'}
          </Button>
        </div>
      </div>
    );
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
