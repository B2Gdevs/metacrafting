"use client";

import { useEffect, useState } from "react";
import { PatternBonus, getGridPatternBonuses } from "@/lib/combat-utils";
import { generatePatternHighlights } from "@/lib/crafting-grid-utils";
import GridCell from "./crafting/grid-cell";
import PatternInfo from "./crafting/pattern-info";

interface CraftingGridProps {
  grid: (string | null)[];
  onDrop: (index: number) => void;
  onDragStart?: (item: string, source: "grid", index: number) => void;
  itemType: string;
  isDraggingOver: boolean;
  highlightedCells?: number[];
}

export default function CraftingGrid({ 
  grid, 
  onDrop, 
  onDragStart,
  itemType, 
  isDraggingOver,
  highlightedCells = []
}: CraftingGridProps) {
  const [activePatterns, setActivePatterns] = useState<PatternBonus[]>([]);
  const [patternHighlights, setPatternHighlights] = useState<Record<number, string>>({});

  // Detect active patterns when grid changes
  useEffect(() => {
    if (grid.some(item => item !== null)) {
      const patterns = getGridPatternBonuses(grid, itemType);
      setActivePatterns(patterns);
      
      // Generate highlights for active patterns
      const highlights = generatePatternHighlights(grid, patterns);
      setPatternHighlights(highlights);
    } else {
      setActivePatterns([]);
      setPatternHighlights({});
    }
  }, [grid, itemType]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, index) => (
          <GridCell
            key={index}
            index={index}
            item={grid[index]}
            onDrop={onDrop}
            onDragStart={onDragStart}
            isHighlighted={highlightedCells.includes(index)}
            patternHighlight={patternHighlights[index]}
          />
        ))}
      </div>
      
      <PatternInfo activePatterns={activePatterns} />
    </div>
  );
} 