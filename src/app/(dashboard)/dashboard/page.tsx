import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  BarChart3,
  Link2,
  MousePointerClick,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { subDays, format } from "date-fns";
import Link from "next/link";
import type { Url } from "@prisma/client";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const since30d = subDays(new Date(), 30);

  const [totalLinks, totalClicks, recentClicks, recentLinks] =
    await Promise.all([
      prisma.url.count({ where: { userId } }),
      prisma.click.count({ where: { url: { userId } } }),
      prisma.click.count({
        where: { url: { userId }, createdAt: { gte: since30d } },
      }),
      prisma.url.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { clicks: true } } },
      }),
    ]);

  const avgClicks = totalLinks ? Math.round(totalClicks / totalLinks) : 0;

  const STATS = [
    {
      label: "Total links",
      value: totalLinks,
      icon: Link2,
      color: "text-violet-600",
      bg: "bg-violet-500/10",
    },
    {
      label: "Total clicks",
      value: totalClicks,
      icon: MousePointerClick,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "Clicks (30d)",
      value: recentClicks,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Avg clicks / link",
      value: avgClicks,
      icon: BarChart3,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-7 max-w-5xl animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Overview</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Performance highlights for the last 30 days.
          </p>
        </div>
        <Link
          href="/dashboard/links"
          className={cn(
            buttonVariants({ size: "sm" }),
            "shrink-0 rounded-xl gap-1.5 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create link</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Stat cards — 2-col grid on mobile matches the Horizon reference design */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }, i) => (
          <Card
            key={label}
            className="hover-lift animate-fade-in-up border-white/30 dark:border-white/10 active:scale-[0.97]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4 sm:pt-5 sm:px-5 sm:pb-2">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
              </CardTitle>
              <div className={cn("flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl", bg)}>
                <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", color)} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent links */}
      <Card className="border-white/30 dark:border-white/10 animate-fade-in-up delay-300">
        <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <CardTitle className="text-sm sm:text-base font-semibold">Recent links</CardTitle>
          <Link
            href="/dashboard/links"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {recentLinks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted/40 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">No links yet</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <Link href="/dashboard/links" className="text-primary underline underline-offset-2">
                    Create your first link
                  </Link>{" "}
                  to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentLinks.map((link: Url & { _count: { clicks: number } }) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between gap-3 py-3 sm:py-3.5 first:pt-0 last:pb-0 group"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs sm:text-sm font-semibold text-primary truncate">
                        nrmd.link/{link.shortId}
                      </p>
                      <StatusDot status={(link as { status: string }).status} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {link.url}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {link._count.clicks.toLocaleString()}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {format(new Date(link.createdAt), "MMM d")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/50 pb-2">
        <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
        <span>© {new Date().getFullYear()} nrmd.link</span>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE:   "bg-green-500",
    PAUSED:   "bg-amber-500",
    EXPIRED:  "bg-red-500",
    ARCHIVED: "bg-gray-400",
  };
  return (
    <span
      className={cn("inline-block h-1.5 w-1.5 rounded-full", map[status] ?? "bg-gray-400")}
    />
  );
}
