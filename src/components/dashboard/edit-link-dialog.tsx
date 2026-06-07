"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface TagShape { id: string; name: string; color: string }
export interface EditableLinkShape {
  id: string;
  shortId: string;
  url: string;
  title: string | null;
  status: string;
  password: string | null;
  expiresAt: string | Date | null;
  clickLimit: number | null;
  redirectType: number;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  tags: { tag: TagShape }[];
}

interface Props {
  link: EditableLinkShape;
  tags: TagShape[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // The API returns the full Prisma object which may include extra fields; callers narrow as needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdated: (updated: any) => void;
}

export function EditLinkDialog({ link, tags, open, onOpenChange, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState(link.url);
  const [keyword, setKeyword] = useState(link.shortId);
  const [status, setStatus] = useState(link.status);
  const [expiresAt, setExpiresAt] = useState(
    link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : ""
  );
  const [clickLimit, setClickLimit] = useState(link.clickLimit?.toString() ?? "");
  const [ogTitle, setOgTitle] = useState(link.ogTitle ?? "");
  const [ogDescription, setOgDescription] = useState(link.ogDescription ?? "");
  const [ogImage, setOgImage] = useState(link.ogImage ?? "");
  const [redirectType, setRedirectType] = useState(String(link.redirectType));
  const [selectedTags, setSelectedTags] = useState<string[]>(link.tags.map((t) => t.tag.id));

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body: Record<string, unknown> = { url, status, tagIds: selectedTags, redirectType: Number(redirectType) };
    if (keyword !== link.shortId) body.keyword = keyword;
    if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();
    else body.expiresAt = null;
    if (clickLimit) body.clickLimit = Number(clickLimit);
    else body.clickLimit = null;
    if (ogTitle) body.ogTitle = ogTitle;
    else body.ogTitle = null;
    if (ogDescription) body.ogDescription = ogDescription;
    else body.ogDescription = null;
    if (ogImage) body.ogImage = ogImage;
    else body.ogImage = null;

    try {
      const res = await fetch(`/api/v1/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Keyword already taken") {
          setError(`Keyword "${keyword}" is already taken. Try "${data.suggestion}".`);
        } else {
          setError(data.error ?? "Failed to update link");
        }
        return;
      }
      onUpdated(data);
      onOpenChange(false);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-strong rounded-2xl border-white/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit link</DialogTitle>
          <DialogDescription>Update destination, settings, and metadata.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="el-url" className="text-xs font-medium text-muted-foreground">
              Destination URL *
            </Label>
            <Input
              id="el-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="h-10 rounded-xl bg-background/50 border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="el-keyword" className="text-xs font-medium text-muted-foreground">
              Custom keyword
            </Label>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-xs text-muted-foreground font-mono">nrmd.link/</span>
              <Input
                id="el-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                pattern="[a-zA-Z0-9_-]*"
                className="h-10 rounded-xl font-mono bg-background/50 border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={(v) => { if (v) setStatus(v); }}>
                <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Redirect type</Label>
              <Select value={redirectType} onValueChange={(v) => { if (v) setRedirectType(v); }}>
                <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="302">302 Temporary</SelectItem>
                  <SelectItem value="301">301 Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="el-expires" className="text-xs font-medium text-muted-foreground">
                Expires at
              </Label>
              <Input
                id="el-expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="h-10 rounded-xl bg-background/50 border-border text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="el-limit" className="text-xs font-medium text-muted-foreground">
                Click limit
              </Label>
              <Input
                id="el-limit"
                type="number"
                min={1}
                placeholder="∞"
                value={clickLimit}
                onChange={(e) => setClickLimit(e.target.value)}
                className="h-10 rounded-xl bg-background/50 border-border"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="el-og-title" className="text-xs font-medium text-muted-foreground">
              OG Title override
            </Label>
            <Input
              id="el-og-title"
              placeholder="Custom title for link previews"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="el-og-desc" className="text-xs font-medium text-muted-foreground">
              OG Description override
            </Label>
            <Input
              id="el-og-desc"
              placeholder="Custom description for link previews"
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="el-og-image" className="text-xs font-medium text-muted-foreground">
              OG Image URL override
            </Label>
            <Input
              id="el-og-image"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border"
            />
          </div>

          {tags.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer select-none rounded-full px-3 py-1 text-xs transition-all"
                      style={{
                        borderColor: tag.color + (active ? "cc" : "55"),
                        color: active ? "#fff" : tag.color,
                        backgroundColor: active ? tag.color : tag.color + "12",
                      }}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-destructive/8 px-4 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl shadow-md shadow-primary/20"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
