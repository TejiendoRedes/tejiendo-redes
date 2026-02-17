import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/10 rounded-lg border border-dashed">
            {Icon && (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="mt-4" variant="outline">
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
