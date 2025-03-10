"use client"

import { CraftingControlType } from "@/lib/recipes"
import { getMagicCost, getControlsToDisplay } from "@/lib/crafting-controls-utils"
import ControlSlider from "./crafting/control-slider"

interface CraftingControlsProps {
  activeControl: CraftingControlType
  controlValues: Record<CraftingControlType, number>
  onControlChange: (control: CraftingControlType, value: number) => void
  recipeCategory?: string
  hasCursedRing?: boolean
  magicPoints: number
  maxMagicPoints: number
}

export default function CraftingControls({
  controlValues,
  onControlChange,
  recipeCategory,
  hasCursedRing = false,
  magicPoints,
  maxMagicPoints
}: CraftingControlsProps) {
  const controls = getControlsToDisplay(hasCursedRing);
  const currentMagicCost = getMagicCost(controlValues.magic);
  const hasEnoughMagic = magicPoints >= currentMagicCost;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-blue-400">
          <span className={`${!hasEnoughMagic ? 'text-red-400' : 'text-gray-400'}`}>
            Magic Points: {magicPoints}/{maxMagicPoints}
          </span>
        </div>
      </div>
      
      {controls.map((control, index) => (
        <ControlSlider
          key={control}
          controlType={control as CraftingControlType}
          value={controlValues[control as CraftingControlType]}
          onChange={onControlChange}
          recipeCategory={recipeCategory}
          isLast={index === controls.length - 1}
          magicPoints={magicPoints}
          maxMagicPoints={maxMagicPoints}
        />
      ))}
    </div>
  )
} 