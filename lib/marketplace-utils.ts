"use client"

import { Item } from "@/components/item-slot";

/**
 * Get CSS class for item rarity
 */
export const getRarityClass = (rarity: string): string => {
  switch (rarity) {
    case "common":
      return "border-gray-600 bg-gradient-to-b from-gray-800 to-gray-900";
    case "uncommon":
      return "border-green-600 bg-gradient-to-b from-gray-800 to-green-900/30";
    case "rare":
      return "border-blue-600 bg-gradient-to-b from-gray-800 to-blue-900/30";
    case "epic":
      return "border-purple-600 bg-gradient-to-b from-gray-800 to-purple-900/30";
    case "legendary":
      return "border-amber-500 bg-gradient-to-b from-gray-800 to-amber-900/30 shadow-lg shadow-amber-500/20";
    case "mythic":
      return "border-red-500 bg-gradient-to-b from-gray-800 to-red-900/30 shadow-lg shadow-red-500/20";
    default:
      return "border-gray-600 bg-gradient-to-b from-gray-800 to-gray-900";
  }
};

/**
 * Get CSS class for rarity-based buttons
 */
export const getRarityButtonClass = (rarity: string): string => {
  switch (rarity) {
    case "common":
      return "bg-gray-700 hover:bg-gray-600";
    case "uncommon":
      return "bg-green-700 hover:bg-green-600";
    case "rare":
      return "bg-blue-700 hover:bg-blue-600";
    case "epic":
      return "bg-purple-700 hover:bg-purple-600";
    case "legendary":
      return "bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-black";
    case "mythic":
      return "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-black";
    default:
      return "bg-gray-700 hover:bg-gray-600";
  }
};

/**
 * Format stat name for display
 */
export const formatStatName = (stat: string): string => {
  return stat
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

/**
 * Calculate sell price for an item (typically 50% of buy price)
 */
export const calculateSellPrice = (item: Item): number => {
  if (!item || typeof item.value !== 'number') return 0;
  return Math.floor(item.value * 0.5);
};

/**
 * Get item type icon
 */
export const getItemTypeIcon = (type: string): string => {
  switch (type) {
    case "weapon":
      return "⚔️";
    case "armor":
      return "🛡️";
    case "accessory":
      return "💍";
    case "consumable":
      return "🧪";
    case "material":
      return "📦";
    case "quest":
      return "📜";
    case "ingredient":
      return "🧩";
    case "potion":
      return "🧪";
    case "tool":
      return "🔨";
    default:
      return "📦";
  }
};

/**
 * Format currency display
 */
export const formatCurrency = (amount: number, currency: "gold" | "gems"): string => {
  return `${amount} ${currency === "gold" ? "Gold" : "Gems"}`;
};

/**
 * Format dual currency display
 */
export const formatDualCurrency = (dualCurrency: { gold: number; gems: number }): string => {
  return `${dualCurrency.gold} Gold + ${dualCurrency.gems} Gems`;
};

/**
 * Check if player can afford an item
 */
export const canAffordItem = (
  playerGold: number,
  playerGems: number,
  price: number,
  currency: "gold" | "gems",
  dualCurrency?: { gold: number; gems: number }
): boolean => {
  if (dualCurrency) {
    return playerGold >= dualCurrency.gold && playerGems >= dualCurrency.gems;
  }
  
  if (currency === "gold") {
    return playerGold >= price;
  }
  
  return playerGems >= price;
};

/**
 * Get text color class for rarity
 */
export const getRarityTextClass = (rarity: string): string => {
  switch (rarity) {
    case "common":
      return "text-gray-300";
    case "uncommon":
      return "text-green-400";
    case "rare":
      return "text-blue-400";
    case "epic":
      return "text-purple-400";
    case "legendary":
      return "text-amber-400";
    case "mythic":
      return "text-red-400";
    default:
      return "text-gray-300";
  }
};

/**
 * Get background class for marketplace tabs
 */
export const getMarketplaceTabClass = (tab: "npc" | "player", isSelected: boolean): string => {
  if (!isSelected) return "bg-gray-800";
  
  return tab === "npc" 
    ? "bg-gradient-to-r from-amber-700 to-amber-900 border-2 border-amber-500 text-amber-100 font-semibold" 
    : "bg-gradient-to-r from-blue-700 to-blue-900 border-2 border-blue-500 text-blue-100 font-semibold";
};

/**
 * Get background class for marketplace container
 */
export const getMarketplaceContainerClass = (tab: "npc" | "player"): string => {
  return tab === "npc" 
    ? "bg-gradient-to-r from-amber-950 to-amber-900/50 border-2 border-amber-800/50" 
    : "bg-gradient-to-r from-blue-950 to-blue-900/50 border-2 border-blue-800/50";
};

/**
 * Get background class for filter container
 */
export const getFilterContainerClass = (tab: "npc" | "player"): string => {
  return tab === "npc" 
    ? "bg-gradient-to-b from-amber-950/30 to-amber-900/10 border-2 border-amber-800/50" 
    : "bg-gradient-to-b from-blue-950/30 to-blue-900/10 border-2 border-blue-800/50";
};

/**
 * Get text color for marketplace tab
 */
export const getMarketplaceTextClass = (tab: "npc" | "player"): string => {
  return tab === "npc" ? "text-amber-300" : "text-blue-300";
};

/**
 * Get icon color for marketplace tab
 */
export const getMarketplaceIconClass = (tab: "npc" | "player"): string => {
  return tab === "npc" ? "text-amber-400" : "text-blue-400";
}; 