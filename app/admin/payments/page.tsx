import { Suspense } from "react";
import PaymentsTable from "@/components/admin/PaymentsTable";
export const metadata = { title: "Payments" };
export default function Page() {
  return (
    <Suspense>
      <PaymentsTable />
    </Suspense>
  );
}
