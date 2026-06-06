"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Check, Clock, Copy, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export function ApiKeysList({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/v1/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setNewKey(data.key as string);
      setKeys((prev) => [
        {
          id: data.id as string,
          name: data.name as string,
          keyPreview: data.keyPreview as string,
          lastUsedAt: null,
          createdAt: new Date(data.createdAt as string),
        },
        ...prev,
      ]);
      setName("");
    }
  }

  async function handleCopy() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/v1/keys/${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setDeleteId(null);
  }

  return (
    <div className="space-y-5">
      {/* Create dialog */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setNewKey(null);
        }}
      >
        <DialogTrigger render={<Button size="sm" className="rounded-xl gap-1.5 shadow-md shadow-primary/20" />}>
          <Plus className="h-4 w-4" />
          Create API key
        </DialogTrigger>
        <DialogContent className="sm:max-w-md glass-strong rounded-2xl border-white/30">
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              The key is shown only once. Store it somewhere safe.
            </DialogDescription>
          </DialogHeader>

          {newKey ? (
            <div className="space-y-4 py-2">
              <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 px-4 py-3 text-xs text-amber-700">
                Copy this key now — you won&apos;t be able to see it again.
              </div>
              <div className="flex gap-2">
                <Input
                  value={newKey}
                  readOnly
                  className="rounded-xl font-mono text-xs bg-background/50 border-border"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-xl shrink-0 bg-background/50 border-border hover:bg-background/75"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                className="w-full rounded-xl"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="key-name" className="text-xs font-medium text-muted-foreground">
                  Key name
                </Label>
                <Input
                  id="key-name"
                  placeholder="e.g. CI pipeline"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl bg-background/50 border-border h-10"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl shadow-md shadow-primary/20"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate key
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Key list */}
      {keys.length === 0 ? (
        <div className="flex flex-col items-center gap-3 glass rounded-2xl py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">No API keys yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Create a key to start using the REST API.
            </p>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden divide-y divide-border/30">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center gap-4 px-5 py-4 group hover:bg-black/2 transition-colors"
            >
              {/* Icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <KeyRound className="h-4 w-4 text-primary" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{key.name}</p>
                  <Badge
                    variant="outline"
                    className="text-xs rounded-full px-2 py-0 bg-green-500/8 border-green-500/20 text-green-600 hidden sm:inline-flex"
                  >
                    Active
                  </Badge>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {key.keyPreview}
                  <span className="tracking-widest">••••••••••</span>
                </p>
              </div>

              {/* Dates */}
              <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {key.lastUsedAt
                    ? `Used ${format(new Date(key.lastUsedAt), "MMM d")}`
                    : "Never used"}
                </span>
                <span>Created {format(new Date(key.createdAt), "MMM d, yyyy")}</span>
              </div>

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                onClick={() => setDeleteId(key.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="glass-strong rounded-2xl border-white/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              Applications using this key will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive/90 hover:bg-destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
