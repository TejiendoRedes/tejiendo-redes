import { TableSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
    return (
        <div className="container mx-auto py-6 space-y-4">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <TableSkeleton />
        </div>
    );
}
