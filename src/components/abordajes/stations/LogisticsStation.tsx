import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export function LogisticsStation({ abordaje }: { abordaje: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Logística y Detalles
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-500">
                    Información logística del abordaje.
                    (En desarrollo)
                </p>
            </CardContent>
        </Card>
    );
}
