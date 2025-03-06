import { CharacterStats } from "@/components/character-sheet";

/**
 * Calculate the percentage of experience towards the next level
 */
export const getExperiencePercentage = (current: number, max: number): number => {
  return Math.min(Math.round((current / max) * 100), 100);
};

/**
 * Calculate the progress percentage for a crafting skill
 */
export const getCraftingLevelProgress = (
  level: number,
  experience: number
): number => {
  const requiredExp = level * 100;
  return Math.min(Math.round((experience / requiredExp) * 100), 100);
};

/**
 * Check if a character has a specific item equipped
 */
export const hasItemEquipped = (
  character: CharacterStats,
  itemId: string
): boolean => {
  // Check regular equipment slots
  for (const [slot, equippedItemId] of Object.entries(character.equipment)) {
    if (slot === "rings") continue; // Rings are handled separately
    if (equippedItemId === itemId) return true;
  }
  
  // Check rings
  return character.equipment.rings.includes(itemId);
}; 