'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';

interface BloodPressureInputProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    id?: string;
    required?: boolean;
}

export function BloodPressureInput({
    value = '',
    onChange,
    label = 'Tensión Arterial',
    id = 'tensionArterial',
    required = false
}: BloodPressureInputProps) {
    // Parse initial value (expected format: "120/80 mmHg")
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');

    useEffect(() => {
        if (value) {
            const match = value.match(/^(\d+)\/(\d+)/);
            if (match) {
                setSystolic(match[1]);
                setDiastolic(match[2]);
            }
        }
    }, []);

    const handleSystolicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value.replace(/\D/g, '').slice(0, 3);
        setSystolic(newVal);
        updateValue(newVal, diastolic);
    };

    const handleDiastolicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value.replace(/\D/g, '').slice(0, 3);
        setDiastolic(newVal);
        updateValue(systolic, newVal);
    };

    const updateValue = (sys: string, dia: string) => {
        if (sys && dia) {
            onChange(`${sys}/${dia} mmHg`);
        } else {
            onChange('');
        }
    };

    return (
        <div className="space-y-4">
            <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                {label}
            </Label>
            <div className="flex items-center gap-3 pt-4">
                <div className="relative flex-1">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-blue-500/70 uppercase font-bold tracking-wider pointer-events-none">
                        Sistólica
                    </span>
                    <Input
                        id={`${id}-systolic`}
                        type="text"
                        placeholder="000"
                        value={systolic}
                        onChange={handleSystolicChange}
                        className="text-center h-11 border-blue-100 focus-visible:ring-blue-400 font-medium text-lg"
                        required={required}
                        maxLength={3}
                    />
                </div>

                <span className="text-2xl font-light text-gray-300 transform -rotate-12">/</span>

                <div className="relative flex-1">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-blue-500/70 uppercase font-bold tracking-wider pointer-events-none">
                        Diastólica
                    </span>
                    <Input
                        id={`${id}-diastolic`}
                        type="text"
                        placeholder="00"
                        value={diastolic}
                        onChange={handleDiastolicChange}
                        className="text-center h-11 border-blue-100 focus-visible:ring-blue-400 font-medium text-lg"
                        required={required}
                        maxLength={3}
                    />
                </div>

                <div className="flex items-center self-stretch">
                    <span className="flex items-center justify-center h-11 px-3 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100 min-w-[65px] shadow-sm">
                        mmHg
                    </span>
                </div>
            </div>
        </div>
    );
}
