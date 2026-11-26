"use client";

import { useState } from "react";
import { Code2 } from "lucide-react";
import { cn, titleCase } from "@/lib/utils";
import { techIcon, techIconIsMono } from "@/lib/techIcons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function Icon({ tech, size }: { tech: string; size: number }) {
  const url = techIcon(tech);
  const [failed, setFailed] = useState(!url);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="grid place-items-center rounded-full border bg-card ring-2 ring-card transition-transform outline-none hover:z-10 hover:-translate-y-0.5 focus-visible:ring-ring"
          style={{ width: size, height: size }}
        >
          {failed ? (
            <Code2 className="size-[55%] text-muted-foreground" aria-hidden="true" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url!}
              alt=""
              width={size * 0.58}
              height={size * 0.58}
              className={cn("object-contain", techIconIsMono(tech) && "dark:invert")}
              style={{ width: size * 0.58, height: size * 0.58 }}
              loading="lazy"
              onError={() => setFailed(true)}
            />
          )}
          <span className="sr-only">{titleCase(tech)}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{titleCase(tech)}</TooltipContent>
    </Tooltip>
  );
}

export default function TechIcons({ techStack, max = 4, size = 30, className }: { techStack: string[]; max?: number; size?: number; className?: string }) {
  if (!techStack?.length) return null;
  const extra = techStack.length - max;
  return (
    <div className={cn("flex items-center -space-x-1.5", className)}>
      {techStack.slice(0, max).map((t) => (
        <Icon key={t} tech={t} size={size} />
      ))}
      {extra > 0 && (
        <span className="grid place-items-center rounded-full border bg-muted text-[10px] font-semibold text-muted-foreground ring-2 ring-card" style={{ width: size, height: size }}>
          +{extra}
        </span>
      )}
    </div>
  );
}
