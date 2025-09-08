import AdminAuditPage from "@/app/admin/AdminAuditPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolved = await searchParams;
  return <AdminAuditPage searchParams={resolved as any} />;
}


