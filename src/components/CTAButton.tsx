import { BOOKING_URL } from "@/lib/site";

type Variant = "primary" | "ghost" | "light";

export default function CTAButton({
  children = "Book a Quick Chat",
  variant = "primary",
  href = BOOKING_URL,
  size = "md",
  fullWidth = false,
}: {
  children?: React.ReactNode;
  variant?: Variant;
  href?: string;
  size?: "md" | "lg";
  fullWidth?: boolean;
}) {
  // fullWidth fills the container and lets a long label wrap (used inside
  // narrow cards). Default stays nowrap for inline buttons in wide layouts.
  const base = `inline-flex items-center justify-center rounded-full font-medium transition ${
    fullWidth ? "w-full text-center whitespace-normal" : "whitespace-nowrap"
  }`;
  const sizeClasses =
    size === "lg" ? "px-7 py-3.5 text-base" : "px-6 py-3 text-sm";
  const variants: Record<Variant, string> = {
    primary: "bg-[#188bf6] text-white hover:bg-[#0d78dc]",
    ghost:
      "border border-black/20 text-[#111111] hover:border-black/50 bg-transparent",
    light: "bg-white text-[#111111] hover:bg-white/90",
  };
  return (
    <a href={href} className={`${base} ${sizeClasses} ${variants[variant]}`}>
      {children}
    </a>
  );
}
