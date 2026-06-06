"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pause,
  Play,
  QrCode,
  Search,
  Trash2,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface TagShape { id: string; name: string; color: string }
interface LinkShape {
  id: string;
  shortId: string;
  url: string;
  title: string | null;
  status: string;
  password: string | null;
  expiresAt: Date | null;
  clickLimit: number | null;
  createdAt: Date;
  tags: { tag: TagShape }[];
  _count: { clicks: number };
}

export function LinksList({
  initialLinks,
}: {
  initialLinks: LinkShape[];
  tags: TagShape[];
}) {
  const [links, setLinks] = useState(initialLinks);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = links.filter(
    (l) =>
      l.shortId.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase()) ||
      (l.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCopy(shortId: string) {
    await navigator.clipboard.writeText(`${siteConfig.url}/${shortId}`);
    setCopiedId(shortId);
    setTimeout(() => setCopiedId(null), 2200);
  }

  async function handleToggleStatus(link: LinkShape) {
    const newStatus = link.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await fetch(`/api/v1/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, status: newStatus } : l))
    );
  }

  async function handleDelete(id: string) {
    await fetch(`/api/v1/links/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
    setDeleteId(null);
    router.refresh();
  }

  async function handleDownloadQr(link: LinkShape) {
    const res = await fetch(`/api/v1/links/${link.id}/qr?format=png&size=400`);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${link.shortId}.png`;
    a.click();
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <input
          placeholder="Search links…"
          className="glass h-10 w-full rounded-xl pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl glass py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Link2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {search ? "No links match your search." : "No links yet."}
            </p>
            {!search && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Create your first link to get started.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Table header */
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/20 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>Destination / Short URL</span>
            <span className="hidden sm:block">Status</span>
            <span className="hidden md:block">Clicks</span>
            <span className="hidden lg:block">Created</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-border/30">
            {filtered.map((link) => (
              <div
                key={link.id}
                className="group grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 hover:bg-black/2 transition-colors"
              >
                {/* Link info */}
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`${siteConfig.url}/${link.shortId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm font-semibold text-primary hover:underline underline-offset-2 truncate"
                    >
                      {siteConfig.domain}/{link.shortId}
                    </a>
                    {link.tags.map(({ tag }) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs rounded-full px-2 py-0"
                        style={{ borderColor: tag.color + "55", color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {link.title ?? link.url}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                    {link.password && <span>🔒</span>}
                    {link.expiresAt && (
                      <span>Expires {format(new Date(link.expiresAt), "MMM d")}</span>
                    )}
                    {link.clickLimit && <span>Limit {link.clickLimit}</span>}
                  </div>
                </div>

                {/* Status */}
                <div className="hidden sm:block">
                  <StatusBadge status={link.status} />
                </div>

                {/* Clicks */}
                <div className="hidden md:block text-right">
                  <span className="text-sm font-semibold">
                    {link._count.clicks.toLocaleString()}
                  </span>
                </div>

                {/* Created */}
                <div className="hidden lg:block text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(link.createdAt), "MMM d, yyyy")}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopy(link.shortId)}
                    title="Copy link"
                  >
                    {copiedId === link.shortId ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 rounded-lg"
                        />
                      }
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-52 glass-strong border-white/30"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer"
                        render={
                          <a
                            href={`${siteConfig.url}/${link.shortId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                          window.location.assign(`/dashboard/analytics?link=${link.id}`)
                        }
                      >
                        <BarChart3 className="h-4 w-4" />
                        View analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleDownloadQr(link)}
                      >
                        <QrCode className="h-4 w-4" />
                        Download QR
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(link)}
                      >
                        {link.status === "ACTIVE" ? (
                          <>
                            <Pause className="h-4 w-4" />
                            Pause link
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Resume link
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="glass-strong rounded-2xl border-white/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this link?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the short link and all its click analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive/90 hover:bg-destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ACTIVE:   { label: "Active",   className: "bg-green-500/10 text-green-600 border-green-500/20" },
    PAUSED:   { label: "Paused",   className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    ARCHIVED: { label: "Archived", className: "bg-muted text-muted-foreground border-border/40" },
    EXPIRED:  { label: "Expired",  className: "bg-red-500/10 text-red-600 border-red-500/20" },
  };
  const { label, className } = map[status] ?? map["ACTIVE"];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs rounded-full px-2.5 py-0.5 font-medium", className)}
    >
      {label}
    </Badge>
  );
}
