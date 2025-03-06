"use client";

import { motion } from "framer-motion";
import type { Item } from "@/components/item-slot";
import type { Recipe } from "@/components/recipe-book";
import { generateRecipeGrid } from "@/lib/recipe-book-utils";

interface RecipeGridProps {
  recipe: Recipe;
  gameItems: Record<string, Item>;
  size?: "small" | "medium" | "large";
  showArrow?: boolean;
}

export default function RecipeGrid({ 
  recipe, 
  gameItems, 
  size = "medium",
  showArrow = true 
}: RecipeGridProps) {
  const grid = generateRecipeGrid(recipe);
  
  // Determine size classes
  const gridSizeClasses = {
    small: "max-w-[150px] gap-1",
    medium: "max-w-[200px] gap-2",
    large: "max-w-[250px] gap-3"
  };
  
  const cellSizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-10 h-10"
  };
  
  const outputSizeClasses = {
    small: "w-12 h-12",
    medium: "w-16 h-16",
    large: "w-20 h-20"
  };
  
  const outputImageSizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`grid grid-cols-3 ${gridSizeClasses[size]}`}>
        {grid.map((cell) => (
          <div
            key={`recipe-cell-${cell.index}`}
            className={`aspect-square bg-gray-800 rounded border border-gray-700 flex items-center justify-center`}
          >
            {cell.itemId && (
              <img
                src={gameItems[cell.itemId].image || "/placeholder.svg"}
                alt={gameItems[cell.itemId].name}
                className={`object-contain ${cellSizeClasses[size]}`}
              />
            )}
          </div>
        ))}
      </div>

      {showArrow && (
        <div className="flex items-center gap-2">
          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-amber-500 border-b-[10px] border-b-transparent" />
          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-amber-500 border-b-[10px] border-b-transparent" />
        </div>
      )}

      <div className={`bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center ${outputSizeClasses[size]}`}>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            repeatDelay: 2,
          }}
        >
          <img
            src={gameItems[recipe.output].image || "/placeholder.svg"}
            alt={gameItems[recipe.output].name}
            className={`object-contain ${outputImageSizeClasses[size]}`}
          />
        </motion.div>
      </div>
    </div>
  );
} 