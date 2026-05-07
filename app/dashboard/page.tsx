import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, TrendingUp, Users } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
          Welcome back, {session.user.name}
        </h1>
        <p className="break-all text-white/60">{session.user.email}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-white">Account Status</CardTitle>
              <CardDescription>Session active</CardDescription>
            </div>
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-white/80 mb-2">
              Your Better Auth session is active
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/60">Signed in securely</p>
              <SignOutButton />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-white">Products</CardTitle>
              <CardDescription>Manage catalog</CardDescription>
            </div>
            <Package className="w-8 h-8 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-white/80 mb-4">
              Manage the local product catalog
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/products">Open Products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-white">Quick Stats</CardTitle>
              <CardDescription>Overview</CardDescription>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">User ID</span>
                <span className="text-sm font-medium text-white truncate ml-2">
                  {session.user.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Email</span>
                <span className="ml-2 truncate text-sm font-medium text-white">
                  {session.user.email}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Card */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Session Information
          </CardTitle>
          <CardDescription>Your current session details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex flex-col gap-1 border-b border-white/10 py-2 sm:flex-row sm:justify-between">
              <span className="text-sm text-white/60">Name</span>
              <span className="text-sm font-medium text-white">{session.user.name}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-white/10 py-2 sm:flex-row sm:justify-between">
              <span className="text-sm text-white/60">Email</span>
              <span className="break-all text-sm font-medium text-white sm:text-right">{session.user.email}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between">
              <span className="text-sm text-white/60">Authentication Method</span>
              <span className="text-sm font-medium text-white">
                Better Auth Session
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
