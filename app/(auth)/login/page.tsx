"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authClient } from "@/lib/auth-client";

const inputClass = "border-white/10 bg-slate-950/60 text-white placeholder:text-white/40 focus-visible:border-blue-500 focus-visible:ring-blue-500/20";
const labelClass = "text-white";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  console.log('Login page loaded');

  const validateForm = () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
      } else {
        toast.success("Successfully signed in with Google!");
        // Check for redirect location from sessionStorage
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
        router.push(redirectPath);
      }
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      toast.error((error as Error).message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {

      const result = await authClient.signIn.email({
        email,
        password,
      })
 
        toast.success('Login successful! Welcome back.');
        // Check for redirect location from sessionStorage
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
        router.push(redirectPath);
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast.error((error as Error).message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <Card className="w-full max-w-md border-white/10 bg-slate-900/50 shadow-xl shadow-blue-950/20">
        <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-3 shadow-lg shadow-blue-950/30">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-blue-200 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
            Admin
            </h1>
          </div>
          <CardTitle className="text-white">Sign in to your account</CardTitle>
          <p className="text-white/60">Welcome back to your Admin platform</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full border-white/10 bg-slate-950/60 text-white hover:bg-blue-500/10 hover:text-blue-100"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-white/45">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className={labelClass}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className={labelClass}>Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${inputClass} pr-10`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-white/50 hover:bg-transparent hover:text-blue-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>


          <div className="text-center space-y-2">
            <p className="text-sm text-white/60">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-300 hover:text-blue-200 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
