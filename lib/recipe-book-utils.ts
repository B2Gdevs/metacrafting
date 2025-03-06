"use client";

import type { Item } from "@/components/item-slot";
import type { Recipe, RecipeCategory } from "@/components/recipe-book";
import { RECIPE_CATEGORIES } from "@/lib/recipe-utils";

/**
 * Interface for recipe grid display
 */
export interface RecipeGridItem {
  itemId: string | null;
  index: number;
}

/**
 * Generate a grid representation of a recipe's inputs
 */
export const generateRecipeGrid = (recipe: Recipe): RecipeGridItem[] => {
  const grid: RecipeGridItem[] = Array(9)
    .fill(null)
    .map((_, index) => ({
      itemId: recipe.inputs[index] || null,
      index
    }));
  
  return grid;
};

/**
 * Format recipe difficulty as a text label
 */
export const getRecipeDifficultyLabel = (difficulty: number): string => {
  if (difficulty <= 1) return "Beginner";
  if (difficulty <= 3) return "Apprentice";
  if (difficulty <= 5) return "Journeyman";
  if (difficulty <= 7) return "Expert";
  return "Master";
};

/**
 * Get the color for a recipe difficulty level
 */
export const getRecipeDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 1) return "text-green-400";
  if (difficulty <= 3) return "text-blue-400";
  if (difficulty <= 5) return "text-yellow-400";
  if (difficulty <= 7) return "text-orange-400";
  return "text-red-400";
};

/**
 * Check if a recipe has all required crafting controls
 */
export const hasRequiredCraftingControls = (recipe: Recipe): boolean => {
  return !!(
    recipe.craftingControls?.essence ||
    recipe.craftingControls?.precision ||
    recipe.craftingControls?.stability ||
    recipe.craftingControls?.resonance
  );
};

/**
 * Get the default crafting controls for a recipe
 */
export const getDefaultCraftingControls = (recipe: Recipe) => {
  return {
    essence: recipe.craftingControls?.essence || 0,
    precision: recipe.craftingControls?.precision || 0,
    stability: recipe.craftingControls?.stability || 0,
    resonance: recipe.craftingControls?.resonance || 0,
    curse: 0
  };
};

/**
 * Check if a recipe is craftable based on character stats
 */
export const isRecipeCraftable = (
  recipe: Recipe,
  characterStats: {
    craftingStats: {
      metalworking: number;
      magicworking: number;
      spellcraft: number;
    };
  }
): boolean => {
  if (!recipe.requiredStats) return true;
  
  if (
    (recipe.requiredStats.metalworking && 
     characterStats.craftingStats.metalworking < recipe.requiredStats.metalworking) ||
    (recipe.requiredStats.magicworking && 
     characterStats.craftingStats.magicworking < recipe.requiredStats.magicworking) ||
    (recipe.requiredStats.spellcraft && 
     characterStats.craftingStats.spellcraft < recipe.requiredStats.spellcraft)
  ) {
    return false;
  }
  
  return true;
};

/**
 * Get a list of missing skills for a recipe
 */
export const getMissingSkills = (
  recipe: Recipe,
  characterStats: {
    craftingStats: {
      metalworking: number;
      magicworking: number;
      spellcraft: number;
    };
  }
): string[] => {
  const missingSkills: string[] = [];
  
  if (recipe.requiredStats?.metalworking && 
      characterStats.craftingStats.metalworking < recipe.requiredStats.metalworking) {
    missingSkills.push(`Metalworking (${characterStats.craftingStats.metalworking}/${recipe.requiredStats.metalworking})`);
  }
  
  if (recipe.requiredStats?.magicworking && 
      characterStats.craftingStats.magicworking < recipe.requiredStats.magicworking) {
    missingSkills.push(`Magicworking (${characterStats.craftingStats.magicworking}/${recipe.requiredStats.magicworking})`);
  }
  
  if (recipe.requiredStats?.spellcraft && 
      characterStats.craftingStats.spellcraft < recipe.requiredStats.spellcraft) {
    missingSkills.push(`Spellcraft (${characterStats.craftingStats.spellcraft}/${recipe.requiredStats.spellcraft})`);
  }
  
  return missingSkills;
}; 