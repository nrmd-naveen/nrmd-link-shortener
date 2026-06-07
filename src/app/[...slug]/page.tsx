import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redis, keys } from "@/lib/redis";
import { recordClick } from "@/lib/analytics";
import { logAudit } from "@/lib/audit";
import { siteConfig } from "@/config/site";
import { PasswordGate } from "@/components/redirect/password-gate";
import { BrowserBarShorten } from "@/components/redirect/browser-bar-shorten";
import { compare } from "bcryptjs";

interface Props {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string>>;
}

export default async function SlugPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const qp = await searchParams;

  const first = decodeURIComponent(slug[0]);

  // ── Browser-bar shortening: nrmd.link/https://... ──────────────────────────
  if (
    first.startsWith("http:") ||
    first.startsWith("https:") ||
    first.includes(".")
  ) {
    const reconstructed = slug.map((s) => decodeURIComponent(s)).join("/");
    const withQuery = Object.keys(qp).length
      ? `${reconstructed}?${new URLSearchParams(qp).toString()}`
      : reconstructed;
    const prefixed = withQuery.startsWith("http") ? withQuery : `https://${withQuery}`;
    return <BrowserBarShorten initialUrl={prefixed} />;
  }

  const shortId = first;

  // ── DB lookup ───────────────────────────────────────────────────────────────
  const link = await prisma.url.findUnique({
    where: { shortId },
    select: {
      id: true,
      url: true,
      status: true,
      password: true,
      expiresAt: true,
      anonExpiresAt: true,
      clickLimit: true,
      redirectType: true,
      _count: { select: { clicks: true } },
    },
  });

  if (!link) {
    // Cache negative so middleware can short-circuit next time
    await redis.set(keys.shortLinkNotFound(shortId), 1, { ex: 300 });
    notFound();
  }

  // ── Expiry check ─────────────────────────────────────────────────────────
  const now = new Date();
  const expired =
    (link.expiresAt && link.expiresAt < now) ||
    (link.anonExpiresAt && link.anonExpiresAt < now) ||
    link.status === "EXPIRED";

  if (expired) {
    await prisma.url.update({ where: { shortId }, data: { status: "EXPIRED" } });
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Link expired</h1>
          <p className="text-muted-foreground">This link is no longer active.</p>
          <a href={siteConfig.url} className="text-primary underline">
            Create a new link →
          </a>
        </div>
      </div>
    );
  }

  if (link.status === "PAUSED") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Link paused</h1>
          <p className="text-muted-foreground">The owner has paused this link.</p>
        </div>
      </div>
    );
  }

  // ── Click limit check ───────────────────────────────────────────────────
  if (link.clickLimit !== null && link._count.clicks >= link.clickLimit) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Link limit reached</h1>
          <p className="text-muted-foreground">This link has reached its maximum click count.</p>
        </div>
      </div>
    );
  }

  // ── Password gate ─────────────────────────────────────────────────────────
  if (link.password) {
    const submitted = qp.__pw;
    if (!submitted) {
      return <PasswordGate shortId={shortId} />;
    }
    const valid = await compare(submitted, link.password);
    if (!valid) {
      return <PasswordGate shortId={shortId} error="Incorrect password" />;
    }
  }

  // ── Record analytics ─────────────────────────────────────────────────────
  const headerStore = await headers();
  const reqHeaders = new Headers();
  headerStore.forEach((value, key) => reqHeaders.set(key, value));

  // Non-blocking — don't await
  recordClick({
    urlId: link.id,
    request: { headers: reqHeaders },
  }).catch(() => {});

  logAudit({
    action: "link.click",
    entityId: link.id,
    entityType: "link",
    meta: { shortId },
  }).catch(() => {});

  // Non-blocking — cache warm must not delay or block the redirect
  redis.set(
    keys.shortLink(shortId),
    { url: link.url, redirectType: link.redirectType },
    { ex: siteConfig.redisCacheTtl }
  ).catch(() => {});

  redirect(link.url, link.redirectType === 301 ? "replace" : "push");
}
