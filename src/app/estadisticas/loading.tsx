export default function EstadisticasLoading() {
    return (
        <div className="space-y-6 p-6 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-64" />
                <div className="h-4 bg-gray-100 rounded w-96" />
            </div>
            {/* Filters */}
            <div className="flex gap-4">
                <div className="h-10 bg-gray-200 rounded w-48" />
                <div className="h-10 bg-gray-200 rounded w-48" />
                <div className="h-10 bg-gray-200 rounded w-48" />
            </div>
            {/* Tab bar */}
            <div className="h-12 bg-gray-100 rounded-lg w-full" />
            {/* Chart area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border p-6 h-72" />
                <div className="bg-white rounded-xl border p-6 h-72" />
            </div>
        </div>
    );
}
