import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LinksList } from "@/components/dashboard/links-list";
import { CreateLinkDialog } from "@/components/dashboard/create-link-dialog";

export default async function LinksPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [links, tags] = await Promise.all([
    prisma.url.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { clicks: true } },
      },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl animate-fade-in-up">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Links</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track, manage and optimise your shortened URLs.
          </p>
        </div>
        <div className="shrink-0">
          <CreateLinkDialog tags={tags} />
        </div>
      </div>
      <LinksList initialLinks={links} tags={tags} />
    </div>
  );
}
