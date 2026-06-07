"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import type { $Enums } from "@prisma/client";

interface TagShape { id: string; name: string; color: string; userId: string; createdAt: Date }

export function CreateLinkDialog({ tags }: { tags: TagShape[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [clickLimit, setClickLimit] = useState("");
  const [password, setPassword] = useState("");
  const [redirectType, setRedirectType] = useState("302");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body: Record<string, unknown> = { url, redirectType: Number(redirectType) };
    if (keyword)          body.keyword   = keyword;
    if (expiresAt)        body.expiresAt = new Date(expiresAt).toISOString();
    if (clickLimit)       body.clickLimit = Number(clickLimit);
    if (password)         body.password  = password;
    if (selectedTags.length) body.tagIds = selectedTags;

    try {
      const res = await fetch("/api/v1/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create link");
        return;
      }
      setOpen(false);
      router.refresh();
      setUrl(""); setKeyword(""); setExpiresAt(""); setClickLimit(""); setPassword(""); setRedirectType("302"); setSelectedTags([]);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="rounded-xl gap-1.5 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25"
          />
        }
      >
        <Plus className="h-4 w-4" />
        New link
      </DialogTrigger>

      <DialogContent className="sm:max-w-md glass-strong rounded-2xl border-white/30">
        <DialogHeader>
          <DialogTitle>Create a new link</DialogTitle>
          <DialogDescription>Shorten a URL with optional controls.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          {/* Destination URL */}
          <div className="space-y-1.5">
            <Label htmlFor="dl-url" className="text-xs font-medium text-muted-foreground">
              Destination URL *
            </Label>
            <Input
              id="dl-url"
              type="url"
              placeholder="https://example.com/long-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="h-10 rounded-xl bg-background/50 border-border focus:bg-background/70"
            />
          </div>

          {/* Custom keyword */}
          <div className="space-y-1.5">
            <Label htmlFor="dl-keyword" className="text-xs font-medium text-muted-foreground">
              Custom keyword
            </Label>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-xs text-muted-foreground font-mono">nrmd.link/</span>
              <Input
                id="dl-keyword"
                placeholder="my-link"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                pattern="[a-zA-Z0-9_-]*"
                className="h-10 rounded-xl font-mono bg-background/50 border-border"
              />
            </div>
          </div>

          {/* Expiry + click limit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dl-expires" className="text-xs font-medium text-muted-foreground">
                Expires at
              </Label>
              <Input
                id="dl-expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="h-10 rounded-xl bg-background/50 border-border text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dl-limit" className="text-xs font-medium text-muted-foreground">
                Click limit
              </Label>
              <Input
                id="dl-limit"
                type="number"
                min={1}
                placeholder="∞"
                value={clickLimit}
                onChange={(e) => setClickLimit(e.target.value)}
                className="h-10 rounded-xl bg-background/50 border-border"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="dl-pw" className="text-xs font-medium text-muted-foreground">
              Password (optional)
            </Label>
            <Input
              id="dl-pw"
              type="password"
              placeholder="Leave blank for public link"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border"
            />
          </div>

          {/* Redirect type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Redirect type</Label>
            <Select value={redirectType} onValueChange={(v) => { if (v) setRedirectType(v); }}>
              <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="302">302 — Temporary (recommended)</SelectItem>
                <SelectItem value="301">301 — Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
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

          <Button
            type="submit"
            className="w-full rounded-xl shadow-md shadow-primary/20"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create link
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

void (null as unknown as $Enums.UrlStatus);
