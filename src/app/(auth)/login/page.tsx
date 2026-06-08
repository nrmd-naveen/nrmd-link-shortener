import { Suspense } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LoginCard } from "@/components/auth/login-card";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-64 w-64 rounded-full bg-violet-400/12 blur-3xl" />
        <div className="absolute -right-40 bottom-1/4 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* Top bar — flex row keeps logo + badge from overlapping on narrow screens */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-heading font-bold text-foreground/80 hover:text-foreground transition-colors"
          >
            <Image src="/Logo_nrmd_link.png" alt="NRMD Links" width={24} height={24} className="rounded-md" />
            NRMD Links
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors pl-0.5"
          >
            <ArrowLeft className="h-2.5 w-2.5" />
            Back to home
          </Link>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/8 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium text-green-600">
          <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          <span className="hidden xs:inline">Safe &amp; Secure</span>
          <span className="xs:hidden">Secure</span>
        </span>
      </div>

      {/* Card */}
      <div className="animate-scale-in w-full max-w-[360px]">
        <Suspense>
          <LoginCard />
        </Suspense>
      </div>

      {/* Footer links */}
      <div className="mt-8 flex gap-5 text-xs text-muted-foreground/60">
        <Link href="/privacy" className="hover:text-muted-foreground transition-colors">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-muted-foreground transition-colors">
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
