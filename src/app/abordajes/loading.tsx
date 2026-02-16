export default function AbordajesLoading() {
    return (
        <div className="space-y-6 p-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-48" />
                <div className="h-10 bg-gray-200 rounded w-36" />
            </div>
            {/* Table skeleton */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="h-12 bg-gray-100 border-b" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-4 bg-gray-200 rounded w-20" />
                        <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}
