"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RecipeCategory } from "@/components/recipe-book";
import { RECIPE_CATEGORIES, RECIPE_CATEGORY_LABELS } from "@/lib/recipe-utils";

interface RecipeFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeCategory: RecipeCategory;
  onCategoryChange: (category: RecipeCategory) => void;
}

export default function RecipeFilter({
  searchTerm,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: RecipeFilterProps) {
  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search recipes..."
          className="pl-8 bg-gray-800 border-gray-700"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Tabs 
        defaultValue={activeCategory} 
        value={activeCategory}
        onValueChange={(value) => onCategoryChange(value as RecipeCategory)} 
        className="mb-4"
      >
        <TabsList className="w-full grid grid-cols-6 h-9 bg-gray-800">
          {Object.values(RECIPE_CATEGORIES).map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {RECIPE_CATEGORY_LABELS[category]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
} 