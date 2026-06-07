import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LinksList } from "@/components/dashboard/links-list";
import { CreateLinkDialog } from "@/components/dashboard/create-link-dialog";
import { UtmBuilder } from "@/components/dashboard/utm-builder";
import { BulkShortenDialog } from "@/components/dashboard/bulk-shorten-dialog";

type SortField = "createdAt" | "updatedAt" | "clicks";
type SortOrder = "asc" | "desc";

interface SearchParams {
  sort?: string;
  order?: string;
}

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const sp = await searchParams;

  const sortField: SortField =
    sp.sort === "updatedAt" ? "updatedAt" : sp.sort === "clicks" ? "clicks" : "createdAt";
  const orderDir: SortOrder = sp.order === "asc" ? "asc" : "desc";

  const orderBy =
    sortField === "clicks"
      ? ({ clicks: { _count: orderDir } } as const)
      : sortField === "updatedAt"
      ? ({ updatedAt: orderDir } as const)
      : ({ createdAt: orderDir } as const);

  const [links, tags] = await Promise.all([
    prisma.url.findMany({
      where: { userId },
      orderBy,
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
    <div className="space-y-5 sm:space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Links</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track, manage and optimise your shortened URLs.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <UtmBuilder />
          <BulkShortenDialog />
          <CreateLinkDialog tags={tags} />
        </div>
      </div>
      <LinksList initialLinks={links} tags={tags} />
    </div>
  );
}
