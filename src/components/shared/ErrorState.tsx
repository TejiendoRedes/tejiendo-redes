'use client';

import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorStateProps {
    title?: string
    description?: string
    retry?: () => void
}

export function ErrorState({
    title = "Algo salió mal",
    description = "Ha ocurrido un error al cargar los datos. Por favor, intenta de nuevo.",
    retry
}: ErrorStateProps) {
    return (
        <Alert variant="destructive" className="max-w-xl mx-auto my-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-4 items-start">
                <p>{description}</p>
                {retry && (
                    <Button variant="outline" size="sm" onClick={retry} className="bg-background hover:bg-accent text-foreground border-input">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Reintentar
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    )
}
