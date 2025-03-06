"use client";

import type { Item } from "@/components/item-slot";
import type { Recipe } from "@/components/recipe-book";
import RecipeListItem from "./recipe-list-item";
import { filterRecipes } from "@/lib/recipe-utils";

interface RecipeListProps {
  recipes: Recipe[];
  gameItems: Record<string, Item>;
  characterStats: {
    craftingStats: {
      metalworking: number;
      magicworking: number;
      spellcraft: number;
    };
  };
  inventory: Array<{ id: string; quantity: number }>;
  searchTerm: string;
  activeCategory: string;
  discoveredSecretRecipes: string[];
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe) => void;
  onQuickCraft: (recipeId: string) => void;
}

export default function RecipeList({
  recipes,
  gameItems,
  characterStats,
  inventory,
  searchTerm,
  activeCategory,
  discoveredSecretRecipes,
  selectedRecipe,
  onSelectRecipe,
  onQuickCraft,
}: RecipeListProps) {
  const filteredRecipes = filterRecipes(
    recipes,
    gameItems,
    searchTerm,
    activeCategory as any,
    discoveredSecretRecipes
  );

  if (filteredRecipes.length === 0) {
    return <div className="text-center py-8 text-gray-500">No recipes found</div>;
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
      {filteredRecipes.map((recipe) => (
        <RecipeListItem
          key={recipe.id}
          recipe={recipe}
          gameItems={gameItems}
          characterStats={characterStats}
          inventory={inventory}
          isSelected={selectedRecipe?.id === recipe.id}
          onSelect={onSelectRecipe}
          onQuickCraft={onQuickCraft}
        />
      ))}
    </div>
  );
} 