import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary:
    "bg-cyan-400 text-ink-950 shadow-[0_14px_40px_rgba(57,202,239,0.28)] hover:bg-cyan-300",
  secondary:
    "border border-white/12 bg-white/6 text-white hover:border-cyan-300/40 hover:bg-white/10",
  ghost: "text-mist-100 hover:bg-white/6",
};

type Variant = keyof typeof variants;

export function buttonStyles(variant: Variant = "primary", className?: string) {
  return cn(baseStyles, variants[variant], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonStyles(variant, className)} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  children: ReactNode;
  href: string;
};

export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonStyles(variant, className)} {...props}>
      {children}
    </Link>
  );
}
