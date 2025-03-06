"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, Grid } from "lucide-react";
import type { Item } from "@/components/item-slot";
import type { Recipe } from "@/components/recipe-book";
import { getCategoryIcon, calculateSuccessChance, hasResourcesForRecipe } from "@/lib/recipe-utils";
import RecipeSkills from "./recipe-skills";
import RecipeExperience from "./recipe-experience";
import { getRecipeDifficultyLabel, getRecipeDifficultyColor } from "@/lib/recipe-book-utils";

interface RecipeListItemProps {
  recipe: Recipe;
  gameItems: Record<string, Item>;
  characterStats: {
    craftingStats: {
      metalworking: number;
      magicworking: number;
      spellcraft: number;
    };
  };
  inventory: Array<{ id: string; quantity: number }>;
  isSelected: boolean;
  onSelect: (recipe: Recipe) => void;
  onQuickCraft: (recipeId: string) => void;
  onQuickAdd?: (recipe: Recipe) => void;
}

export default function RecipeListItem({
  recipe,
  gameItems,
  characterStats,
  inventory,
  isSelected,
  onSelect,
  onQuickCraft,
  onQuickAdd
}: RecipeListItemProps) {
  const successChance = calculateSuccessChance(recipe, characterStats);
  const canQuickCraft = hasResourcesForRecipe(recipe, inventory);
  const CategoryIcon = getCategoryIcon(recipe.category);
  const difficultyLabel = getRecipeDifficultyLabel(recipe.difficulty);
  const difficultyColor = getRecipeDifficultyColor(recipe.difficulty);
  
  return (
    <motion.div
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "bg-amber-900/30 border border-amber-700"
          : "bg-gray-800 border border-gray-700 hover:border-gray-600"
      }`}
      onClick={() => onSelect(recipe)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            {CategoryIcon && <CategoryIcon className="w-4 h-4" />}
            <h3 className="font-medium text-amber-400">{gameItems[recipe.output].name}</h3>
            <span className={`text-xs ${difficultyColor}`}>({difficultyLabel})</span>
          </div>
          <p className="text-sm text-gray-400 mt-1 line-clamp-1">{recipe.description}</p>
          
          <div className="mt-2 flex flex-wrap gap-2">
            <RecipeSkills recipe={recipe} characterStats={characterStats} compact />
            <RecipeExperience recipe={recipe} compact />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="bg-gray-700">
            {successChance}% Success
          </Badge>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2 text-xs"
                    disabled={!canQuickCraft}
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickCraft(recipe.id);
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Quick Craft
                  </Button>
                  
                  {onQuickAdd && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 px-2 text-xs ml-2"
                      disabled={!canQuickCraft}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAdd(recipe);
                      }}
                    >
                      <Grid className="w-3 h-3 mr-1" />
                      Quick Add
                    </Button>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]">
                <p className="text-xs">
                  Quick crafting uses basic settings and won't apply special effects from crafting controls.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </motion.div>
  );
} 