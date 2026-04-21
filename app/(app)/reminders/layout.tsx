import { requireRole } from "@/lib/require-role";

export default async function RemindersLayout({ children }: { children: React.ReactNode }) {
  await requireRole("COUNSELOR");
  return <>{children}</>;
}
