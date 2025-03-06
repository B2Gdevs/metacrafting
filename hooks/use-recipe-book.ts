"use client";

import { useState, useEffect } from "react";
import type { Recipe, RecipeCategory } from "@/components/recipe-book";
import { RECIPE_CATEGORIES } from "@/lib/recipe-utils";

export function useRecipeBook(recipes: Recipe[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeCategory, setActiveCategory] = useState<RecipeCategory>(RECIPE_CATEGORIES.ALL);
  const [discoveredSecretRecipes, setDiscoveredSecretRecipes] = useState<string[]>([]);

  // Load discovered secret recipes from localStorage
  useEffect(() => {
    const storedRecipes = localStorage.getItem('discoveredRecipes');
    if (storedRecipes) {
      setDiscoveredSecretRecipes(JSON.parse(storedRecipes));
    }
  }, []);

  // Save discovered recipes to localStorage when they change
  useEffect(() => {
    if (discoveredSecretRecipes.length > 0) {
      localStorage.setItem('discoveredRecipes', JSON.stringify(discoveredSecretRecipes));
    }
  }, [discoveredSecretRecipes]);

  // Add a newly discovered recipe
  const addDiscoveredRecipe = (recipeId: string) => {
    if (!discoveredSecretRecipes.includes(recipeId)) {
      setDiscoveredSecretRecipes([...discoveredSecretRecipes, recipeId]);
    }
  };

  // Handle search term changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Handle category changes
  const handleCategoryChange = (category: RecipeCategory) => {
    setActiveCategory(category);
  };

  // Handle recipe selection
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  return {
    searchTerm,
    selectedRecipe,
    activeCategory,
    discoveredSecretRecipes,
    handleSearchChange,
    handleCategoryChange,
    handleSelectRecipe,
    addDiscoveredRecipe,
  };
} 