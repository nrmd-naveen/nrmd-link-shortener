"use client";

import { useState, useMemo } from "react";
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
import { Check, Copy, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onShorten?: (url: string) => void;
}

export function UtmBuilder({ onShorten }: Props) {
  const [open, setOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [shortening, setShortening] = useState(false);

  const composedUrl = useMemo(() => {
    if (!baseUrl) return "";
    try {
      const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
      if (source)   url.searchParams.set("utm_source",   source);
      if (medium)   url.searchParams.set("utm_medium",   medium);
      if (campaign) url.searchParams.set("utm_campaign", campaign);
      if (term)     url.searchParams.set("utm_term",     term);
      if (content)  url.searchParams.set("utm_content",  content);
      return url.toString();
    } catch {
      return "";
    }
  }, [baseUrl, source, medium, campaign, term, content]);

  async function handleCopy() {
    if (!composedUrl) return;
    await navigator.clipboard.writeText(composedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  }

  async function handleShorten() {
    if (!composedUrl) return;
    setShortening(true);
    try {
      const res = await fetch("/api/v1/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: composedUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to shorten");
        return;
      }
      toast.success(`Shortened: ${data.shortUrl}`);
      onShorten?.(composedUrl);
      setOpen(false);
    } catch {
      toast.error("Network error");
    } finally {
      setShortening(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" />
        }
      >
        <Wrench className="h-3.5 w-3.5" />
        UTM Builder
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg glass-strong rounded-2xl border-white/30">
        <DialogHeader>
          <DialogTitle>UTM Builder</DialogTitle>
          <DialogDescription>Compose a URL with UTM tracking parameters.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="utm-base" className="text-xs font-medium text-muted-foreground">
              Base URL *
            </Label>
            <Input
              id="utm-base"
              placeholder="https://example.com/page"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="utm-source" className="text-xs font-medium text-muted-foreground">
                utm_source *
              </Label>
              <Input
                id="utm-source"
                placeholder="newsletter"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="h-9 rounded-xl bg-background/50 border-border text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="utm-medium" className="text-xs font-medium text-muted-foreground">
                utm_medium *
              </Label>
              <Input
                id="utm-medium"
                placeholder="email"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="h-9 rounded-xl bg-background/50 border-border text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="utm-campaign" className="text-xs font-medium text-muted-foreground">
              utm_campaign *
            </Label>
            <Input
              id="utm-campaign"
              placeholder="spring_launch"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="utm-term" className="text-xs font-medium text-muted-foreground">
                utm_term (optional)
              </Label>
              <Input
                id="utm-term"
                placeholder="running shoes"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="h-9 rounded-xl bg-background/50 border-border text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="utm-content" className="text-xs font-medium text-muted-foreground">
                utm_content (optional)
              </Label>
              <Input
                id="utm-content"
                placeholder="banner_top"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-9 rounded-xl bg-background/50 border-border text-sm"
              />
            </div>
          </div>

          {composedUrl && (
            <div className="rounded-xl bg-muted/50 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Preview</p>
              <p className="text-xs font-mono break-all text-foreground">{composedUrl}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 rounded-xl gap-1.5"
              onClick={handleCopy}
              disabled={!composedUrl}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy URL
            </Button>
            <Button
              className="flex-1 rounded-xl shadow-md shadow-primary/20"
              onClick={handleShorten}
              disabled={!composedUrl || shortening}
            >
              {shortening && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Shorten this URL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
