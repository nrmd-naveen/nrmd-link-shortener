"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import {
  BarChart3,
  KeyRound,
  Link2,
  LayoutDashboard,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",           label: "Overview",  icon: LayoutDashboard },
  { href: "/dashboard/links",     label: "Links",     icon: Link2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/api-keys",  label: "API Keys",  icon: KeyRound },
  { href: "/dashboard/settings",  label: "Settings",  icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[220px] shrink-0 lg:flex lg:flex-col glass-strong border-r border-white/30 sticky top-0 h-screen">
      {/* Logo */}
      <Link
        href="/"
        className="flex h-16 items-center gap-2.5 border-b border-white/20 px-5"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/30">
          <Link2 className="h-[15px] w-[15px] text-primary-foreground" />
        </div>
        <span className="font-heading font-bold text-[15px] tracking-tight">
          {siteConfig.domain}
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 pt-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-foreground/6 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                )}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom divider */}
      <div className="border-t border-white/20 p-4">
        <p className="text-[10px] text-muted-foreground/50 text-center tracking-wide">
          {siteConfig.domain} · v1
        </p>
      </div>
    </aside>
  );
}
