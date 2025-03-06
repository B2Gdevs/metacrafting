"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Recipe } from "@/components/recipe-book"
import { Item } from "@/components/item-slot"
import ItemSlot from "@/components/item-slot"
import { CraftingControlType } from "@/lib/recipes"
import { AlertTriangle, Check, X } from "lucide-react"

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
}

export default function CraftingRecipeDetails({
  recipe,
  gameItems,
  successChance,
  controlValues,
  magicCost,
  magicPoints,
  onCraft,
  onClearGrid,
  hasRequiredItems
}: CraftingRecipeDetailsProps) {
  if (!recipe) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
        <div className="text-gray-400">Select a recipe to view details</div>
      </div>
    )
  }

  const outputItem = gameItems[recipe.output]
  const canCraft = hasRequiredItems && magicPoints >= magicCost

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400">{outputItem.name}</h2>
          <p className="text-gray-400 mt-1">{recipe.description}</p>
        </div>
        <div className="flex flex-col items-end">
          <Badge variant="outline" className={`mb-2 ${successChance >= 75 ? 'bg-green-900/30 text-green-400' : successChance >= 50 ? 'bg-amber-900/30 text-amber-400' : 'bg-red-900/30 text-red-400'}`}>
            {successChance}% Success Chance
          </Badge>
          <Badge variant="outline" className={`${magicPoints >= magicCost ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-400'}`}>
            {magicCost} Magic Cost
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Required Skills</h3>
          <div className="space-y-1">
            {recipe.requiredStats.metalworking && (
              <div className="flex justify-between text-xs">
                <span>Metalworking</span>
                <span className="text-amber-400">Level {recipe.requiredStats.metalworking}</span>
              </div>
            )}
            {recipe.requiredStats.magicworking && (
              <div className="flex justify-between text-xs">
                <span>Magicworking</span>
                <span className="text-purple-400">Level {recipe.requiredStats.magicworking}</span>
              </div>
            )}
            {recipe.requiredStats.spellcraft && (
              <div className="flex justify-between text-xs">
                <span>Spellcraft</span>
                <span className="text-cyan-400">Level {recipe.requiredStats.spellcraft}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Experience Gain</h3>
          <div className="space-y-1">
            {recipe.experienceGain?.metalworking && recipe.experienceGain.metalworking > 0 && (
              <div className="flex justify-between text-xs">
                <span>Metalworking</span>
                <span className="text-amber-400">+{recipe.experienceGain.metalworking} XP</span>
              </div>
            )}
            {recipe.experienceGain?.magicworking && recipe.experienceGain.magicworking > 0 && (
              <div className="flex justify-between text-xs">
                <span>Magicworking</span>
                <span className="text-purple-400">+{recipe.experienceGain.magicworking} XP</span>
              </div>
            )}
            {recipe.experienceGain?.spellcraft && recipe.experienceGain.spellcraft > 0 && (
              <div className="flex justify-between text-xs">
                <span>Spellcraft</span>
                <span className="text-cyan-400">+{recipe.experienceGain.spellcraft} XP</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Required Ingredients</h3>
        <div className="grid grid-cols-3 gap-2">
          {recipe.inputs.map((itemId, index) => (
            <div key={`${itemId}-${index}`} className="flex flex-col items-center">
              <ItemSlot 
                item={gameItems[itemId]} 
                onDragStart={() => {}} 
                size="small"
              />
              <div className="text-xs text-gray-400 mt-1">{gameItems[itemId]?.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Output</h3>
        <div className="flex items-center">
          <div className="mr-4">
            <ItemSlot 
              item={outputItem} 
              onDragStart={() => {}} 
            />
          </div>
          <div>
            <div className="text-sm font-medium">{outputItem.name}</div>
            <div className="text-xs text-gray-400 mt-1">{outputItem.description}</div>
          </div>
        </div>
      </div>

      {!hasRequiredItems && (
        <div className="bg-red-900/20 border border-red-900 rounded-md p-3 mb-4 flex items-start">
          <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-red-400">Missing Ingredients</div>
            <div className="text-xs text-gray-300 mt-1">
              You don't have all the required ingredients for this recipe.
            </div>
          </div>
        </div>
      )}

      {magicPoints < magicCost && (
        <div className="bg-red-900/20 border border-red-900 rounded-md p-3 mb-4 flex items-start">
          <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-red-400">Insufficient Magic</div>
            <div className="text-xs text-gray-300 mt-1">
              You need {magicCost} magic points to craft this item. Current: {magicPoints}
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <Button 
          onClick={onCraft} 
          disabled={!canCraft}
          className="flex-1"
        >
          <Check className="mr-2 h-4 w-4" />
          Craft Item
        </Button>
        <Button 
          variant="outline" 
          onClick={onClearGrid}
          className="flex-1"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Grid
        </Button>
      </div>
    </div>
  )
} 