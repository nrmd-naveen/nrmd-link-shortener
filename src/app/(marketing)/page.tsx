import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShortenForm } from "@/components/shared/shorten-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";
import {
  Zap,
  BarChart3,
  Shield,
  Globe2,
  Clock,
  KeyRound,
  QrCode,
  Link2,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-strong border-b border-white/25">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-heading font-bold text-[15px] tracking-tight"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/30">
              <Link2 className="h-[15px] w-[15px] text-primary-foreground" />
            </div>
            {siteConfig.domain}
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="#features" />}
              className="text-muted-foreground hover:text-foreground rounded-xl"
            >
              Features
            </Button>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="#how-it-works" />}
              className="text-muted-foreground hover:text-foreground rounded-xl"
            >
              How it works
            </Button>
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/login" />}
              className="text-muted-foreground hover:text-foreground rounded-xl px-3 sm:px-4"
            >
              Sign in
            </Button>
            <Button
              size="sm"
              render={<Link href="/login" />}
              className="rounded-xl shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 active:scale-95 px-3 sm:px-4"
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center px-5 sm:px-6 pb-14 sm:pb-20 pt-14 sm:pt-20 text-center">

        {/* Single clean radial glow */}
        <div className="hero-glow pointer-events-none absolute inset-0 -z-10" />

        {/* Badge */}
        <div className="animate-fade-in mb-5 sm:mb-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 sm:px-4 py-1.5 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse-soft" />
            <span className="hidden sm:inline">Edge Redirects · Real-time Analytics · No login required</span>
            <span className="sm:hidden">Fast links · Real-time analytics</span>
          </span>
        </div>

        {/* Headline — two blocks so gradient renders correctly */}
        <div className="animate-fade-in-up delay-100">
          <h1 className="max-w-[780px] font-extrabold leading-[0.96] tracking-[-0.04em]">
            <span className="block text-[clamp(48px,8vw,88px)] text-foreground">
              Build shorter,
            </span>
            <span
              className="block text-[clamp(48px,8vw,88px)]"
              style={{
                backgroundImage: "var(--hero-gradient)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              reach further.
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-[480px] text-[17px] leading-[1.65] text-muted-foreground">
          The high-performance link management platform for digital-first brands.
          Lightning-fast redirects and precision analytics — all in one place.
        </p>

        {/* Floating stat pills */}
        <div className="animate-fade-in-up delay-300 mt-7 sm:mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { icon: Zap,              label: "< 50ms redirects" },
            { icon: MousePointerClick, label: "Real-time clicks" },
            { icon: TrendingUp,        label: "Country & device breakdown" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-muted-foreground"
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              {label}
            </span>
          ))}
        </div>

        {/* Shorten form — the main CTA */}
        <div className="animate-fade-in-up delay-400 mt-6 sm:mt-8 w-full max-w-[540px]">
          <ShortenForm />
        </div>

        {/* Footnote */}
        <p className="animate-fade-in-up delay-500 mt-4 text-xs text-muted-foreground/55">
          Anonymous links expire after {siteConfig.anonTtlHours} hours.{" "}
          <Link
            href="/login"
            className="text-primary/70 underline underline-offset-2 hover:text-primary transition-colors"
          >
            Sign in
          </Link>{" "}
          for permanent links & analytics.
        </p>
      </section>

      {/* ── Social proof strip ──────────────────────────────── */}
      <div className="border-y border-border/30">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-4 grid grid-cols-4 sm:flex sm:items-center sm:justify-center sm:gap-8">
          {[
            { value: "50ms",  label: "Avg redirect" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "∞",     label: "Tracked" },
            { value: "5s",    label: "Setup" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col sm:flex-row items-center sm:items-baseline gap-0.5 sm:gap-1.5">
              <span className="font-heading text-base sm:text-xl font-bold text-foreground">{value}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-5 sm:px-6 py-16 sm:py-24">
        <div className="mb-10 sm:mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary/60">
            Features
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight sm:text-4xl">
            Precision tools for modern links
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm sm:text-base text-muted-foreground">
            Enterprise-grade features optimised for speed, security, and developer experience.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass hover-lift animate-fade-in-up rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 active:scale-[0.97]"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <h3 className="text-xs sm:text-sm font-semibold">{f.title}</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 sm:px-6 py-16 sm:py-24">
        <div className="mb-10 sm:mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary/60">
            Getting started
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to link perfection.
          </h2>
        </div>

        <div className="grid gap-3 sm:gap-5 sm:grid-cols-3">
          {HOW.map((step, i) => (
            <div
              key={step.title}
              className="glass hover-lift animate-fade-in-up rounded-2xl p-6 sm:p-8 text-center active:scale-[0.97]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mx-auto mb-4 sm:mb-5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-primary font-bold text-base sm:text-lg text-primary-foreground shadow-lg shadow-primary/25">
                {i + 1}
              </div>
              <h3 className="text-sm sm:text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-border/40">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 px-5 sm:px-6 py-5 sm:py-6 text-xs text-muted-foreground/70">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
              <Link2 className="h-3 w-3 text-primary" />
            </div>
            <span>© {new Date().getFullYear()} {siteConfig.domain}</span>
          </div>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: Zap,
    title: "Edge-fast redirects",
    description: "Links cached at the edge — redirects complete in under 50ms worldwide.",
  },
  {
    icon: BarChart3,
    title: "Click analytics",
    description: "Track clicks, countries, devices, browsers, and referrers in real time.",
  },
  {
    icon: Shield,
    title: "Password protection",
    description: "Lock links behind a password so only intended recipients can access.",
  },
  {
    icon: Globe2,
    title: "Browser-bar shortening",
    description: `Type ${siteConfig.domain}/https://… directly in any address bar.`,
  },
  {
    icon: Clock,
    title: "Link expiry",
    description: "Set links to expire by date or by click count automatically.",
  },
  {
    icon: KeyRound,
    title: "Custom slugs",
    description: "Pick memorable keywords. Auto-incremented if already taken.",
  },
  {
    icon: QrCode,
    title: "QR codes",
    description: "Download PNG or SVG QR codes for any link with custom colours.",
  },
  {
    icon: Link2,
    title: "No-login shortening",
    description: `Shorten instantly, no account needed. Links live for ${siteConfig.anonTtlHours} hours.`,
  },
];

const HOW = [
  {
    title: "Paste your URL",
    description: "Drop a long URL into the form, or type it straight into the address bar.",
  },
  {
    title: "Get your short link",
    description: "A unique short link is generated instantly — optionally with a custom keyword.",
  },
  {
    title: "Share & track",
    description: "Share the link and watch your analytics update in real time.",
  },
];
