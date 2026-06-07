"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart3,
  KeyRound,
  Link2,
  MousePointerClick,
  Pencil,
  Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLog {
  id: string;
  action: string;
  entityId: string | null;
  entityType: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  "link.create":      { label: "Created a link",     icon: Link2,             color: "text-green-500" },
  "link.update":      { label: "Updated a link",     icon: Pencil,            color: "text-blue-500" },
  "link.delete":      { label: "Deleted a link",     icon: Trash2,            color: "text-destructive" },
  "link.click":       { label: "Link clicked",       icon: MousePointerClick, color: "text-primary" },
  "link.bulk_update": { label: "Bulk updated links", icon: Link2,             color: "text-blue-500" },
  "link.bulk_delete": { label: "Bulk deleted links", icon: Trash2,            color: "text-destructive" },
  "apikey.create":    { label: "Created an API key", icon: KeyRound,          color: "text-amber-500" },
  "apikey.delete":    { label: "Deleted an API key", icon: KeyRound,          color: "text-destructive" },
};

export function ActivityFeed() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/audit?limit=20")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden divide-y divide-border/30">
      {logs.map((log) => {
        const meta = ACTION_META[log.action] ?? {
          label: log.action,
          icon: BarChart3,
          color: "text-muted-foreground",
        };
        const Icon = meta.icon;
        const shortId =
          (log.meta as Record<string, string> | null)?.shortId ??
          log.entityId?.slice(0, 8) ??
          "—";

        return (
          <div key={log.id} className="flex items-center gap-3 px-4 py-3">
            <div className={`shrink-0 ${meta.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">{meta.label}</p>
              <p className="text-xs text-muted-foreground font-mono truncate">{shortId}</p>
            </div>
            <p className="text-xs text-muted-foreground/60 shrink-0 whitespace-nowrap">
              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
