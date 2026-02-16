export default function DatosBasicosLoading() {
    return (
        <div className="space-y-6 p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48" />
            {/* Grid of cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border p-6 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    );
}
