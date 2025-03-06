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
  
  // Calculate cost based on percentage of the slider
  // This makes it scale better with the character's magic points
  // At 0%, cost is baseCost
  // At 100%, cost is 6 * baseCost
  const percentage = magicValue / 100;
  const multiplier = 1 + (percentage * 5); // Scale from 1x to 6x
  
  return Math.floor(baseCost * multiplier);
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
      return "Determines the magical effects applied to the crafted item. Higher values add stronger magical properties but consume more magic points.";
    case "stability":
      return "Controls the stability of magical energies. Different stability levels provide different effects based on the item type being crafted.";
    case "curse":
      return "Infuses dark energies that provide powerful but potentially dangerous effects. Requires a Cursed Energy Ring to use.";
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