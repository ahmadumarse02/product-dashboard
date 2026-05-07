"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Package, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authClient } from "@/lib/auth-client";

const inputClass = "border-white/10 bg-slate-950/60 text-white placeholder:text-white/40 focus-visible:border-blue-500 focus-visible:ring-blue-500/20";
const labelClass = "text-white";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  console.log('Register page loaded');

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return { strength: 'weak', color: 'bg-red-500', text: 'Weak' };
    if (pwd.length < 10) return { strength: 'medium', color: 'bg-yellow-500', text: 'Medium' };
    return { strength: 'strong', color: 'bg-green-500', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateForm = () => {
    if (!firstName.trim()) {
      toast.error('Please enter your first name');
      return false;
    }
    if (!lastName.trim()) {
      toast.error('Please enter your last name');
      return false;
    }
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
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
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {

      const result = await authClient.signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`,
      });

      if (result.error) {
        toast.error(result.error.message || "Registration failed")
      } else {
        toast.success("Account created successfully!");
        router.push("/");
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-950 p-4 py-8 text-white sm:items-center">
      <Card className="w-full max-w-lg border-white/10 bg-slate-900/50 shadow-xl shadow-blue-950/20">
        <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-3 shadow-lg shadow-blue-950/30">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-blue-200 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
            Admin
            </h1>
          </div>
          <CardTitle className="text-white">Create your account</CardTitle>
          <p className="text-white/60">Get started with your Admin platform</p>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className={labelClass}>First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className={labelClass}>Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>
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
                  placeholder="Create a password"
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
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: passwordStrength.strength === 'weak' ? '33%' :
                            passwordStrength.strength === 'medium' ? '66%' : '100%'
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/55">
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`${inputClass} pr-10`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-white/50 hover:bg-transparent hover:text-blue-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="flex items-center gap-1 text-sm text-red-300">
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                <p className="flex items-center gap-1 text-sm text-green-300">
                  <Check className="h-4 w-4" />
                  Passwords match
                </p>
              )}
            </div>
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>


          <div className="text-center">
            <p className="text-sm text-white/60">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-300 hover:text-blue-200 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
