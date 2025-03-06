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
  magicPoints?: number;
  maxMagicPoints?: number;
}

export default function ControlSlider({
  controlType,
  value,
  onChange,
  recipeCategory,
  isLast,
  magicPoints,
  maxMagicPoints
}: ControlSliderProps) {
  const handleSliderChange = (newValue: number[]) => {
    onChange(controlType, newValue[0]);
  };

  const effect = getEffectForCategory(controlType, value, recipeCategory);
  
  // For magic control, calculate the max value based on magic points
  const getSliderMax = () => {
    if (controlType === "magic" && maxMagicPoints) {
      // Scale the slider to match magic points
      // Each 20 points on the slider costs more magic points
      // We want to ensure the max slider value corresponds to the max magic points
      return Math.min(100, maxMagicPoints * 5); // Cap at 100 for UI consistency
    }
    return 100;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-300 font-medium">
          {craftingControls[controlType].name}
        </div>
        <Badge variant="outline" className="bg-gray-700">
          {controlType === "magic" ? `${value}/${getSliderMax()}` : getLevelText(controlType, value)}
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
                {controlType === "magic" && maxMagicPoints && (
                  <> Each level costs more MP. Your maximum is {maxMagicPoints} MP.</>
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Slider
            value={[value]}
            min={0}
            max={getSliderMax()}
            step={1}
            onValueChange={handleSliderChange}
            className={`my-2 flex-grow ${controlType === "curse" ? "bg-purple-900/20" : ""}`}
          />
          
          {controlType === "magic" && (
            <div className="relative w-16">
              <input
                type="number"
                min={0}
                max={getSliderMax()}
                value={value}
                onChange={(e) => {
                  const newValue = Math.min(getSliderMax(), Math.max(0, parseInt(e.target.value) || 0));
                  onChange(controlType, newValue);
                }}
                className="w-full h-8 px-2 text-sm bg-gray-800 border border-gray-700 rounded text-center"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          {controlType === "magic" ? (
            // For magic, show numerical values
            <>
              <div className="text-center">0</div>
              <div className="text-center">{Math.floor(getSliderMax() * 0.25)}</div>
              <div className="text-center">{Math.floor(getSliderMax() * 0.5)}</div>
              <div className="text-center">{Math.floor(getSliderMax() * 0.75)}</div>
              <div className="text-center">{getSliderMax()}</div>
            </>
          ) : (
            // For other controls, show the original text labels
            craftingControls[controlType].levels.map((level, index) => (
              <div key={index} className="text-center">
                <div className="w-1 h-1 bg-gray-600 rounded-full mx-auto mb-1"></div>
                {level}
              </div>
            ))
          )}
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