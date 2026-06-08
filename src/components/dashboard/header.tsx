"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function DashboardHeader({ user }: Props) {
  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex h-16 items-center justify-between glass-strong border-b border-white/25 px-4 sm:px-6 sticky top-0 z-40">
      {/* Mobile logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-heading font-bold text-[15px] tracking-tight lg:hidden"
      >
        <Image src="/Logo_nrmd_link.png" alt="NRMD Links" width={28} height={28} className="rounded-lg" />
        NRMD Links
      </Link>

      <div className="hidden lg:block" />

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle />

        {/* Notification bell — hidden on mobile to keep header clean */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-9 w-9 rounded-full p-0 ring-2 ring-transparent hover:ring-primary/20 transition-all"
              />
            }
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
              <AvatarFallback className="text-xs bg-primary/12 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 rounded-2xl glass-strong border-white/30 p-1">
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold truncate">{user.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              className="rounded-xl gap-2.5 cursor-pointer"
              render={<Link href="/dashboard/settings" />}
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl gap-2.5 cursor-pointer"
              render={<Link href="/dashboard" />}
            >
              <User className="h-3.5 w-3.5" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              className="rounded-xl gap-2.5 text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
