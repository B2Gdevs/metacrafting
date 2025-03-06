"use client";

import { CraftingControlType, craftingControls } from "@/lib/recipes";

/**
 * Get the effect for a specific control and category
 */
export const getEffectForCategory = (
  control: CraftingControlType,
  controlValue: number,
  category?: string
) => {
  if (!category || !craftingControls[control].effects[category]) {
    return null;
  }

  // Get effect based on current control value (0-4 maps to effects array index)
  const effectIndex = Math.min(
    Math.floor(controlValue / 25),
    craftingControls[control].effects[category].length - 1
  );
  
  return craftingControls[control].effects[category][effectIndex];
};

/**
 * Get the level text for a control based on its value
 */
export const getLevelText = (control: CraftingControlType, value: number) => {
  const levels = craftingControls[control].levels;
  const index = Math.min(Math.floor(value / (100 / (levels.length - 1))), levels.length - 1);
  return levels[index];
};

/**
 * Calculate magic cost based on magic power level
 */
export const getMagicCost = (magicValue: number) => {
  const baseCost = craftingControls.magic.magicCost || 0;
  const magicLevel = Math.floor(magicValue / 20); // 0-5 scale
  return baseCost * (magicLevel + 1);
};

/**
 * Get controls to display based on available features
 */
export const getControlsToDisplay = (hasCursedRing: boolean) => {
  const controls = ["magic", "stability"];
  if (hasCursedRing) {
    controls.push("curse");
  }
  return controls;
};

/**
 * Get tooltip description for a control
 */
export const getControlTooltip = (controlType: CraftingControlType) => {
  switch (controlType) {
    case "magic":
      return "Increases the magical power but consumes more magic points.";
    case "stability":
      return "Controls how stable the magical energies are during crafting.";
    case "curse":
      return "Infuses dark energies that can provide powerful but dangerous effects.";
    default:
      return "";
  }
};

/**
 * Check if the player has enough magic points for the current magic cost
 */
export const hasEnoughMagicPoints = (magicValue: number, currentMagicPoints: number) => {
  return currentMagicPoints >= getMagicCost(magicValue);
}; 