"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { GradientButton } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
}

export default function AdminRegisterPage() {
  const router = useRouter();
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    toast.error("Admin registration is disabled. Please login.");
    // Slight delay so the toast is visible
    const t = setTimeout(() => router.replace("/auth/login"), 600);
    return () => clearTimeout(t);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Admin registration is disabled. Please login.");
    router.replace("/auth/login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* OGL shader background: light yellow, light orange and white */}
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg mr-3">
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-black">
              Create Account
            </h1>
          </div>
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-black">
          Join the system
        </h2>
        <p className="mt-2 text-center text-sm text-black px-4">
          Create your admin account to get started
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-black">Admin Registration Disabled</CardTitle>
            <CardDescription className="text-sm text-black">
              Please contact the system administrator or proceed to login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-black">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-black" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={registerData.username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData({ ...registerData, username: e.target.value })}
                    className="pl-10 h-10 sm:h-9"
                    placeholder="Choose a username"
                  />
                </div>
                <p className="text-xs text-black">
                  3-50 characters, letters, numbers, underscores, and hyphens only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-black">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-black" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={registerData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="pl-10 pr-10 h-10 sm:h-9"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black/80 p-1 rounded-sm hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-black">
                  Minimum 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-black">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-black" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={registerData.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 h-10 sm:h-9"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-black hover:text-black/80 p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <GradientButton
                type="submit"
                disabled={loading}
                className="w-full h-10 sm:h-9"
              >
                {loading ? "Redirecting..." : "Go to Login"}
              </GradientButton>
            </form>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-black">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors duration-200">
                    Sign in here
                  </Link>
                </p>
              </div>
              
              <div className="text-center">
                <GradientButton variant="ghost" asChild className="h-10 sm:h-9">
                  <Link href="/" className="text-black hover:text-black/80">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Home
                  </Link>
                </GradientButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
