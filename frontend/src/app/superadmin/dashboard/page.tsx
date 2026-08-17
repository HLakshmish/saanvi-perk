import { DashboardView } from "@/components/dashboard/DashboardView";

export default function SuperadminDashboardPage() {
  return (
    <DashboardView
      initialRole="superadmin"
      userName=""
      companyName=""
    />
  );
}
