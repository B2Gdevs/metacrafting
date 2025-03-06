"use client"

import type { Item } from "./item-slot"
import { useRecipeBook } from "@/hooks/use-recipe-book"
import RecipeFilter from "./recipe-book/recipe-filter"
import RecipeList from "./recipe-book/recipe-list"
import RecipeDetails from "./recipe-book/recipe-details"
import { RECIPE_CATEGORIES } from "@/lib/recipe-utils"

export type RecipeCategory = "all" | "items" | "weapons" | "armor" | "spellcraft" | "potions"

export type Recipe = {
  id: string
  inputs: string[]
  output: string
  description: string
  category: RecipeCategory
  difficulty: number
  requiredStats: {
    metalworking?: number
    magicworking?: number
    spellcraft?: number
    woodworking?: number
  }
  craftingControls?: {
    essence?: number
    precision?: number
    stability?: number
    resonance?: number
  }
  experienceGain?: {
    metalworking?: number
    magicworking?: number
    spellcraft?: number
  }
  patternType?: string
  isSecret?: boolean
  magicCost?: number
}

interface RecipeBookProps {
  recipes: Recipe[]
  gameItems: Record<string, Item>
  characterStats?: {
    craftingStats: {
      metalworking: number
      magicworking: number
      spellcraft: number
    }
  }
  inventory: Array<{ id: string; quantity: number }>
  onQuickCraft: (recipeId: string) => void
  onQuickAdd?: (recipe: Recipe) => void
  onSelectRecipe?: (recipe: Recipe | null) => void
}

export default function RecipeBook({ 
  recipes, 
  gameItems, 
  characterStats, 
  inventory, 
  onQuickCraft,
  onQuickAdd,
  onSelectRecipe 
}: RecipeBookProps) {
  const {
    searchTerm,
    activeCategory,
    discoveredSecretRecipes,
    selectedRecipe,
    handleSearchChange,
    handleCategoryChange,
    handleSelectRecipe
  } = useRecipeBook(recipes);
  
  // Pass the onSelectRecipe prop to the hook's handler if provided
  const handleRecipeSelect = (recipe: Recipe | null) => {
    handleSelectRecipe(recipe);
    if (onSelectRecipe) {
      onSelectRecipe(recipe);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <RecipeFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <RecipeList
          recipes={recipes}
          gameItems={gameItems}
          characterStats={characterStats || { craftingStats: { metalworking: 0, magicworking: 0, spellcraft: 0 } }}
          inventory={inventory}
          searchTerm={searchTerm}
          activeCategory={activeCategory}
          discoveredSecretRecipes={discoveredSecretRecipes}
          selectedRecipe={selectedRecipe}
          onSelectRecipe={handleRecipeSelect}
          onQuickCraft={onQuickCraft}
          onQuickAdd={onQuickAdd}
        />
      </div>
      
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <RecipeDetails
          recipe={selectedRecipe}
          gameItems={gameItems}
          characterStats={characterStats || { craftingStats: { metalworking: 0, magicworking: 0, spellcraft: 0 } }}
        />
      </div>
    </div>
  )
}

