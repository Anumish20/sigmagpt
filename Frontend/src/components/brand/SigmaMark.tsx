import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface Props {
  size?: number;
  className?: string;
  animate?: boolean;
  rounded?: boolean;
}

/** The SigmaGPT mark — a geometric Σ rendered in the electric-violet gradient. */
export function SigmaMark({ size = 28, className, animate = false, rounded = true }: Props) {
  const id = "sigma-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-label="SigmaGPT"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9B82FF" />
          <stop offset="1" stopColor="#5B5BF0" />
        </linearGradient>
      </defs>
      {rounded && <rect width="32" height="32" rx="8" fill="#15151C" />}
      <motion.path
        d="M22 9H11l5 7-5 7h11"
        stroke={`url(#${id})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
