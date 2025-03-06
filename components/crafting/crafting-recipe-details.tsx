"use client"

import { Item, ItemRarity } from "@/components/item-slot"
import { Recipe } from "@/components/recipe-book"
import { Button } from "@/components/ui/button"
import { CraftingControlType } from "@/lib/recipes"
import Image from "next/image"

interface CraftingRecipeDetailsProps {
  recipe: Recipe | null
  gameItems: Record<string, Item>
  successChance: number
  controlValues: Record<CraftingControlType, number>
  magicCost: number
  magicPoints: number
  onCraft: () => void
  onClearGrid: () => void
  hasRequiredItems: boolean
  grid: (string | null)[]
  findMatchingRecipe?: () => Recipe | null
}

// Helper function to get CSS class based on item rarity
const getRarityClass = (rarity?: ItemRarity): string => {
  switch (rarity) {
    case "uncommon": return "text-green-400 border-green-600";
    case "rare": return "text-blue-400 border-blue-600";
    case "epic": return "text-purple-400 border-purple-600";
    case "legendary": return "text-amber-400 border-amber-600";
    case "mythic": return "text-rose-400 border-rose-600";
    default: return "text-gray-400 border-gray-600";
  }
};

export default function CraftingRecipeDetails({
  recipe,
  gameItems,
  successChance,
  controlValues,
  magicCost,
  magicPoints,
  onCraft,
  onClearGrid,
  hasRequiredItems,
  grid
}: CraftingRecipeDetailsProps) {
  // If no items in grid, don't show anything
  if (!grid.some(item => item !== null)) {
    return null;
  }
  
  // Get output item if recipe is selected
  const outputItem = recipe ? gameItems[recipe.output] : null;
  const canCraft = recipe ? (hasRequiredItems && magicPoints >= magicCost) : grid.some(item => item !== null);
  
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        {outputItem && (
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-md border ${getRarityClass(outputItem.rarity)} flex items-center justify-center`}>
              {outputItem.image && (
                <Image 
                  src={outputItem.image} 
                  alt={outputItem.name} 
                  width={36} 
                  height={36} 
                />
              )}
            </div>
            <div>
              <h4 className={`text-md font-medium ${getRarityClass(outputItem.rarity)}`}>{outputItem.name}</h4>
              <div className="flex items-center gap-2 text-xs">
                <span className={successChance >= 75 ? 'text-green-400' : successChance >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                  {successChance}% Success
                </span>
                {magicCost > 0 && (
                  <span className={magicPoints < magicCost ? 'text-red-400' : 'text-blue-400'}>
                    {magicCost} MP
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="default" 
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={onCraft}
            disabled={recipe ? !canCraft : false}
          >
            {outputItem ? `Craft ${outputItem.name}` : "Craft Item"}
          </Button>
          <Button 
            variant="outline" 
            className="border-amber-700 text-amber-400 hover:bg-amber-900/20"
            onClick={onClearGrid}
          >
            Clear Grid
          </Button>
        </div>
      </div>
      
      {!canCraft && recipe && (
        <div className="text-xs text-red-400 mt-2">
          {!hasRequiredItems && "Missing required ingredients. "}
          {magicPoints < magicCost && `Need ${magicCost} MP, but you only have ${magicPoints} MP.`}
        </div>
      )}
    </div>
  )
} 