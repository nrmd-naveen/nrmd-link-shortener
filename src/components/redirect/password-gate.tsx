"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props { shortId: string; error?: string }

export function PasswordGate({ shortId, error }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    router.push(`/${shortId}?__pw=${encodeURIComponent(password)}`);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Dark atmospheric background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[oklch(10%_0.03_285)]" />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[700px] -translate-x-1/2 rounded-full bg-[oklch(42%_0.19_285)]/12 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      {/* Logo at top */}
      <div className="absolute left-6 top-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-heading font-bold text-white/60 hover:text-white/90 transition-colors"
        >
          <Image src="/Logo_nrmd_link.png" alt="NRMD Links" width={24} height={24} className="rounded-md" />
          NRMD Links
        </Link>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25 ml-8">
          Secure Gateway
        </p>
      </div>

      {/* Glass card */}
      <div className="animate-scale-in w-full max-w-[340px]">
        <div
          className="rounded-3xl p-8 space-y-6"
          style={{
            background: "oklch(100% 0 0 / 8%)",
            backdropFilter: "blur(24px) saturate(1.3)",
            WebkitBackdropFilter: "blur(24px) saturate(1.3)",
            border: "1px solid oklch(100% 0 0 / 16%)",
            boxShadow: "inset 0 1px 0 oklch(100% 0 0 / 20%), 0 16px 64px oklch(0% 0 0 / 0.4)",
          }}
        >
          {/* Lock icon */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "oklch(42% 0.19 285 / 0.2)",
                border: "1px solid oklch(42% 0.19 285 / 0.3)",
              }}
            >
              <Lock className="h-7 w-7 text-[oklch(75%_0.18_285)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Protected Link
              </h1>
              <p className="mt-1 text-sm text-white/55 leading-relaxed">
                This destination is encrypted. Please provide the access password to continue.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="h-11 rounded-xl text-white placeholder:text-white/30 focus:ring-primary/30"
              style={{
                background: "oklch(100% 0 0 / 8%)",
                border: "1px solid oklch(100% 0 0 / 18%)",
              }}
            />
            {error && (
              <p className="text-xs text-red-400/90 px-1">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? "Verifying…" : "Enter Secure Destination"}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer meta */}
      <div className="absolute bottom-5 flex gap-5 text-xs text-white/25">
        <span>🔒 Password</span>
        <span>⏱ Expiry</span>
        <span>🔗 Limit</span>
      </div>

      <p className="absolute bottom-10 text-[10px] text-white/20">
        © {new Date().getFullYear()} NRMD Links · Privacy · Terms
      </p>
    </div>
  );
}
