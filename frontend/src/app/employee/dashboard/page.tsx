import { DashboardView } from "@/components/dashboard/DashboardView";

export default function EmployeeDashboardPage() {
  return (
    <DashboardView
      initialRole="employee"
      userName="Rahul Sharma"
      companyName="Saanvi Technologies"
    />
  );
}
