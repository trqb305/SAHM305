import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface LogoProps {
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
}

const sizes = {
  sm: { mark: 32, full: 130 },
  md: { mark: 40, full: 160 },
  lg: { mark: 56, full: 220 },
};

export function Logo({ variant = "mark", size = "md", href = "/", className }: LogoProps) {
  const dim = sizes[size];

  const content =
    variant === "full" ? (
      <div className={cn("flex items-center gap-3", className)}>
        <Image
          src="/images/logo-mark.png"
          alt="سهم 305"
          width={dim.mark}
          height={dim.mark}
          className="select-none"
          priority
        />
        <span className="text-[20px] font-medium tracking-tight">
          <span className="text-text-primary">سهم</span>{" "}
          <span className="text-gold-bright">305</span>
        </span>
      </div>
    ) : (
      <Image
        src="/images/logo-mark.png"
        alt="سهم 305"
        width={dim.mark}
        height={dim.mark}
        className={cn("select-none", className)}
        priority
      />
    );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
      {content}
    </Link>
  );
}
