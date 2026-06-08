import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiKeysList } from "@/components/dashboard/api-keys-list";

export default async function ApiKeysPage() {
  const session = await auth();
  const userId = session!.user.id;

  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPreview: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-5 sm:space-y-6 max-w-2xl animate-fade-in-up">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">API Keys</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Programmatically manage links, track analytics, and integrate NRMD Links
          directly into your high-performance applications.
        </p>
      </div>
      <ApiKeysList initialKeys={keys} />
    </div>
  );
}
