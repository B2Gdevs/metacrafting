"use client";

import { RefObject } from "react";
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from "react-dnd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { gameItems } from "@/lib/items";

interface GridCellProps {
  index: number;
  item: string | null;
  onDrop: (index: number) => void;
  isHighlighted: boolean;
  patternHighlight: string | undefined;
}

export default function GridCell({
  index,
  item,
  onDrop,
  isHighlighted,
  patternHighlight
}: GridCellProps) {
  // Set up drop target
  const [{ isOver }, drop] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      onDrop(index);
      return { type: "grid", index };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  return (
    <div
      ref={drop as unknown as RefObject<HTMLDivElement>}
      className={`
        w-20 h-20 border-2 rounded-md flex items-center justify-center
        ${isOver ? "border-primary bg-primary/20" : "border-border"}
        ${isHighlighted ? "border-yellow-500" : ""}
        transition-all duration-200
      `}
      style={{
        backgroundColor: patternHighlight || (isOver ? "rgba(var(--primary), 0.1)" : "transparent")
      }}
    >
      {item ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                  {gameItems[item]?.image ? (
                    <img
                      src={gameItems[item].image}
                      alt={gameItems[item].name}
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <span className="text-xs">{gameItems[item]?.name || item}</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{gameItems[item]?.name || item}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="text-muted-foreground text-xs">Empty</div>
      )}
    </div>
  );
} 