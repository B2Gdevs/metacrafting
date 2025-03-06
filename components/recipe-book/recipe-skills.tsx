"use client";

import { Hammer, Sparkles, Info } from "lucide-react";
import type { Recipe } from "@/components/recipe-book";
import { CRAFTING_SKILLS } from "@/lib/recipe-utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

// Skill descriptions for tooltips
const skillDescriptions = {
  metalworking: "Metalworking allows crafting of weapons and armor. Higher levels unlock more powerful recipes and improve crafting success rates for metal items.",
  magicworking: "Magicworking enables enchanting items with magical properties. Higher levels allow for stronger enchantments and better control of magical energies.",
  spellcraft: "Spellcraft is used for creating magical scrolls, potions, and artifacts. Higher levels unlock more powerful magical effects and improve success rates."
};

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
      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          {recipe.requiredStats.metalworking && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1 cursor-help">
                  <Hammer className="w-3 h-3" />
                  <span className="text-xs">
                    Lvl {recipe.requiredStats.metalworking}
                    <span className={characterStats.craftingStats.metalworking >= recipe.requiredStats.metalworking 
                      ? "text-green-400" 
                      : "text-red-400"
                    }> ({characterStats.craftingStats.metalworking})</span>
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs max-w-xs">{skillDescriptions.metalworking}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {recipe.requiredStats.magicworking && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1 cursor-help">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span className="text-xs">
                    Lvl {recipe.requiredStats.magicworking}
                    <span className={characterStats.craftingStats.magicworking >= recipe.requiredStats.magicworking 
                      ? "text-green-400" 
                      : "text-red-400"
                    }> ({characterStats.craftingStats.magicworking})</span>
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs max-w-xs">{skillDescriptions.magicworking}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {recipe.requiredStats.spellcraft && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1 cursor-help">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span className="text-xs">
                    Lvl {recipe.requiredStats.spellcraft}
                    <span className={characterStats.craftingStats.spellcraft >= recipe.requiredStats.spellcraft 
                      ? "text-green-400" 
                      : "text-red-400"
                    }> ({characterStats.craftingStats.spellcraft})</span>
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs max-w-xs">{skillDescriptions.spellcraft}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }
  
  // Full detailed version
  return (
    <TooltipProvider>
      <div>
        <h3 className="font-medium text-gray-300 mb-2">Required Skills:</h3>
        <div className="grid grid-cols-3 gap-2">
          {recipe.requiredStats.metalworking && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-gray-800 p-2 rounded border border-gray-700 cursor-help">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Hammer className="w-3 h-3" />
                      <span>Metalworking</span>
                    </div>
                    <Info className="w-3 h-3 text-gray-500" />
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
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs max-w-xs">{skillDescriptions.metalworking}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {recipe.requiredStats.magicworking && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-gray-800 p-2 rounded border border-gray-700 cursor-help">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      <span>Magicworking</span>
                    </div>
                    <Info className="w-3 h-3 text-gray-500" />
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
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs max-w-xs">{skillDescriptions.magicworking}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {recipe.requiredStats.spellcraft && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-gray-800 p-2 rounded border border-gray-700 cursor-help">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Spellcraft</span>
                    </div>
                    <Info className="w-3 h-3 text-gray-500" />
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
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs max-w-xs">{skillDescriptions.spellcraft}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
} 