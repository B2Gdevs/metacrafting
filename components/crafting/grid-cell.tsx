"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { gameItems } from "@/lib/items";

interface GridCellProps {
  index: number;
  item: string | null;
  onDrop: (index: number) => void;
  onDragStart?: (item: string, source: "grid", index: number) => void;
  isHighlighted: boolean;
  patternHighlight: string | undefined;
}

export default function GridCell({
  index,
  item,
  onDrop,
  onDragStart,
  isHighlighted,
  patternHighlight
}: GridCellProps) {
  const [isOver, setIsOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    
    try {
      // Try to get the data from the dataTransfer
      const jsonData = e.dataTransfer.getData("application/json");
      if (jsonData) {
        const data = JSON.parse(jsonData);
        if (data.type === "INVENTORY_ITEM" || data.type === "GRID_ITEM") {
          onDrop(index);
        }
      } else {
        // Fallback to plain text
        const itemId = e.dataTransfer.getData("text/plain");
        if (itemId) {
          onDrop(index);
        }
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };
  
  const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!item || !onDragStart) return;
    
    try {
      // Set data for drag operation
      e.dataTransfer.setData("application/json", JSON.stringify({
        type: "GRID_ITEM",
        itemId: item,
        sourceIndex: index
      }));
      e.dataTransfer.setData("text/plain", item);
      
      // Call the onDragStart handler
      onDragStart(item, "grid", index);
    } catch (error) {
      console.error("Error starting drag:", error);
    }
  };
  
  return (
    <div
      className={`
        w-20 h-20 border-2 rounded-md flex items-center justify-center
        ${isOver ? "border-primary bg-primary/20" : "border-border"}
        ${isHighlighted ? "border-yellow-500" : ""}
        transition-all duration-200
      `}
      style={{
        backgroundColor: patternHighlight || (isOver ? "rgba(var(--primary), 0.1)" : "transparent")
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {item ? (
        <div 
          className="relative w-full h-full flex items-center justify-center"
          draggable={!!onDragStart}
          onDragStart={handleItemDragStart}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center cursor-move">
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
                <p className="text-xs text-gray-400">Drag to rearrange</p>
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