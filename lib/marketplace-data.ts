import { CurrencyType } from "@/lib/marketplace-types";
import { PlayerMarketItem } from "@/lib/marketplace-types";

// NPC Shop Items
export const npcShopItems = [
  // Weapons
  { id: "iron_sword", price: 50, currency: CurrencyType.GOLD, stock: 5 },
  { id: "steel_axe", price: 75, currency: CurrencyType.GOLD, stock: 3 },
  { id: "oak_staff", price: 60, currency: CurrencyType.GOLD, stock: 4 },
  
  // Armor
  { id: "leather_chest", price: 45, currency: CurrencyType.GOLD, stock: 5 },
  { id: "iron_helmet", price: 40, currency: CurrencyType.GOLD, stock: 4 },
  { id: "iron_leggings", price: 50, currency: CurrencyType.GOLD, stock: 3 },
  { id: "leather_boots", price: 35, currency: CurrencyType.GOLD, stock: 5 },
  { id: "iron_gauntlets", price: 30, currency: CurrencyType.GOLD, stock: 4 },
  
  // Consumables
  { id: "health_potion", price: 20, currency: CurrencyType.GOLD, stock: 10 },
  { id: "magic_potion", price: 25, currency: CurrencyType.GOLD, stock: 8 },
  
  // Premium Items
  { id: "enchanted_sword", price: 5, currency: CurrencyType.GEMS, stock: 2 },
  { id: "magic_staff", price: 7, currency: CurrencyType.GEMS, stock: 1 },
  { id: "dragon_scale", price: 3, currency: CurrencyType.GEMS, stock: 3 },
  { id: "ancient_rune", price: 4, currency: CurrencyType.GEMS, stock: 2 },
  { id: "cursed_energy_ring", price: 10, currency: CurrencyType.GEMS, stock: 1 },
  
  // Add the new status effect items
  {
    id: "poisoned_dagger",
    price: 750,
    currency: CurrencyType.GOLD,
    stock: 1
  },
  {
    id: "bleeding_axe",
    price: 1200,
    currency: CurrencyType.GOLD,
    stock: 1
  },
  {
    id: "weakness_staff",
    price: 850,
    currency: CurrencyType.GOLD,
    stock: 1
  },
  {
    id: "burning_gauntlets",
    price: 15,
    currency: CurrencyType.GEMS,
    stock: 1
  },
  {
    id: "stunning_mace",
    price: 650,
    currency: CurrencyType.GOLD,
    stock: 1
  },

  // Items with dual currency options - OR logic (either currency)
  {
    id: "stone",
    price: 50,
    currency: CurrencyType.GOLD,
    stock: 10,
    dualCurrency: { gold: 50, gems: 1 },
    requireBothCurrencies: false
  },
  {
    id: "wood",
    price: 50,
    currency: CurrencyType.GOLD,
    stock: 10,
    dualCurrency: { gold: 50, gems: 1 },
    requireBothCurrencies: false
  },
  {
    id: "iron_ore",
    price: 50,
    currency: CurrencyType.GOLD,
    stock: 10,
    dualCurrency: { gold: 50, gems: 1 },
    requireBothCurrencies: false
  },
  {
    id: "leather",
    price: 75,
    currency: CurrencyType.GOLD,
    stock: 8,
    dualCurrency: { gold: 75, gems: 2 },
    requireBothCurrencies: false
  },
  
  // Items with dual currency options - AND logic (both currencies required)
  {
    id: "magic_crystal",
    price: 100,
    currency: CurrencyType.GOLD,
    stock: 3,
    dualCurrency: { gold: 100, gems: 3 },
    requireBothCurrencies: true
  },
  {
    id: "ancient_artifact",
    price: 200,
    currency: CurrencyType.GOLD,
    stock: 1,
    dualCurrency: { gold: 200, gems: 5 },
    requireBothCurrencies: true
  },
  {
    id: "dragon_heart",
    price: 500,
    currency: CurrencyType.GOLD,
    stock: 1,
    dualCurrency: { gold: 500, gems: 10 },
    requireBothCurrencies: true
  },

  // Dual currency items
  {
    id: "phoenix_feather",
    price: 500,
    currency: CurrencyType.GOLD,
    stock: 1,
    dualCurrency: { gold: 500, gems: 5 },
    requireBothCurrencies: false
  },
  {
    id: "dragon_heart",
    price: 1000,
    currency: CurrencyType.GOLD,
    stock: 1,
    dualCurrency: { gold: 1000, gems: 10 },
    requireBothCurrencies: true
  },
  
  // Crafting materials
  { id: "wood", price: 10, currency: CurrencyType.GOLD, stock: 20 },
  { id: "stone", price: 15, currency: CurrencyType.GOLD, stock: 20 },
  { id: "iron_ore", price: 25, currency: CurrencyType.GOLD, stock: 15 },
  { id: "silver_ore", price: 40, currency: CurrencyType.GOLD, stock: 10 },
  { id: "gold_ore", price: 60, currency: CurrencyType.GOLD, stock: 5 },
  { id: "leather", price: 20, currency: CurrencyType.GOLD, stock: 15 },
  { id: "cloth", price: 15, currency: CurrencyType.GOLD, stock: 20 },
  { id: "herbs", price: 5, currency: CurrencyType.GOLD, stock: 25 },
  
  // Rare crafting materials
  { id: "dragon_scale_fragment", price: 2, currency: CurrencyType.GEMS, stock: 5 },
  { id: "phoenix_ash", price: 3, currency: CurrencyType.GEMS, stock: 3 },
  { id: "mithril_ore", price: 4, currency: CurrencyType.GEMS, stock: 2 },
  { id: "enchanted_fabric", price: 3, currency: CurrencyType.GEMS, stock: 4 },
  { id: "magical_essence", price: 2, currency: CurrencyType.GEMS, stock: 6 },
  
  // Recipes
  { id: "iron_sword_recipe", price: 100, currency: CurrencyType.GOLD, stock: 1 },
  { id: "leather_chest_recipe", price: 90, currency: CurrencyType.GOLD, stock: 1 },
  { id: "health_potion_recipe", price: 50, currency: CurrencyType.GOLD, stock: 1 },
  { id: "enchanted_sword_recipe", price: 8, currency: CurrencyType.GEMS, stock: 1 },
];

// NPC Avatar and Dialogues
export const npcDialogues = [
  "Welcome, traveler! See anything you like?",
  "Special deals today, don't miss out!",
  "Looking for something rare? I've got just the thing!",
  "These items were crafted by the finest artisans in the realm!",
  "Need something to enhance your adventures? You've come to the right place!"
];

export const npcAvatar = {
  image: '/images/merchant.png',
  name: 'Merchant Galen',
  dialogues: npcDialogues
};

// Player Market Items - In-memory database for player listings
export let playerMarketItems: PlayerMarketItem[] = [];

// Function to add a new listing to the player marketplace
export function addPlayerListing(listing: PlayerMarketItem): void {
  // Create a deep copy to ensure we don't have reference issues
  const newListing = structuredClone(listing);
  
  // Ensure currencies object exists
  if (!newListing.currencies) {
    newListing.currencies = {};
  }
  
  // Validate that we have at least one currency with a positive value
  const goldPrice = newListing.currencies[CurrencyType.GOLD] || 0;
  const gemsPrice = newListing.currencies[CurrencyType.GEMS] || 0;
  
  if (goldPrice <= 0 && gemsPrice <= 0) {
    console.error("Cannot add listing without at least one positive currency value");
    return;
  }
  
  // Ensure all required fields are present
  if (!newListing.id) {
    console.error("Cannot add listing without an id");
    return;
  }
  
  if (!newListing.seller) {
    console.error("Cannot add listing without a seller");
    return;
  }
  
  if (!newListing.quantity || newListing.quantity <= 0) {
    console.error("Cannot add listing with invalid quantity");
    return;
  }
  
  // Log before and after to verify data integrity
  console.log("Original listing:", listing);
  console.log("Adding new player listing:", newListing);
  
  // Add the listing to the player market items array
  playerMarketItems.push(newListing);
  console.log("Current player listings count:", playerMarketItems.length);
  console.log("Current player listings:", playerMarketItems);
}

// Function to remove a listing from the player marketplace
export function removePlayerListing(id: string, seller: string): boolean {
  const initialLength = playerMarketItems.length;
  playerMarketItems = playerMarketItems.filter(
    item => !(item.id === id && item.seller === seller)
  );
  return playerMarketItems.length < initialLength;
}

// Function to update a listing in the player marketplace
export function updatePlayerListing(id: string, seller: string, updates: Partial<PlayerMarketItem>): boolean {
  const index = playerMarketItems.findIndex(
    item => item.id === id && item.seller === seller
  );
  
  if (index === -1) return false;
  
  playerMarketItems[index] = { ...playerMarketItems[index], ...updates };
  return true;
}

// Function to get all player listings
export function getPlayerListings(): PlayerMarketItem[] {
  return [...playerMarketItems]; // Return a copy to prevent direct mutation
}

// Function to clear all player listings (for testing)
export function clearPlayerListings(): void {
  playerMarketItems = [];
} 