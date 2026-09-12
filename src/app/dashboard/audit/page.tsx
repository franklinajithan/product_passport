import { requireWorkspace } from "@/authentication/workspace";
import { prisma } from "@/database/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/utilities/format";

export default async function OrgAuditPage() {
  const { membership } = await requireWorkspace();
  const logs = await prisma.auditLog.findMany({
    where: { organisationId: membership.organisationId },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
      <div className="mt-6 rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs">{formatDate(log.createdAt)}</TableCell>
                <TableCell>{log.actor?.email ?? "System"}</TableCell>
                <TableCell className="font-mono text-xs">{log.action}</TableCell>
                <TableCell className="text-xs">{log.entityType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
