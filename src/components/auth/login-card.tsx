"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Link2, Loader2 } from "lucide-react";

export function LoginCard() {
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const error = searchParams.get("error");

  async function handleOAuth(provider: string) {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    const res = await signIn("resend", { email, callbackUrl, redirect: false });
    setEmailLoading(false);
    if (res?.ok) setEmailSent(true);
  }

  return (
    <div className="glass rounded-3xl p-8">
      {/* Logo mark */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <Link2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log in to manage your high-performance links.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl bg-destructive/8 px-4 py-2.5 text-sm text-destructive">
          {error === "OAuthSignin" ? "OAuth sign-in failed. Try again." : error}
        </div>
      )}

      {emailSent ? (
        /* Email sent state */
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-primary/8 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Check your email</p>
            <p className="mt-1 text-xs text-muted-foreground">
              We sent a sign-in link to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* OAuth buttons */}
          <Button
            variant="outline"
            className="h-10 w-full rounded-xl bg-background/50 border-border hover:bg-background/75 gap-3"
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
          >
            {oauthLoading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="h-10 w-full rounded-xl bg-background/50 border-border hover:bg-background/75 gap-3"
            onClick={() => handleOAuth("github")}
            disabled={!!oauthLoading}
          >
            {oauthLoading === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            Continue with GitHub
          </Button>

          {/* Divider */}
          <div className="relative my-1">
            <Separator className="bg-border/50" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-3 text-xs text-muted-foreground rounded-full border border-border/50">
              or
            </span>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 rounded-xl bg-background/50 border-border focus:bg-background/70"
              />
            </div>
            <Button
              type="submit"
              className="h-10 w-full rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
              disabled={emailLoading}
            >
              {emailLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Continue with Email
            </Button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-xs text-muted-foreground pt-1">
            Don&apos;t have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-2">
              Sign up for free
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
