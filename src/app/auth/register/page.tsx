"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Shield, Bus, Users } from "lucide-react";
import { Role } from "@prisma/client";

export default function RegisterPage() {
  const { register, error: authError, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("PARENT");
  const [error, setError] = useState("");

  const roleIcons = {
    PARENT: Users,
    DRIVER: Bus,
    ADMIN: Shield,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    await register(name, email, password, role, phone || undefined);
  };

  return (
    <Card className="border-border/30 shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">SR</span>
          </div>
          <span className="text-2xl font-bold text-primary">SafeRide School</span>
        </div>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>
          Register as a parent, driver, or school administrator
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

        {(authError || error) && (
          <div className="bg-emergency/10 border border-emergency/20 text-emergency text-xs rounded-xl p-3 mb-4">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" required>
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div>
            <Label htmlFor="reg-email" required>
              Email
            </Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="reg-password" required>
              Password
            </Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div>
            <Label htmlFor="phone">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
          >
            Create Account as {role.charAt(0) + role.slice(1).toLowerCase()}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="text-accent hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
