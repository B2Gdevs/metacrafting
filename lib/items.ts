import { Item } from "@/components/item-slot";

// Define equipment slot types
export type EquipmentSlot = "head" | "chest" | "legs" | "feet" | "hands" | "rings" | "weapon" | "offhand" | "neck";

// Sample items data with enhanced properties
export const gameItems: Record<string, Item> = {
  wood: {
    id: "wood",
    name: "Wood",
    image: "/placeholder.svg?height=64&width=64",
    description: "Basic crafting material gathered from trees",
    type: "ingredient",
    subType: "natural",
    rarity: "common",
  },
  stone: {
    id: "stone",
    name: "Stone",
    image: "/placeholder.svg?height=64&width=64",
    description: "Common material found throughout the world",
    type: "ingredient",
    subType: "mineral",
    rarity: "common",
  },
  iron_ore: {
    id: "iron_ore",
    name: "Iron Ore",
    image: "/placeholder.svg?height=64&width=64",
    description: "Metal ore that can be refined and crafted",
    type: "ingredient",
    subType: "metal",
    rarity: "common",
  },
  leather: {
    id: "leather",
    name: "Leather",
    image: "/placeholder.svg?height=64&width=64",
    description: "Processed animal hide used for armor and items",
    type: "ingredient",
    subType: "animal",
    rarity: "common",
  },
  herb: {
    id: "herb",
    name: "Herb",
    image: "/placeholder.svg?height=64&width=64",
    description: "Medicinal plant with magical properties",
    type: "ingredient",
    subType: "magical",
    rarity: "common",
  },
  crystal: {
    id: "crystal",
    name: "Magic Crystal",
    image: "/placeholder.svg?height=64&width=64",
    description: "Crystallized magical energy",
    type: "ingredient",
    subType: "magical",
    magicValue: 5,
    rarity: "common",
  },
  steel: {
    id: "steel",
    name: "Steel Ingot",
    image: "/placeholder.svg?height=64&width=64",
    description: "Refined metal alloy for crafting weapons and armor",
    type: "ingredient",
    subType: "metal",
    rarity: "common",
  },
  cloth: {
    id: "cloth",
    name: "Cloth",
    image: "/placeholder.svg?height=64&width=64",
    description: "Woven fabric for crafting clothing and light armor",
    type: "ingredient",
    subType: "textile",
    rarity: "common",
  },
  enchanted_leather: {
    id: "enchanted_leather",
    name: "Enchanted Leather",
    image: "/placeholder.svg?height=64&width=64",
    description: "Leather infused with magical properties for crafting special armor",
    type: "ingredient",
    subType: "magical",
    magicValue: 3,
    rarity: "common",
  },
  dragon_scale: {
    id: "dragon_scale",
    name: "Dragon Scale",
    image: "/placeholder.svg?height=64&width=64",
    description: "Rare scales from a dragon, extremely durable and heat resistant",
    type: "ingredient",
    subType: "magical",
    magicValue: 8,
    rarity: "common",
  },
  ancient_rune: {
    id: "ancient_rune",
    name: "Ancient Rune",
    image: "/placeholder.svg?height=64&width=64",
    description: "A mysterious rune with powerful magical properties",
    type: "ingredient",
    subType: "magical",
    magicValue: 10,
    rarity: "common",
  },
  silver: {
    id: "silver",
    name: "Silver Ingot",
    image: "/placeholder.svg?height=64&width=64",
    description: "Refined silver metal, excellent for magical conductivity",
    type: "ingredient",
    subType: "metal",
    rarity: "common",
  },
  axe: {
    id: "axe",
    name: "Wooden Axe",
    image: "/placeholder.svg?height=64&width=64",
    description: "Basic tool for chopping wood",
    type: "tool",
    stats: {
      Gathering: 2,
    },
    rarity: "common",
  },
  pickaxe: {
    id: "pickaxe",
    name: "Stone Pickaxe",
    image: "/placeholder.svg?height=64&width=64",
    description: "Tool for mining stone and ore",
    type: "tool",
    stats: {
      Mining: 3,
    },
    rarity: "common",
  },
  sword: {
    id: "sword",
    name: "Iron Sword",
    image: "/placeholder.svg?height=64&width=64",
    description: "Basic melee weapon",
    type: "weapon",
    subType: "melee",
    equippable: true,
    slot: "weapon",
    stats: {
      Attack: 5,
      Speed: 2,
    },
    rarity: "common",
  },
  staff: {
    id: "staff",
    name: "Wooden Staff",
    image: "/placeholder.svg?height=64&width=64",
    description: "Channel magical energies with this staff",
    type: "weapon",
    subType: "magic",
    magicValue: 3,
    equippable: true,
    slot: "weapon",
    stats: {
      "Magic Power": 4,
    },
    rarity: "common",
  },
  helmet: {
    id: "helmet",
    name: "Leather Helmet",
    image: "/placeholder.svg?height=64&width=64",
    description: "Basic head protection",
    type: "armor",
    subType: "head",
    equippable: true,
    slot: "head",
    stats: {
      Defense: 2,
    },
    rarity: "common",
  },
  potion: {
    id: "potion",
    name: "Health Potion",
    image: "/placeholder.svg?height=64&width=64",
    description: "Restores health when consumed",
    type: "potion",
    stats: {
      Healing: 20,
    },
    rarity: "common",
  },
  mana_potion: {
    id: "mana_potion",
    name: "Mana Potion",
    image: "/placeholder.svg?height=64&width=64",
    description: "Restores magic points when consumed",
    type: "potion",
    stats: {
      "MP Restore": 15,
    },
    rarity: "common",
  },
  enchanted_sword: {
    id: "enchanted_sword",
    name: "Enchanted Sword",
    image: "/placeholder.svg?height=64&width=64",
    description: "A sword imbued with magical energy",
    type: "weapon",
    subType: "melee",
    magicValue: 5,
    equippable: true,
    slot: "weapon",
    stats: {
      Attack: 8,
      "Magic Damage": 3,
    },
    rarity: "common",
  },
  dragon_armor: {
    id: "dragon_armor",
    name: "Dragon Scale Armor",
    image: "/placeholder.svg?height=64&width=64",
    description: "Legendary armor crafted from dragon scales",
    type: "armor",
    subType: "body",
    magicValue: 6,
    equippable: true,
    slot: "chest",
    stats: {
      Defense: 12,
      "Magic Defense": 8,
      "Fire Resistance": 15,
    },
    rarity: "common",
  },
  runic_staff: {
    id: "runic_staff",
    name: "Runic Staff",
    image: "/placeholder.svg?height=64&width=64",
    description: "A powerful staff inscribed with ancient runes",
    type: "weapon",
    subType: "magic",
    magicValue: 12,
    equippable: true,
    slot: "weapon",
    stats: {
      "Magic Power": 10,
      "Spell Efficiency": 5,
    },
    rarity: "common",
  },
  silver_amulet: {
    id: "silver_amulet",
    name: "Silver Amulet",
    image: "/placeholder.svg?height=64&width=64",
    description: "A silver amulet that enhances magical abilities",
    type: "accessory",
    subType: "neck",
    magicValue: 7,
    equippable: true,
    slot: "neck",
    stats: {
      "Magic Power": 3,
      "MP Regeneration": 2,
    },
    rarity: "common",
  },
  healing_salve: {
    id: "healing_salve",
    name: "Healing Salve",
    image: "/placeholder.svg?height=64&width=64",
    description: "A potent healing ointment that can be applied to wounds",
    type: "potion",
    stats: {
      "Healing Over Time": 30,
    },
    rarity: "common",
  },
  fireball_scroll: {
    id: "fireball_scroll",
    name: "Fireball Scroll",
    image: "/placeholder.svg?height=64&width=64",
    description: "A scroll that teaches the fireball spell",
    type: "magical",
    subType: "scroll",
    magicValue: 8,
    stats: {
      "Fire Damage": 25,
      "Area Effect": 3,
    },
    rarity: "common",
  },
  frost_rune: {
    id: "frost_rune",
    name: "Frost Rune",
    image: "/placeholder.svg?height=64&width=64",
    description: "A rune that can freeze enemies when activated",
    type: "magical",
    subType: "rune",
    magicValue: 6,
    stats: {
      "Ice Damage": 15,
      "Freeze Duration": 4,
    },
    rarity: "common",
  },
  lightning_gem: {
    id: "lightning_gem",
    name: "Lightning Gem",
    image: "/placeholder.svg?height=64&width=64",
    description: "A gem that can channel lightning magic",
    type: "magical",
    subType: "gem",
    magicValue: 10,
    stats: {
      "Lightning Damage": 30,
      "Chain Targets": 3,
    },
    rarity: "common",
  },
  iron_helmet: {
    id: "iron_helmet",
    name: "Iron Helmet",
    image: "/placeholder.svg?height=64&width=64",
    description: "Basic protective headgear",
    type: "armor",
    subType: "metal",
    equippable: true,
    slot: "head",
    stats: {
      "Defense": 5,
    },
    rarity: "common",
  },
  leather_chest: {
    id: "leather_chest",
    name: "Leather Chestpiece",
    image: "/placeholder.svg?height=64&width=64",
    description: "Flexible chest protection",
    type: "armor",
    subType: "leather",
    equippable: true,
    slot: "chest",
    stats: {
      "Defense": 6,
      "Movement Speed": 1,
    },
    rarity: "common",
  },
  iron_leggings: {
    id: "iron_leggings",
    name: "Iron Leggings",
    image: "/placeholder.svg?height=64&width=64",
    description: "Sturdy leg protection",
    type: "armor",
    subType: "metal",
    equippable: true,
    slot: "legs",
    stats: {
      "Defense": 4,
    },
    rarity: "common",
  },
  leather_boots: {
    id: "leather_boots",
    name: "Leather Boots",
    image: "/placeholder.svg?height=64&width=64",
    description: "Comfortable footwear",
    type: "armor",
    subType: "leather",
    equippable: true,
    slot: "feet",
    stats: {
      "Defense": 2,
      "Movement Speed": 2,
    },
    rarity: "common",
  },
  iron_gauntlets: {
    id: "iron_gauntlets",
    name: "Iron Gauntlets",
    image: "/placeholder.svg?height=64&width=64",
    description: "Protective hand armor",
    type: "armor",
    subType: "metal",
    equippable: true,
    slot: "hands",
    stats: {
      "Defense": 3,
      "Strength": 1,
    },
    rarity: "common",
  },
  silver_ring: {
    id: "silver_ring",
    name: "Silver Ring",
    image: "/placeholder.svg?height=64&width=64",
    description: "A simple silver ring",
    type: "accessory",
    subType: "jewelry",
    equippable: true,
    slot: "rings",
    stats: {
      "Magic Defense": 2,
    },
    rarity: "common",
  },
  cursed_energy_ring: {
    id: "cursed_energy_ring",
    name: "Cursed Energy Ring",
    image: "/placeholder.svg?height=64&width=64",
    description: "A dark ring that allows the wearer to harness curse energy",
    type: "accessory",
    subType: "jewelry",
    equippable: true,
    slot: "rings",
    rarity: "rare",
    stats: {
      "Magic Power": 5,
      "Health": -10,
    },
    specialAbility: "Allows the use of curse energy in crafting"
  },
  iron_sword: {
    id: "iron_sword",
    name: "Iron Sword",
    image: "/placeholder.svg?height=64&width=64",
    description: "Standard iron sword",
    type: "weapon",
    subType: "sword",
    equippable: true,
    slot: "weapon",
    stats: {
      "Damage": 8,
      "Attack Speed": 1.2,
    },
    rarity: "common",
  },
  wooden_shield: {
    id: "wooden_shield",
    name: "Wooden Shield",
    image: "/placeholder.svg?height=64&width=64",
    description: "Basic defensive shield",
    type: "armor",
    subType: "shield",
    equippable: true,
    slot: "offhand",
    rarity: "common",
    stats: {
      "Block Chance": 15,
      "Defense": 3,
    }
  },
  poisoned_dagger: {
    id: "poisoned_dagger",
    name: "Poisoned Dagger",
    image: "/placeholder.svg?height=64&width=64",
    description: "A dagger coated with deadly poison",
    type: "weapon",
    subType: "dagger",
    equippable: true,
    slot: "weapon",
    rarity: "rare",
    stats: {
      "Damage": 6,
      "Attack Speed": 1.5,
      "Poison Damage": 3
    },
    specialAbility: "Has a chance to apply poison on hit"
  },
  bleeding_axe: {
    id: "bleeding_axe",
    name: "Bleeding Axe",
    image: "/placeholder.svg?height=64&width=64",
    description: "A cruel axe that causes wounds that won't stop bleeding",
    type: "weapon",
    subType: "axe",
    equippable: true,
    slot: "weapon",
    rarity: "epic",
    stats: {
      "Damage": 12,
      "Attack Speed": 0.8,
      "Bleed Chance": 25
    },
    specialAbility: "Has a chance to cause bleeding on hit"
  },
  weakness_staff: {
    id: "weakness_staff",
    name: "Staff of Weakness",
    image: "/placeholder.svg?height=64&width=64",
    description: "A magical staff that saps the strength of enemies",
    type: "weapon",
    subType: "staff",
    equippable: true,
    slot: "weapon",
    rarity: "rare",
    stats: {
      "Magic Damage": 10,
      "Magic Power": 8,
      "Weakness Effect": 20
    },
    specialAbility: "Has a chance to apply weakness on hit"
  },
  burning_gauntlets: {
    id: "burning_gauntlets",
    name: "Burning Gauntlets",
    image: "/placeholder.svg?height=64&width=64",
    description: "Gauntlets imbued with fire magic",
    type: "armor",
    subType: "gauntlets",
    equippable: true,
    slot: "hands",
    rarity: "epic",
    stats: {
      "Defense": 5,
      "Magic Power": 7,
      "Fire Damage": 4
    },
    specialAbility: "Has a chance to apply burn on hit"
  },
  stunning_mace: {
    id: "stunning_mace",
    name: "Stunning Mace",
    image: "/placeholder.svg?height=64&width=64",
    description: "A heavy mace that can stun opponents",
    type: "weapon",
    subType: "mace",
    equippable: true,
    slot: "weapon",
    rarity: "uncommon",
    stats: {
      "Damage": 9,
      "Attack Speed": 0.7,
      "Stun Chance": 15
    },
    specialAbility: "Has a chance to stun enemies on hit"
  },
  // Add missing items for dual currency testing
  magic_crystal: {
    id: "magic_crystal",
    name: "Magic Crystal",
    image: "/placeholder.svg?height=64&width=64",
    description: "A rare crystal infused with magical energy",
    type: "ingredient",
    subType: "magical",
    rarity: "rare",
    value: 100
  },
  ancient_artifact: {
    id: "ancient_artifact",
    name: "Ancient Artifact",
    image: "/placeholder.svg?height=64&width=64",
    description: "A mysterious artifact from a forgotten civilization",
    type: "ingredient",
    subType: "magical",
    rarity: "epic",
    value: 200
  },
  dragon_heart: {
    id: "dragon_heart",
    name: "Dragon Heart",
    image: "/placeholder.svg?height=64&width=64",
    description: "The still-beating heart of a dragon, pulsing with power",
    type: "ingredient",
    subType: "magical",
    rarity: "legendary",
    value: 500
  }
}; 

/**
 * Generate a unique hash for an item based on its attributes and crafting pattern
 */
export function generateItemHash(item: Item, craftingPattern?: string): string {
  // Create an object with all the attributes that make an item unique
  const uniqueAttributes = {
    id: item.id,
    name: item.name,
    stats: item.stats || {},
    rarity: item.rarity,
    type: item.type,
    craftingPattern: craftingPattern || 'none'
  };

  // Convert to string and create a simple hash
  const attributeString = JSON.stringify(uniqueAttributes);
  
  // Simple string hash function for browsers
  let hash = 0;
  for (let i = 0; i < attributeString.length; i++) {
    const char = attributeString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
} 