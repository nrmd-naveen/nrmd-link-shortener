import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

interface AuditParams {
  userId?: string | null;
  action: string;
  entityId?: string | null;
  entityType?: string | null;
  meta?: Record<string, unknown> | null;
  ipHash?: string | null;
  userAgent?: string | null;
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entityId: params.entityId ?? null,
        entityType: params.entityType ?? null,
        meta: params.meta ? (params.meta as Prisma.InputJsonValue) : undefined,
        ipHash: params.ipHash ?? null,
        userAgent: params.userAgent?.slice(0, 256) ?? null,
      },
    });
  } catch {
    // Audit log failures must never crash the main request
  }
}
