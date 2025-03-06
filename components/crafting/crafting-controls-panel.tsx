"use client"

import CraftingControls from "@/components/crafting-controls"
import { CraftingControlType } from "@/lib/recipes"
import { Recipe } from "@/components/recipe-book"

interface CraftingControlsPanelProps {
  controlValues: Record<CraftingControlType, number>
  onControlChange: (control: CraftingControlType, value: number) => void
  selectedRecipe: Recipe | null
  hasCursedRing: boolean
  magicPoints: number
  maxMagicPoints: number
}

export default function CraftingControlsPanel({
  controlValues,
  onControlChange,
  selectedRecipe,
  hasCursedRing,
  magicPoints,
  maxMagicPoints
}: CraftingControlsPanelProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <h3 className="text-lg font-medium text-amber-400 mb-4">Crafting Controls</h3>
      
      <CraftingControls
        controlValues={controlValues}
        onControlChange={onControlChange}
        recipeCategory={selectedRecipe?.category}
        hasCursedRing={hasCursedRing}
        magicPoints={magicPoints}
        maxMagicPoints={maxMagicPoints}
        activeControl="magic" // This prop is not used in the component but is required by the interface
      />
      
      <div className="mt-4 text-xs text-gray-400">
        <p>Adjust the controls to influence the crafting process. Higher magic power adds magical effects to items but consumes more magic points.</p>
        <p className="mt-2">Stability affects different properties depending on the item type being crafted.</p>
        {hasCursedRing && (
          <p className="mt-2 text-purple-400">Curse energy can provide powerful effects but may have unpredictable consequences.</p>
        )}
      </div>
    </div>
  )
} 