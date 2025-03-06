"use client";

import { Badge } from "@/components/ui/badge";
import { PatternBonus } from "@/lib/combat-utils";
import { getPatternColor } from "@/lib/crafting-grid-utils";

interface PatternInfoProps {
  activePatterns: PatternBonus[];
}

export default function PatternInfo({ activePatterns }: PatternInfoProps) {
  if (activePatterns.length === 0) {
    return null;
  }

  return (
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
  );
} 