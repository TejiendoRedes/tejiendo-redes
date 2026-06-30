import Image from "next/image";

export function BrandLogo({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="flex h-12 w-12 items-center justify-center">
        <Image
          src="/minilogo.png"
          alt="Logo"
          width={48}
          height={48}
          className="h-full w-full object-contain"
          priority
        />
      </div>
    );
  }
  
  return (
    <div className="flex h-[4.5rem] w-52 items-center justify-start py-1">
      <Image
        src="/logo.png"
        alt="Tejiendo Redes"
        width={208}
        height={72}
        className="h-full w-auto object-contain object-left"
        priority
      />
    </div>
  );
}
