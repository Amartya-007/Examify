"use client";

import { useState } from "react";
import { cn, techIconUrl, titleCase } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function Icon({ tech }: { tech: string }) {
  const url = techIconUrl(tech);
  const [failed, setFailed] = useState(!url);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="grid size-7 place-items-center rounded-full border bg-card ring-2 ring-card">
          {failed ? (
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tech.slice(0, 2)}</span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url!} alt="" width={16} height={16} className="size-4" loading="lazy" onError={() => setFailed(true)} />
          )}
          <span className="sr-only">{titleCase(tech)}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{titleCase(tech)}</TooltipContent>
    </Tooltip>
  );
}

export default function TechIcons({ techStack, max = 4, className }: { techStack: string[]; max?: number; className?: string }) {
  if (!techStack?.length) return null;
  const extra = techStack.length - max;
  return (
    <div className={cn("flex items-center -space-x-1.5", className)}>
      {techStack.slice(0, max).map((t) => (
        <Icon key={t} tech={t} />
      ))}
      {extra > 0 && (
        <span className="grid size-7 place-items-center rounded-full border bg-muted text-[10px] font-semibold text-muted-foreground ring-2 ring-card">
          +{extra}
        </span>
      )}
    </div>
  );
}
