"use client";

import { Hammer, Sparkles } from "lucide-react";
import type { Recipe } from "@/components/recipe-book";

interface RecipeExperienceProps {
  recipe: Recipe;
  compact?: boolean;
}

export default function RecipeExperience({ 
  recipe, 
  compact = false 
}: RecipeExperienceProps) {
  if (!recipe.experienceGain || 
      (!recipe.experienceGain.metalworking && 
       !recipe.experienceGain.magicworking && 
       !recipe.experienceGain.spellcraft)) {
    return null;
  }
  
  // If compact, show a simplified version
  if (compact) {
    const totalXP = (recipe.experienceGain.metalworking || 0) + 
                    (recipe.experienceGain.magicworking || 0) + 
                    (recipe.experienceGain.spellcraft || 0);
    
    return (
      <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
        <Sparkles className="w-3 h-3 text-yellow-400" />
        <span className="text-xs">+{totalXP} XP</span>
      </div>
    );
  }
  
  // Full detailed version
  return (
    <div>
      <h3 className="font-medium text-gray-300 mb-2">Experience Gain:</h3>
      <div className="flex flex-wrap gap-2">
        {recipe.experienceGain.metalworking && (
          <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
            <Hammer className="w-3 h-3 text-gray-400" />
            <span className="text-xs">+{recipe.experienceGain.metalworking} XP</span>
          </div>
        )}
        
        {recipe.experienceGain.magicworking && (
          <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-xs">+{recipe.experienceGain.magicworking} XP</span>
          </div>
        )}
        
        {recipe.experienceGain.spellcraft && (
          <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-xs">+{recipe.experienceGain.spellcraft} XP</span>
          </div>
        )}
      </div>
    </div>
  );
} 