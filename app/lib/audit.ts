import { prisma } from "@/app/lib/prisma";

export async function logAudit(params: {
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  meta?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        meta: params.meta ? (params.meta as unknown as any) : undefined,
      },
    });
  } catch (err) {
    // Do not block main flow if logging fails
    console.error("audit_log_error", err);
  }
}


