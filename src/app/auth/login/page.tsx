"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Shield, Bus, Users, Building } from "lucide-react";
import { Role } from "@prisma/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error: authError, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("PARENT");
  const [error, setError] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    const sid = searchParams.get("schoolId");
    if (sid) setSchoolId(sid);
  }, [searchParams]);

  const demoCredentials = {
    PARENT: { email: "parent1@saferide.edu", password: "parent123" },
    DRIVER: { email: "driver@saferide.edu", password: "driver123" },
    ADMIN: { email: "admin@saferide.edu", password: "admin123" },
  };

  const roleIcons = {
    PARENT: Users,
    DRIVER: Bus,
    ADMIN: Shield,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    await login(email, password, schoolId || undefined);
  };

  const fillDemo = (selectedRole: Role) => {
    setRole(selectedRole);
    setEmail(demoCredentials[selectedRole].email);
    setPassword(demoCredentials[selectedRole].password);
  };

  const RoleIcon = roleIcons[role];

  return (
    <Card className="border-border/30 shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">SR</span>
          </div>
          <span className="text-2xl font-bold text-primary">SafeRide School</span>
        </div>
        <CardTitle>Select Role & Login</CardTitle>
        <CardDescription>
          Choose your role to continue to the login form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(["PARENT", "DRIVER", "ADMIN"] as Role[]).map((r) => {
            const Icon = roleIcons[r];
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                  role === r
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border/30 text-secondary hover:border-accent/30"
                }}`}
              >
                <Icon className="h-4 w-4" />
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        {schoolId && (
          <div className="mb-4 p-3 bg-accent/5 border border-accent/20 rounded-xl flex items-center gap-2">
            <Building className="h-4 w-4 text-accent" />
            <span className="text-sm text-primary">School selected: {schoolId}</span>
          </div>
        )}

        {(authError || error) && (
          <div className="bg-emergency/10 border border-emergency/20 text-emergency text-xs rounded-xl p-3 mb-4">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password" required>
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
          >
            Sign In as {role.charAt(0) + role.slice(1).toLowerCase()}
          </Button>
        </form>

        {isDev && (
          <div className="mt-4 text-center text-xs text-secondary">
            <p className="mb-2">Demo credentials:</p>
            <button
              type="button"
              onClick={() => fillDemo("PARENT")}
              className="text-accent hover:underline"
            >
              Parent (parent1@saferide.edu / parent123)
            </button>
            {" | "}
            <button
              type="button"
              onClick={() => fillDemo("DRIVER")}
              className="text-accent hover:underline"
            >
              Driver
            </button>
            {" | "}
            <button
              type="button"
              onClick={() => fillDemo("ADMIN")}
              className="text-accent hover:underline"
            >
              Admin
            </button>
          </div>
        )}

        <div className="mt-4 text-center text-sm">
          <Link href="/auth/register" className="text-accent hover:underline">
            Need an account? Register
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[400px]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
