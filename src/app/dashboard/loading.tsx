export default function DashboardLoading() {
    return (
        <div className="space-y-6 p-6 animate-pulse">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-3">
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-8 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted/50 rounded w-3/4" />
                    </div>
                ))}
            </div>
            {/* Chart area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6 h-72" />
                <div className="bg-card rounded-xl border border-border p-6 h-72" />
            </div>
        </div>
    );
}
