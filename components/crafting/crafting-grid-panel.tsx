"use client"

import CraftingGrid from "@/components/crafting-grid"
import { Recipe } from "@/components/recipe-book"

interface CraftingGridPanelProps {
  grid: (string | null)[]
  onDrop: (index: number) => void
  onDragStart?: (item: string, source: "grid", index: number) => void
  isDraggingOver: boolean
  highlightedCells: number[]
  selectedRecipe: Recipe | null
}

export default function CraftingGridPanel({
  grid,
  onDrop,
  onDragStart,
  isDraggingOver,
  highlightedCells,
  selectedRecipe
}: CraftingGridPanelProps) {
  // Determine the item type based on the selected recipe
  const getItemType = () => {
    if (!selectedRecipe) return "item";
    
    switch (selectedRecipe.category) {
      case "weapons":
        return "weapon";
      case "armor":
        return "armor";
      case "potions":
        return "potion";
      case "spellcraft":
        return "magical";
      default:
        return "item";
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <h3 className="text-lg font-medium text-amber-400 mb-4">Crafting Grid</h3>
      
      <div className="flex justify-center">
        <CraftingGrid
          grid={grid}
          onDrop={onDrop}
          onDragStart={onDragStart}
          itemType={getItemType()}
          isDraggingOver={isDraggingOver}
          highlightedCells={highlightedCells}
        />
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>Arrange ingredients in the grid to create patterns for bonus effects.</p>
        <p className="mt-2">Different patterns provide different bonuses:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Linear patterns increase item durability</li>
          <li>Diagonal patterns enhance magical properties</li>
          <li>Square patterns improve physical attributes</li>
          <li>Cross patterns balance all attributes</li>
          <li>Triangle patterns focus on offensive capabilities</li>
          <li>Circle patterns enhance defensive properties</li>
        </ul>
      </div>
    </div>
  )
} 