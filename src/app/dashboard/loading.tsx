import { DashboardSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
    return (
        <div className="container mx-auto py-6">
            <DashboardSkeleton />
        </div>
    );
}
