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
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex items-center justify-center">
        <Image
          src="/minilogo.png"
          alt="Logo Tejiendo Redes"
          width={40}
          height={40}
          className="object-contain"
        />
      </div>
      <span className="text-[17px] font-extrabold leading-tight tracking-tight text-[#1e3a8a]">
        Tejiendo Redes
      </span>
    </div>
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
