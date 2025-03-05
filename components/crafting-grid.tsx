"use client";

import React, { useState, useEffect, RefObject } from "react";
import { useDrop } from "react-dnd";
import type { DropTargetMonitor } from 'react-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { gameItems } from "@/lib/items";
import { PatternBonus, checkGridPattern, getGridPatternBonuses } from "@/lib/combat-utils";

interface CraftingGridProps {
  grid: (string | null)[];
  onDrop: (index: number) => void;
  itemType: string;
  isDraggingOver: boolean;
  highlightedCells?: number[];
}

export default function CraftingGrid({ 
  grid, 
  onDrop, 
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
      const highlights: Record<number, string> = {};
      
      patterns.forEach(pattern => {
        const patternType = pattern.type;
        const color = getPatternColor(patternType);
        
        // Highlight cells based on pattern type
        switch (patternType) {
          case "linear":
            // Check horizontal lines
            for (let row = 0; row < 3; row++) {
              const rowItems = [grid[row * 3], grid[row * 3 + 1], grid[row * 3 + 2]];
              if (rowItems.every(item => item !== null)) {
                highlights[row * 3] = color;
                highlights[row * 3 + 1] = color;
                highlights[row * 3 + 2] = color;
              }
            }
            
            // Check vertical lines
            for (let col = 0; col < 3; col++) {
              const colItems = [grid[col], grid[col + 3], grid[col + 6]];
              if (colItems.every(item => item !== null)) {
                highlights[col] = color;
                highlights[col + 3] = color;
                highlights[col + 6] = color;
              }
            }
            break;
            
          case "diagonal":
            // Check diagonals
            const diagonal1 = [grid[0], grid[4], grid[8]];
            const diagonal2 = [grid[2], grid[4], grid[6]];
            
            if (diagonal1.every(item => item !== null)) {
              highlights[0] = color;
              highlights[4] = color;
              highlights[8] = color;
            }
            
            if (diagonal2.every(item => item !== null)) {
              highlights[2] = color;
              highlights[4] = color;
              highlights[6] = color;
            }
            break;
            
          case "square":
            // Check 2x2 squares
            const squares = [
              [0, 1, 3, 4], // Top-left
              [1, 2, 4, 5], // Top-right
              [3, 4, 6, 7], // Bottom-left
              [4, 5, 7, 8]  // Bottom-right
            ];
            
            squares.forEach(square => {
              if (square.every(index => grid[index] !== null)) {
                square.forEach(index => {
                  highlights[index] = color;
                });
              }
            });
            break;
            
          case "cross":
            // Check cross pattern (center + adjacent)
            const cross = [1, 3, 4, 5, 7]; // Top, left, center, right, bottom
            if (cross.every(index => grid[index] !== null)) {
              cross.forEach(index => {
                highlights[index] = color;
              });
            }
            break;
            
          case "triangle":
            // Check triangle patterns
            const triangles = [
              [0, 1, 2, 4], // Top row + center
              [0, 3, 6, 4], // Left column + center
              [2, 5, 8, 4], // Right column + center
              [6, 7, 8, 4]  // Bottom row + center
            ];
            
            triangles.forEach(triangle => {
              if (triangle.every(index => grid[index] !== null)) {
                triangle.forEach(index => {
                  highlights[index] = color;
                });
              }
            });
            break;
            
          case "circle":
            // Check circle pattern (all outer cells)
            const circle = [0, 1, 2, 3, 5, 6, 7, 8]; // All except center
            if (circle.every(index => grid[index] !== null)) {
              circle.forEach(index => {
                highlights[index] = color;
              });
            }
            break;
        }
      });
      
      setPatternHighlights(highlights);
    } else {
      setActivePatterns([]);
      setPatternHighlights({});
    }
  }, [grid, itemType]);

  // Get color for pattern type
  const getPatternColor = (patternType: string): string => {
    switch (patternType) {
      case "linear": return "rgba(255, 0, 0, 0.2)";
      case "diagonal": return "rgba(0, 255, 0, 0.2)";
      case "square": return "rgba(0, 0, 255, 0.2)";
      case "cross": return "rgba(255, 255, 0, 0.2)";
      case "triangle": return "rgba(255, 0, 255, 0.2)";
      case "circle": return "rgba(0, 255, 255, 0.2)";
      default: return "rgba(255, 255, 255, 0.2)";
    }
  };

  // Render grid cell
  const renderCell = (index: number) => {
    const item = grid[index];
    const isHighlighted = highlightedCells.includes(index);
    const patternHighlight = patternHighlights[index];
    
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
        key={index}
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
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, index) => renderCell(index))}
      </div>
      
      {activePatterns.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Active Patterns:</h3>
          <div className="flex flex-wrap gap-2">
            {activePatterns.map((pattern, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getPatternColor(pattern.type) }}
                />
                <span>{pattern.type}</span>
                <span className="text-xs">+{pattern.rarityBoost * 10}% rarity</span>
              </Badge>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <p>Pattern bonuses: {activePatterns.map(p => p.description).join(", ")}</p>
          </div>
        </div>
      )}
    </div>
  );
} 