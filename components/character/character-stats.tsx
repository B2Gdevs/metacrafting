"use client"

import { CharacterStats } from "@/components/character-sheet";
import { Shield, Zap, Heart, Sparkles } from "lucide-react";

interface CharacterStatsProps {
  character: CharacterStats;
}

export default function CharacterStatsComponent({ character }: CharacterStatsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-sm">Strength:</span>
            <span className="text-sm font-bold">{character.strength}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm">Speed:</span>
            <span className="text-sm font-bold">{character.speed}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm">Health:</span>
            <span className="text-sm font-bold">{character.health}/{character.maxHealth}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm">Magic:</span>
            <span className="text-sm font-bold">{character.magicPoints}/{character.maxMagicPoints}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 