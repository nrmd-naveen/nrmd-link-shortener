"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LinkOption { id: string; shortId: string; title: string | null; url: string }
interface AnalyticsData {
  totalClicks: number;
  timeSeries: { date: string; count: number }[];
  countries: { name: string; count: number }[];
  devices: { name: string; count: number }[];
  browsers: { name: string; count: number }[];
  os: { name: string; count: number }[];
  referrers: { name: string; count: number }[];
}

const CHART_COLORS = [
  "oklch(62% 0.24 250)",
  "oklch(68% 0.18 180)",
  "oklch(70% 0.21 320)",
  "oklch(76% 0.17 65)",
  "oklch(64% 0.21 145)",
  "oklch(65% 0.22 250)",
];

const DAYS_OPTIONS = [
  { value: "7",  label: "7 Days" },
  { value: "30", label: "30 Days" },
  { value: "90", label: "90 Days" },
];

export function AnalyticsDashboard({ links }: { links: LinkOption[] }) {
  const [selectedLinkId, setSelectedLinkId] = useState<string>(links[0]?.id ?? "");
  const [days, setDays] = useState("30");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedLinkId) return;
    setLoading(true);
    fetch(`/api/v1/analytics/${selectedLinkId}?days=${days}`)
      .then((r) => r.json())
      .then((d: AnalyticsData) => setData(d))
      .finally(() => setLoading(false));
  }, [selectedLinkId, days]);

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 glass rounded-2xl py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Create a link to see analytics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {/* Link selector */}
        <div className="glass rounded-xl px-1 py-1 flex gap-1 overflow-x-auto max-w-full">
          {links.slice(0, 6).map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLinkId(l.id)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all",
                selectedLinkId === l.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/4"
              )}
            >
              /{l.shortId}
            </button>
          ))}
        </div>

        {/* Days filter */}
        <div className="glass rounded-xl px-1 py-1 flex gap-1">
          {DAYS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                days === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/4"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Total clicks + chart */}
          <Card className="border-white/30 dark:border-white/10">
            <CardHeader className="px-6 pt-6 pb-2">
              <div className="flex items-end gap-3">
                <div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total clicks
                  </CardTitle>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight">
                    {data.totalClicks.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.timeSeries} margin={{ left: -16 }}>
                  <defs>
                    <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="oklch(42% 0.19 285)" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="oklch(42% 0.19 285)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "oklch(50% 0.05 285)" }}
                    tickFormatter={(v: string) => v.slice(5)}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "oklch(50% 0.05 285)" }}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      background: "oklch(100% 0 0 / 90%)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid oklch(100% 0 0 / 40%)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 24px oklch(42% 0.19 285 / 0.1)",
                    }}
                    formatter={(v: unknown) => [(v as number).toLocaleString(), "Clicks"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="oklch(42% 0.19 285)"
                    strokeWidth={2}
                    fill="url(#clickGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "oklch(42% 0.19 285)", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Breakdown cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BreakdownCard title="Top Countries" data={data.countries} />
            <BreakdownCard title="Devices"       data={data.devices} />
            <BreakdownCard title="Browsers"      data={data.browsers} />
            <BreakdownCard title="Operating Systems" data={data.os} />
            <BreakdownCard
              title="Referrers"
              data={data.referrers}
              className="sm:col-span-2 lg:col-span-2"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  className = "",
}: {
  title: string;
  data: { name: string; count: number }[];
  className?: string;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Card className={cn("border-white/30 dark:border-white/10", className)}>
      <CardHeader className="px-5 pt-5 pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No data yet.</p>
        ) : (
          <div className="space-y-2.5">
            {data.slice(0, 5).map((item, i) => {
              const pct = total ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[140px]">{item.name}</span>
                    <span className="font-medium text-foreground shrink-0 ml-2">
                      {item.count.toLocaleString()}
                      <span className="text-muted-foreground ml-1">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/60">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
