"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  QrCode,
  Search,
  Trash2,
  Archive,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { EditLinkDialog, type EditableLinkShape } from "@/components/dashboard/edit-link-dialog";
import { toast } from "sonner";

interface TagShape { id: string; name: string; color: string }
interface LinkShape extends EditableLinkShape {
  createdAt: Date | string;
  _count: { clicks: number };
}

interface Props {
  initialLinks: LinkShape[];
  tags: TagShape[];
}

export function LinksList({ initialLinks, tags }: Props) {
  const [links, setLinks] = useState(initialLinks);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editLink, setEditLink] = useState<LinkShape | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? "createdAt";
  const currentOrder = searchParams.get("order") ?? "desc";

  function updateSort(sort: string, order: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.set("order", order);
    router.push(`${pathname}?${params.toString()}`);
  }

  const filtered = links.filter(
    (l) =>
      l.shortId.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase()) ||
      (l.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const someSelected = selected.size > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
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

  function handleUpdated(updated: LinkShape) {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    toast.success("Link updated");
    router.refresh();
  }

  async function handleBulkDelete() {
    const ids = [...selected];
    const res = await fetch("/api/v1/links/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    const data = await res.json();
    setLinks((prev) => prev.filter((l) => !ids.includes(l.id)));
    setSelected(new Set());
    setBulkDeleteOpen(false);
    toast.success(`Deleted ${data.deleted} links`);
    router.refresh();
  }

  async function handleBulkStatus(status: "PAUSED" | "ARCHIVED") {
    const ids = [...selected];
    await fetch("/api/v1/links/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status }),
    });
    setLinks((prev) =>
      prev.map((l) => (ids.includes(l.id) ? { ...l, status } : l))
    );
    setSelected(new Set());
    toast.success(`Updated ${ids.length} links`);
  }

  async function handleExportSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    const url = `/api/v1/analytics/${ids[0]}/export?format=csv&range=all`;
    window.open(url, "_blank");
  }

  const sortLabel = {
    createdAt: "Date created",
    updatedAt: "Date updated",
    clicks: "Clicks",
  }[currentSort] ?? "Date created";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            placeholder="Search links…"
            className="glass h-10 w-full rounded-xl pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <Select
            value={`${currentSort}:${currentOrder}`}
            onValueChange={(v) => {
              if (!v) return;
              const [s, o] = v.split(":");
              updateSort(s, o);
            }}
          >
            <SelectTrigger className="h-9 rounded-xl bg-background/50 border-border text-xs gap-1.5">
              <SelectValue placeholder={sortLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Newest first</SelectItem>
              <SelectItem value="createdAt:asc">Oldest first</SelectItem>
              <SelectItem value="updatedAt:desc">Recently updated</SelectItem>
              <SelectItem value="clicks:desc">Most clicks</SelectItem>
              <SelectItem value="clicks:asc">Fewest clicks</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        <div className="glass rounded-2xl overflow-hidden">
          {/* Table header — hidden on mobile, shown on sm+ */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/20 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer"
              />
            </div>
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
                className={cn(
                  "group flex items-center gap-3 px-5 py-4 hover:bg-black/2 transition-colors sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] sm:gap-4",
                  selected.has(link.id) && "bg-primary/4"
                )}
              >
                {/* Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.has(link.id)}
                    onChange={() => toggleSelect(link.id)}
                    className="h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer"
                  />
                </div>

                {/* Link info */}
                <div className="min-w-0 flex-1 space-y-0.5">
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
                    {link.redirectType === 301 && (
                      <span className="bg-amber-500/10 text-amber-600 rounded px-1 py-0 text-[10px] font-mono">301</span>
                    )}
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

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditLink(link)}
                    title="Edit link"
                  >
                    <Pencil className="h-3.5 w-3.5" />
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
                        onClick={() => handleCopy(link.shortId)}
                      >
                        <Copy className="h-4 w-4" />
                        Copy link
                      </DropdownMenuItem>
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
                        onClick={() => setEditLink(link)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit link
                      </DropdownMenuItem>
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

      {/* Bulk action bar */}
      {someSelected && (
        <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="glass-strong rounded-2xl border-white/30 px-4 py-3 flex items-center gap-3 shadow-xl">
            <span className="text-sm font-medium text-muted-foreground">
              {selected.size} selected
            </span>
            <div className="h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-xl gap-1.5 text-xs"
              onClick={() => handleBulkStatus("PAUSED")}
            >
              <Pause className="h-3.5 w-3.5" />
              Pause
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-xl gap-1.5 text-xs"
              onClick={() => handleBulkStatus("ARCHIVED")}
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-xl gap-1.5 text-xs text-destructive hover:text-destructive"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-xl gap-1.5 text-xs"
              onClick={() => setSelected(new Set())}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Single delete dialog */}
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

      {/* Bulk delete dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="glass-strong rounded-2xl border-white/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} links?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the selected short links and all their click analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive/90 hover:bg-destructive"
              onClick={handleBulkDelete}
            >
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      {editLink && (
        <EditLinkDialog
          link={editLink}
          tags={tags}
          open={!!editLink}
          onOpenChange={(open) => !open && setEditLink(null)}
          onUpdated={handleUpdated}
        />
      )}
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
