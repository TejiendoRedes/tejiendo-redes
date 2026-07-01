import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  if (collapsed) {
    return (
      <Image
        src="/minilogo.png"
        alt="Tejiendo Redes"
        width={36}
        height={36}
        className={cn("h-9 w-9 object-contain", className)}
      />
    );
  }
  return (
    <Image
      src="/logo.png"
      alt="Fundación Tejiendo Redes"
      width={160}
      height={48}
      className={cn("h-12 w-auto object-contain", className)}
    />
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/minilogo.png"
      alt="Tejiendo Redes"
      width={36}
      height={36}
      className={cn("object-contain", className)}
    />
  );
}
