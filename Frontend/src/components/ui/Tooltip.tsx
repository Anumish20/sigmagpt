import * as RT from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RT.Provider delayDuration={350} skipDelayDuration={200}>
      {children}
    </RT.Provider>
  );
}

interface Props {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  kbd?: string;
}

export function Tooltip({ content, children, side = "top", kbd }: Props) {
  return (
    <RT.Root>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={8}
          className={cn(
            "z-50 flex items-center gap-2 rounded-md glass px-2.5 py-1.5 text-xs text-ink-hi shadow-e2",
            "data-[state=delayed-open]:animate-fade-up"
          )}
        >
          {content}
          {kbd && (
            <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-ink-lo">
              {kbd}
            </kbd>
          )}
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  );
}
