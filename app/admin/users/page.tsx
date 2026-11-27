import { Suspense } from "react";
import UsersTable from "@/components/admin/UsersTable";
export const metadata = { title: "Users" };
export default function Page() {
  return (
    <Suspense>
      <UsersTable />
    </Suspense>
  );
}
