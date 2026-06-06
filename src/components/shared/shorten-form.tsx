"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface ShortenResult {
  shortId: string;
  shortUrl: string;
  isAnonymous: boolean;
  expiresAt?: string | null;
  duplicate?: boolean;
}

export function ShortenForm({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/v1/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          keyword: keyword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResult(data);
      setKeyword("");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="w-full space-y-3">
      {/* Main search-bar style form */}
      <form onSubmit={handleSubmit}>
        <div className="glass flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl p-2">
          {/* URL input */}
          <div className="relative flex-1 flex items-center">
            <Link2 className="absolute left-3.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
            <input
              type="url"
              placeholder="Paste a long URL here…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="h-12 w-full bg-transparent pl-10 pr-3 font-mono text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>

          {/* CTA button — full width on mobile, auto on sm+ */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "flex h-12 sm:h-9 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold",
              "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:bg-primary/90 active:scale-95 disabled:opacity-70 transition-all"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Shorten URL"
            )}
          </button>
        </div>
      </form>

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-1 pl-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        {showAdvanced ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        Custom keyword (optional)
      </button>

      {/* Custom keyword */}
      {showAdvanced && (
        <div className="glass animate-fade-in rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs text-muted-foreground font-mono">
              {siteConfig.domain}/
            </span>
            <Input
              placeholder="my-link"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              pattern="[a-zA-Z0-9_-]*"
              className="h-8 rounded-lg font-mono text-sm bg-background/50 border-border"
            />
          </div>
          <p className="text-[11px] text-muted-foreground/55 pl-0.5">
            Letters, numbers, hyphens, underscores only.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="animate-fade-in rounded-xl bg-destructive/8 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Result */}
      {result && (
        <div className="glass animate-scale-in rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-base font-bold text-primary break-all">
              {result.shortUrl}
            </p>
            {result.duplicate && (
              <Badge
                variant="secondary"
                className="text-xs shrink-0 rounded-full"
              >
                Existing
              </Badge>
            )}
            {result.isAnonymous && (
              <Badge
                variant="outline"
                className="text-xs shrink-0 rounded-full border-amber-400/40 bg-amber-400/8 text-amber-600"
              >
                Expires in {siteConfig.anonTtlHours}h
              </Badge>
            )}
          </div>
          {result.isAnonymous && (
            <p className="text-xs text-muted-foreground">
              Sign in for permanent links with full analytics.
            </p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-2 rounded-xl shadow-sm shadow-primary/15 hover:shadow-md hover:shadow-primary/20"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy link
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl bg-background/50 border-border hover:bg-background/80"
              render={
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
