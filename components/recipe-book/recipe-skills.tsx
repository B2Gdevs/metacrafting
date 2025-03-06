"use client";

import { Hammer, Sparkles } from "lucide-react";
import type { Recipe } from "@/components/recipe-book";
import { CRAFTING_SKILLS } from "@/lib/recipe-utils";

interface RecipeSkillsProps {
  recipe: Recipe;
  characterStats: {
    craftingStats: {
      metalworking: number;
      magicworking: number;
      spellcraft: number;
    };
  };
  compact?: boolean;
}

export default function RecipeSkills({ 
  recipe, 
  characterStats,
  compact = false 
}: RecipeSkillsProps) {
  if (!recipe.requiredStats) {
    return null;
  }
  
  // If compact, show a simplified version
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {recipe.requiredStats.metalworking && (
          <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
            <Hammer className="w-3 h-3" />
            <span className="text-xs">
              Lvl {recipe.requiredStats.metalworking}
              <span className={characterStats.craftingStats.metalworking >= recipe.requiredStats.metalworking 
                ? "text-green-400" 
                : "text-red-400"
              }> ({characterStats.craftingStats.metalworking})</span>
            </span>
          </div>
        )}
        
        {recipe.requiredStats.magicworking && (
          <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-xs">
              Lvl {recipe.requiredStats.magicworking}
              <span className={characterStats.craftingStats.magicworking >= recipe.requiredStats.magicworking 
                ? "text-green-400" 
                : "text-red-400"
              }> ({characterStats.craftingStats.magicworking})</span>
            </span>
          </div>
        )}
        
        {recipe.requiredStats.spellcraft && (
          <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-xs">
              Lvl {recipe.requiredStats.spellcraft}
              <span className={characterStats.craftingStats.spellcraft >= recipe.requiredStats.spellcraft 
                ? "text-green-400" 
                : "text-red-400"
              }> ({characterStats.craftingStats.spellcraft})</span>
            </span>
          </div>
        )}
      </div>
    );
  }
  
  // Full detailed version
  return (
    <div>
      <h3 className="font-medium text-gray-300 mb-2">Required Skills:</h3>
      <div className="grid grid-cols-3 gap-2">
        {recipe.requiredStats.metalworking && (
          <div className="bg-gray-800 p-2 rounded border border-gray-700">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Hammer className="w-3 h-3" />
              <span>Metalworking</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm font-medium">Level {recipe.requiredStats.metalworking}</span>
              <span
                className={`text-xs ${characterStats.craftingStats.metalworking >= recipe.requiredStats.metalworking ? "text-green-400" : "text-red-400"}`}
              >
                ({characterStats.craftingStats.metalworking})
              </span>
            </div>
          </div>
        )}

        {recipe.requiredStats.magicworking && (
          <div className="bg-gray-800 p-2 rounded border border-gray-700">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Magicworking</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm font-medium">Level {recipe.requiredStats.magicworking}</span>
              <span
                className={`text-xs ${characterStats.craftingStats.magicworking >= recipe.requiredStats.magicworking ? "text-green-400" : "text-red-400"}`}
              >
                ({characterStats.craftingStats.magicworking})
              </span>
            </div>
          </div>
        )}

        {recipe.requiredStats.spellcraft && (
          <div className="bg-gray-800 p-2 rounded border border-gray-700">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Spellcraft</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm font-medium">Level {recipe.requiredStats.spellcraft}</span>
              <span
                className={`text-xs ${characterStats.craftingStats.spellcraft >= recipe.requiredStats.spellcraft ? "text-green-400" : "text-red-400"}`}
              >
                ({characterStats.craftingStats.spellcraft})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 