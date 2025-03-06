"use client";

import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, AlertTriangle } from "lucide-react";
import { CraftingControlType, craftingControls } from "@/lib/recipes";
import { getLevelText, getControlTooltip, getEffectForCategory } from "@/lib/crafting-controls-utils";

interface ControlSliderProps {
  controlType: CraftingControlType;
  value: number;
  onChange: (control: CraftingControlType, value: number) => void;
  recipeCategory?: string;
  isLast: boolean;
}

export default function ControlSlider({
  controlType,
  value,
  onChange,
  recipeCategory,
  isLast
}: ControlSliderProps) {
  const handleSliderChange = (newValue: number[]) => {
    onChange(controlType, newValue[0]);
  };

  const effect = getEffectForCategory(controlType, value, recipeCategory);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-300 font-medium">
          {craftingControls[controlType].name}
        </div>
        <Badge variant="outline" className="bg-gray-700">
          {getLevelText(controlType, value)}
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
                {getControlTooltip(controlType)}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div>
        <Slider
          value={[value]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleSliderChange}
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
      
      {!isLast && (
        <div className="border-t border-gray-700 pt-1"></div>
      )}
    </div>
  );
} 