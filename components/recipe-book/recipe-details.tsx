"use client";

import { Sword, Sparkles } from "lucide-react";
import type { Item } from "@/components/item-slot";
import type { Recipe } from "@/components/recipe-book";
import RecipeGrid from "./recipe-grid";
import RecipeSkills from "./recipe-skills";
import RecipeExperience from "./recipe-experience";
import { countRecipeIngredients } from "@/lib/recipe-utils";
import { getRecipeDifficultyLabel, getRecipeDifficultyColor } from "@/lib/recipe-book-utils";

interface RecipeDetailsProps {
  recipe: Recipe | null;
  gameItems: Record<string, Item>;
  characterStats: {
    craftingStats: {
      metalworking: number;
      magicworking: number;
      spellcraft: number;
    };
  };
}

export default function RecipeDetails({ recipe, gameItems, characterStats }: RecipeDetailsProps) {
  if (!recipe) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>Select a recipe to view details</p>
      </div>
    );
  }

  const ingredientCounts = countRecipeIngredients(recipe);
  const difficultyLabel = getRecipeDifficultyLabel(recipe.difficulty);
  const difficultyColor = getRecipeDifficultyColor(recipe.difficulty);

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-amber-400">{gameItems[recipe.output].name}</h2>
        <p className="text-sm text-gray-400">{recipe.description}</p>
        <div className="mt-2">
          <span className={`text-xs font-medium ${difficultyColor}`}>
            {difficultyLabel} Difficulty
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <RecipeGrid recipe={recipe} gameItems={gameItems} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <h3 className="font-medium text-gray-300 mb-2">Required Ingredients:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ingredientCounts).map(([itemId, count]) => (
              <div key={itemId} className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
                <img
                  src={gameItems[itemId].image || "/placeholder.svg"}
                  alt={gameItems[itemId].name}
                  className="w-5 h-5 object-contain"
                />
                <span className="text-xs">
                  {gameItems[itemId].name} x{count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {recipe.temperature && (
            <div className="bg-gray-800 p-2 rounded border border-gray-700">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Sword className="w-3 h-3 text-red-400" />
                <span>Temperature</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm font-medium">{recipe.temperature}°</span>
              </div>
            </div>
          )}

          {recipe.magicCost && (
            <div className="bg-gray-800 p-2 rounded border border-gray-700">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Magic Cost</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm font-medium">{recipe.magicCost} MP</span>
              </div>
            </div>
          )}
        </div>

        <RecipeSkills recipe={recipe} characterStats={characterStats} />
        <RecipeExperience recipe={recipe} />
      </div>
    </div>
  );
} 