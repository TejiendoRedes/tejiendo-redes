import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Input } from "./input";

export interface NumberInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
    suffix?: string;
    allowDecomal?: boolean;
    value: string | number;
    onChange: (value: string) => void;
}

export function NumberInput({
    className,
    suffix,
    allowDecomal = true,
    value,
    onChange,
    ...props
}: NumberInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Remove anything that isn't a digit or a comma/dot
        newValue = newValue.replace(/[^\d.,]/g, "");

        // Normalize comma to dot
        newValue = newValue.replace(",", ".");

        // Handle multiple dots
        const parts = newValue.split(".");
        if (parts.length > 2) {
            newValue = parts[0] + "." + parts.slice(1).join("");
        }

        // If integer only, remove dots
        if (!allowDecomal) {
            newValue = newValue.replace(".", "");
        }

        onChange(newValue);
    };

    return (
        <div className="relative flex items-center w-full">
            <Input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={handleChange}
                className={cn(suffix ? "pr-12" : "", className)}
                {...props}
            />
            {suffix && (
                <span className="absolute right-3 text-sm text-muted-foreground font-medium pointer-events-none border-l pl-2 h-4 flex items-center">
                    {suffix}
                </span>
            )}
        </div>
    );
}
