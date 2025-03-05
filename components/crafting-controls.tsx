"use client"

import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CraftingControlType, craftingControls } from "@/lib/recipes"
import { Info, AlertTriangle } from "lucide-react"

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
  const handleSliderChange = (control: CraftingControlType, value: number[]) => {
    onControlChange(control, value[0])
  }

  const getEffectForCategory = (control: CraftingControlType, category?: string) => {
    if (!category || !craftingControls[control].effects[category]) {
      return null
    }

    // Get effect based on current control value (0-4 maps to effects array index)
    const effectIndex = Math.min(
      Math.floor(controlValues[control] / 25),
      craftingControls[control].effects[category].length - 1
    )
    
    return craftingControls[control].effects[category][effectIndex]
  }

  const getLevelText = (control: CraftingControlType, value: number) => {
    const levels = craftingControls[control].levels
    const index = Math.min(Math.floor(value / (100 / (levels.length - 1))), levels.length - 1)
    return levels[index]
  }

  // Calculate magic cost based on magic power level
  const getMagicCost = () => {
    const baseCost = craftingControls.magic.magicCost || 0;
    const magicLevel = Math.floor(controlValues.magic / 20); // 0-5 scale
    return baseCost * (magicLevel + 1);
  }

  // Get controls to display
  const getControlsToDisplay = () => {
    const controls = ["magic", "stability"];
    if (hasCursedRing) {
      controls.push("curse");
    }
    return controls;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-amber-400">Crafting Controls</div>
        <div className="text-xs text-blue-400">
          Magic Cost: {getMagicCost()} MP
          <span className={`ml-2 ${magicPoints < getMagicCost() ? 'text-red-400' : 'text-gray-400'}`}>
            ({magicPoints}/{maxMagicPoints})
          </span>
        </div>
      </div>
      
      {getControlsToDisplay().map((control) => {
        const controlType = control as CraftingControlType
        const currentValue = controlValues[controlType]
        const effect = getEffectForCategory(controlType, recipeCategory)
        
        return (
          <div key={control} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-300 font-medium">
                {craftingControls[controlType].name}
              </div>
              <Badge variant="outline" className="bg-gray-700">
                {getLevelText(controlType, currentValue)}
              </Badge>
            </div>
            
            <div className="text-xs text-gray-400 flex items-center">
              {craftingControls[controlType].description}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center ml-1">
                      <Info className="w-3 h-3 text-gray-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="text-xs">
                      {controlType === "magic" && "Increases the magical power but consumes more magic points."}
                      {controlType === "stability" && "Controls how stable the magical energies are during crafting."}
                      {controlType === "curse" && "Infuses dark energies that can provide powerful but dangerous effects."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div>
              <Slider
                value={[currentValue]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => handleSliderChange(controlType, value)}
                className={`my-2 ${controlType === "curse" ? "bg-purple-900/20" : ""}`}
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                {craftingControls[controlType].levels.map((level, index) => (
                  <div key={index} className="text-center">
                    <div className="w-1 h-1 bg-gray-600 rounded-full mx-auto mb-1"></div>
                    {level}
                  </div>
                ))}
              </div>
            </div>

            {effect && (
              <div className={`rounded p-2 text-xs ${controlType === "curse" ? "bg-purple-900/30 border border-purple-800" : "bg-gray-700"}`}>
                <div className={`font-medium ${controlType === "curse" ? "text-purple-400" : "text-amber-400"}`}>{effect.name}</div>
                <div className="text-gray-300 mt-1">{effect.description}</div>
              </div>
            )}
            
            {controlType === "curse" && (
              <div className="flex items-center text-xs text-purple-400 mt-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Using curse energy may have unpredictable side effects
              </div>
            )}
            
            {control !== getControlsToDisplay()[getControlsToDisplay().length - 1] && (
              <div className="border-t border-gray-700 pt-1"></div>
            )}
          </div>
        )
      })}
    </div>
  )
} 