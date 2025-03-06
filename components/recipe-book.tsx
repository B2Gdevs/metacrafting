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
  temperature?: number // Legacy field, will be replaced by craftingControls
  craftingControls?: {
    essence?: number
    precision?: number
    stability?: number
    resonance?: number
  }
  magicCost?: number
  experienceGain: {
    metalworking?: number
    magicworking?: number
    spellcraft?: number
    woodworking?: number
  }
  isSecret?: boolean
}

interface RecipeBookProps {
  recipes: Recipe[]
  gameItems: Record<string, Item>
  characterStats: {
    craftingStats: {
      metalworking: number
      magicworking: number
      spellcraft: number
    }
  }
  inventory: Array<{ id: string; quantity: number }>
  onQuickCraft: (recipeId: string) => void
}

export default function RecipeBook({ recipes, gameItems, characterStats, inventory, onQuickCraft }: RecipeBookProps) {
  const {
    searchTerm,
    selectedRecipe,
    activeCategory,
    discoveredSecretRecipes,
    handleSearchChange,
    handleCategoryChange,
    handleSelectRecipe,
  } = useRecipeBook(recipes);

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
          characterStats={characterStats}
          inventory={inventory}
          searchTerm={searchTerm}
          activeCategory={activeCategory}
          discoveredSecretRecipes={discoveredSecretRecipes}
          selectedRecipe={selectedRecipe}
          onSelectRecipe={handleSelectRecipe}
          onQuickCraft={onQuickCraft}
        />
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <RecipeDetails
          recipe={selectedRecipe}
          gameItems={gameItems}
          characterStats={characterStats}
        />
      </div>
    </div>
  )
}

