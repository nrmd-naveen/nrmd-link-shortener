"use client";

import { ShortenForm } from "@/components/shared/shorten-form";

interface Props {
  initialUrl: string;
}

export function BrowserBarShorten({ initialUrl }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Shorten this URL</h1>
          <p className="text-muted-foreground text-sm">
            Detected a URL in the address bar — shorten it in one click.
          </p>
        </div>
        <ShortenForm initialUrl={initialUrl} />
      </div>
    </div>
  );
}
