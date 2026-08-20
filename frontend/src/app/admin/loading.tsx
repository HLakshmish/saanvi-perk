import { AdminDashboardSkeleton } from "@/components/dashboard/AdminDashboardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f4fbf7] p-4 sm:p-6 max-w-7xl mx-auto">
      <AdminDashboardSkeleton />
    </div>
  );
}
