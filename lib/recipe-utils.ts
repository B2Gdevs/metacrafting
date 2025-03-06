"use client";

import { Hammer, Shield, Sparkles, Sword, Droplet } from "lucide-react";
import type { Item } from "@/components/item-slot";
import type { RecipeCategory, Recipe } from "@/components/recipe-book";

// Recipe category constants
export const RECIPE_CATEGORIES = {
  ALL: "all" as RecipeCategory,
  ITEMS: "items" as RecipeCategory,
  WEAPONS: "weapons" as RecipeCategory,
  ARMOR: "armor" as RecipeCategory,
  SPELLCRAFT: "spellcraft" as RecipeCategory,
  POTIONS: "potions" as RecipeCategory,
};

// Recipe category display names
export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  all: "All",
  items: "Items",
  weapons: "Weapons",
  armor: "Armor",
  spellcraft: "Spells",
  potions: "Potions",
};

// Crafting skill types
export const CRAFTING_SKILLS = {
  METALWORKING: "metalworking",
  MAGICWORKING: "magicworking",
  SPELLCRAFT: "spellcraft",
  WOODWORKING: "woodworking",
};

/**
 * Get the icon component for a recipe category
 */
export const getCategoryIcon = (category: RecipeCategory) => {
  switch (category) {
    case RECIPE_CATEGORIES.WEAPONS:
      return Sword;
    case RECIPE_CATEGORIES.ARMOR:
      return Shield;
    case RECIPE_CATEGORIES.SPELLCRAFT:
      return Sparkles;
    case RECIPE_CATEGORIES.POTIONS:
      return Droplet;
    case RECIPE_CATEGORIES.ITEMS:
      return Hammer;
    default:
      return null;
  }
};

/**
 * Calculate the success chance for a recipe based on character stats
 */
export const calculateSuccessChance = (
  recipe: Recipe,
  characterStats: {
    craftingStats: {
      metalworking: number;
      magicworking: number;
      spellcraft: number;
    };
  }
) => {
  if (!recipe.requiredStats) return 100;

  let totalRequiredSkill = 0;
  let totalCharacterSkill = 0;

  if (recipe.requiredStats.metalworking) {
    totalRequiredSkill += recipe.requiredStats.metalworking;
    totalCharacterSkill += Math.min(
      characterStats.craftingStats.metalworking,
      recipe.requiredStats.metalworking
    );
  }

  if (recipe.requiredStats.magicworking) {
    totalRequiredSkill += recipe.requiredStats.magicworking;
    totalCharacterSkill += Math.min(
      characterStats.craftingStats.magicworking,
      recipe.requiredStats.magicworking
    );
  }

  if (recipe.requiredStats.spellcraft) {
    totalRequiredSkill += recipe.requiredStats.spellcraft;
    totalCharacterSkill += Math.min(
      characterStats.craftingStats.spellcraft,
      recipe.requiredStats.spellcraft
    );
  }

  if (totalRequiredSkill === 0) return 100;

  // Base chance is 50% if skills match exactly
  const baseChance = 50;
  // Add 5% per skill level above required, cap at 95%
  const skillBonus = Math.min(
    45,
    Math.max(0, totalCharacterSkill - totalRequiredSkill) * 5
  );
  // Penalty for being under-skilled is more severe
  const skillPenalty = Math.max(0, totalRequiredSkill - totalCharacterSkill) * 10;

  return Math.min(95, Math.max(5, baseChance + skillBonus - skillPenalty));
};

/**
 * Check if player has enough resources for a recipe
 */
export const hasResourcesForRecipe = (
  recipe: Recipe,
  inventory: Array<{ id: string; quantity: number }>
) => {
  const requiredItems: Record<string, number> = {};
  
  // Count required items
  recipe.inputs.forEach(itemId => {
    requiredItems[itemId] = (requiredItems[itemId] || 0) + 1;
  });
  
  // Check if inventory has all required items in sufficient quantities
  return Object.entries(requiredItems).every(([itemId, requiredCount]) => {
    const inventoryItem = inventory.find(item => item.id === itemId);
    return inventoryItem && inventoryItem.quantity >= requiredCount;
  });
};

/**
 * Filter recipes based on search term and category
 */
export const filterRecipes = (
  recipes: Recipe[],
  gameItems: Record<string, Item>,
  searchTerm: string,
  activeCategory: RecipeCategory,
  discoveredSecretRecipes: string[]
) => {
  return recipes.filter(
    (recipe) =>
      // Only show non-secret recipes or secret recipes that have been discovered
      (!recipe.isSecret || (recipe.isSecret && discoveredSecretRecipes.includes(recipe.id))) &&
      (activeCategory === RECIPE_CATEGORIES.ALL || recipe.category === activeCategory) &&
      (gameItems[recipe.output].name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
};

/**
 * Count occurrences of each ingredient in a recipe
 */
export const countRecipeIngredients = (recipe: Recipe) => {
  const ingredientCounts: Record<string, number> = {};
  
  recipe.inputs.forEach(itemId => {
    ingredientCounts[itemId] = (ingredientCounts[itemId] || 0) + 1;
  });
  
  return ingredientCounts;
}; 