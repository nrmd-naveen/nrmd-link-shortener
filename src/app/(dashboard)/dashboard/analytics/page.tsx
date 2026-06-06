import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const links = await prisma.url.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, shortId: true, title: true, url: true },
  });

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl animate-fade-in-up">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Analytics</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Real-time performance tracking for your digital assets.
        </p>
      </div>
      <AnalyticsDashboard links={links} />
    </div>
  );
}
