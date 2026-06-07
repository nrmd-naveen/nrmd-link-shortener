"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  BarChart3,
  KeyRound,
  LayoutDashboard,
  Link2,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const run = useCallback(
    (fn: () => void) => {
      setOpen(false);
      setTimeout(fn, 50);
    },
    []
  );

  function goTo(href: string) {
    run(() => router.push(href));
  }

  function focusSearch() {
    run(() => {
      const input = document.querySelector<HTMLInputElement>('[placeholder="Search links…"]');
      input?.focus();
    });
  }

  function newLink() {
    run(() => {
      const trigger = document.querySelector<HTMLElement>('[data-slot="dialog-trigger"]');
      trigger?.click();
    });
  }

  function toggleDarkMode() {
    run(() => setTheme(theme === "dark" ? "light" : "dark"));
  }

  function copyLastUrl() {
    run(async () => {
      try {
        const res = await fetch("/api/v1/links?limit=1");
        const data = await res.json();
        const first = data.links?.[0];
        if (first) {
          await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_APP_URL ?? "https://nrmd.link"}/${first.shortId}`
          );
        }
      } catch {
        // ignore
      }
    });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem onSelect={newLink}>
              <Plus className="h-4 w-4" />
              New Link
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={focusSearch}>
              <Search className="h-4 w-4" />
              Search Links
              <CommandShortcut>⌘F</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={copyLastUrl}>
              <Link2 className="h-4 w-4" />
              Copy last shortened URL
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => goTo("/dashboard")}>
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </CommandItem>
            <CommandItem onSelect={() => goTo("/dashboard/links")}>
              <Link2 className="h-4 w-4" />
              Go to Links
            </CommandItem>
            <CommandItem onSelect={() => goTo("/dashboard/analytics")}>
              <BarChart3 className="h-4 w-4" />
              Go to Analytics
            </CommandItem>
            <CommandItem onSelect={() => goTo("/dashboard/settings")}>
              <Settings className="h-4 w-4" />
              Go to Settings
            </CommandItem>
            <CommandItem onSelect={() => goTo("/dashboard/api-keys")}>
              <KeyRound className="h-4 w-4" />
              Go to API Keys
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Preferences">
            <CommandItem onSelect={toggleDarkMode}>
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              Toggle {theme === "dark" ? "Light" : "Dark"} Mode
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
