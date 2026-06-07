"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Copy, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";

interface BulkResult {
  url: string;
  shortId?: string;
  shortUrl?: string;
  error?: string;
}

export function BulkShortenDialog() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const urls = text
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 50);

    if (urls.length === 0) return;

    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/v1/links/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed");
        return;
      }
      setResults(data.results);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function copyOne(idx: number, shortUrl: string) {
    await navigator.clipboard.writeText(shortUrl);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  async function copyAll() {
    const urls = results.filter((r) => r.shortUrl).map((r) => r.shortUrl!);
    await navigator.clipboard.writeText(urls.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success(`Copied ${urls.length} short URLs`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" />
        }
      >
        <Layers className="h-3.5 w-3.5" />
        Bulk Shorten
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg glass-strong rounded-2xl border-white/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Shorten</DialogTitle>
          <DialogDescription>Enter up to 50 URLs, one per line.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <textarea
            className="glass h-40 w-full rounded-xl px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            placeholder={"https://example.com/page-one\nhttps://example.com/page-two\nhttps://example.com/page-three"}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            type="submit"
            className="w-full rounded-xl shadow-md shadow-primary/20"
            disabled={loading || !text.trim()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Shorten all
          </Button>
        </form>

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {results.filter((r) => r.shortUrl).length} / {results.length} succeeded
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-lg gap-1.5 text-xs"
                onClick={copyAll}
              >
                {copiedAll ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                Copy all
              </Button>
            </div>
            <div className="glass rounded-xl overflow-hidden divide-y divide-border/30">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs text-muted-foreground truncate">{r.url}</p>
                    {r.shortUrl ? (
                      <p className="text-xs font-mono font-semibold text-primary">
                        {siteConfig.domain}/{r.shortId}
                      </p>
                    ) : (
                      <p className="text-xs text-destructive">{r.error}</p>
                    )}
                  </div>
                  {r.shortUrl && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-6 w-6 rounded-lg shrink-0"
                      onClick={() => copyOne(i, r.shortUrl!)}
                    >
                      {copiedIdx === i ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
