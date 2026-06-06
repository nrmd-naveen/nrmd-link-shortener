"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Link2, LayoutDashboard, Settings } from "lucide-react";

const NAV = [
  { href: "/dashboard",           label: "Overview",  icon: LayoutDashboard },
  { href: "/dashboard/links",     label: "Links",     icon: Link2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings",  label: "Settings",  icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-strong border-t border-white/30"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch justify-around h-16">
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
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 select-none transition-all duration-200 active:scale-90",
                active ? "text-primary" : "text-muted-foreground/60"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-14 items-center justify-center rounded-2xl transition-all duration-200",
                  active ? "bg-primary/12" : ""
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none transition-colors",
                  active ? "text-primary" : "text-muted-foreground/60"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
