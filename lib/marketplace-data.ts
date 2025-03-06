// NPC Shop Items
export const npcShopItems = [
  // Weapons
  { id: "iron_sword", price: 50, currency: "gold" as const, stock: 5 },
  { id: "steel_axe", price: 75, currency: "gold" as const, stock: 3 },
  { id: "oak_staff", price: 60, currency: "gold" as const, stock: 4 },
  
  // Armor
  { id: "leather_chest", price: 45, currency: "gold" as const, stock: 5 },
  { id: "iron_helmet", price: 40, currency: "gold" as const, stock: 4 },
  { id: "iron_leggings", price: 50, currency: "gold" as const, stock: 3 },
  { id: "leather_boots", price: 35, currency: "gold" as const, stock: 5 },
  { id: "iron_gauntlets", price: 30, currency: "gold" as const, stock: 4 },
  
  // Consumables
  { id: "health_potion", price: 20, currency: "gold" as const, stock: 10 },
  { id: "magic_potion", price: 25, currency: "gold" as const, stock: 8 },
  
  // Premium Items
  { id: "enchanted_sword", price: 5, currency: "gems" as const, stock: 2 },
  { id: "magic_staff", price: 7, currency: "gems" as const, stock: 1 },
  { id: "dragon_scale", price: 3, currency: "gems" as const, stock: 3 },
  { id: "ancient_rune", price: 4, currency: "gems" as const, stock: 2 },
  { id: "cursed_energy_ring", price: 10, currency: "gems" as const, stock: 1 },
  
  // Add the new status effect items
  {
    id: "poisoned_dagger",
    price: 750,
    currency: "gold" as const,
    stock: 1
  },
  {
    id: "bleeding_axe",
    price: 1200,
    currency: "gold" as const,
    stock: 1
  },
  {
    id: "weakness_staff",
    price: 850,
    currency: "gold" as const,
    stock: 1
  },
  {
    id: "burning_gauntlets",
    price: 15,
    currency: "gems" as const,
    stock: 1
  },
  {
    id: "stunning_mace",
    price: 650,
    currency: "gold" as const,
    stock: 1
  },

  // Items with dual currency options - OR logic (either currency)
  {
    id: "stone",
    price: 50,
    currency: "gold" as const,
    stock: 10,
    dualCurrency: { gold: 50, gems: 1 },
    requireBothCurrencies: false
  },
  {
    id: "wood",
    price: 50,
    currency: "gold" as const,
    stock: 10,
    dualCurrency: { gold: 50, gems: 1 },
    requireBothCurrencies: false
  },
  {
    id: "iron_ore",
    price: 50,
    currency: "gold" as const,
    stock: 10,
    dualCurrency: { gold: 50, gems: 1 },
    requireBothCurrencies: false
  },
  {
    id: "leather",
    price: 75,
    currency: "gold" as const,
    stock: 8,
    dualCurrency: { gold: 75, gems: 2 },
    requireBothCurrencies: false
  },
  
  // Items with dual currency options - AND logic (both currencies required)
  {
    id: "magic_crystal",
    price: 100,
    currency: "gold" as const,
    stock: 3,
    dualCurrency: { gold: 100, gems: 3 },
    requireBothCurrencies: true
  },
  {
    id: "ancient_artifact",
    price: 200,
    currency: "gold" as const,
    stock: 1,
    dualCurrency: { gold: 200, gems: 5 },
    requireBothCurrencies: true
  },
  {
    id: "dragon_heart",
    price: 500,
    currency: "gold" as const,
    stock: 1,
    dualCurrency: { gold: 500, gems: 10 },
    requireBothCurrencies: true
  }
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