"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";
import { LogOut, Monitor, Moon, ShieldCheck, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

const THEMES = [
  { value: "light",  label: "Light",  icon: Sun     },
  { value: "dark",   label: "Dark",   icon: Moon    },
  { value: "system", label: "System", icon: Monitor },
] as const;

function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card className="border-white/30 dark:border-white/10">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sun className="h-4 w-4 text-muted-foreground" />
          Appearance
        </CardTitle>
        <CardDescription>Choose how nrmd.link looks for you.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon }) => {
            const active = mounted && theme === value;
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-sm font-medium transition-all duration-200 cursor-pointer",
                  active
                    ? "border-primary/50 bg-primary/8 text-primary shadow-sm shadow-primary/10"
                    : "border-border bg-background/40 text-muted-foreground hover:border-primary/25 hover:text-foreground hover:bg-primary/4"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {label}
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsForm({ user }: Props) {
  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <AppearanceCard />

      {/* Profile card */}
      <Card className="border-white/30 dark:border-white/10">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-base font-semibold">Profile</CardTitle>
          <CardDescription>
            Your account details synced from your sign-in provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="bg-primary/12 text-primary font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-background">
                <ShieldCheck className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-base">{user.name ?? "—"}</p>
                <Badge
                  variant="outline"
                  className="text-xs rounded-full px-2 py-0 bg-green-500/8 border-green-500/20 text-green-600"
                >
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground/60">
                Your email has been verified. You have full access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account section */}
      <Card className="border-white/30 dark:border-white/10">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Account
          </CardTitle>
          <CardDescription>Manage your session and account access.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-2 bg-background/50 border-border hover:bg-background/80"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out of this device
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/25 border-white/0">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-base font-semibold text-destructive">
            Danger zone
          </CardTitle>
          <CardDescription>
            Once you delete your account, there is no going back. Please be certain.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out of all devices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
