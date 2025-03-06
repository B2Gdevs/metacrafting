import { Recipe } from "@/components/recipe-book";

// Define item effects that can be applied based on crafting controls
export type CraftingEffect = {
  name: string;
  description: string;
  statBonus?: Record<string, number>;
  durabilityMod?: number;
  elementalEffect?: string;
  specialAbility?: string;
  curseEffect?: string;
  requiresMagic?: boolean;
};

// Define crafting control types
export type CraftingControlType = "magic" | "stability" | "curse";

// Define stability levels
export type StabilityLevel = "chaotic" | "unstable" | "balanced" | "stable" | "perfect";

// Define crafting controls that replace temperature
export const craftingControls: Record<CraftingControlType, {
  name: string;
  description: string;
  levels: string[];
  magicCost?: number;
  effects: Record<string, CraftingEffect[]>;
}> = {
  magic: {
    name: "Magic Power",
    description: "Controls the amount of magical energy infused into the item",
    levels: ["None", "Mild", "Moderate", "Strong", "Intense"],
    magicCost: 10, // Base magic cost that scales with level
    effects: {
      weapons: [
        { name: "Arcane Touch", description: "Adds minor magical damage", statBonus: { "Magic Damage": 2 }, requiresMagic: true },
        { name: "Elemental Binding", description: "Imbues the weapon with elemental energy", elementalEffect: "random", requiresMagic: true },
        { name: "Soul Link", description: "Creates a bond between the wielder and the weapon", specialAbility: "Increases damage as wielder loses health", requiresMagic: true }
      ],
      armor: [
        { name: "Magical Barrier", description: "Creates a magical shield", statBonus: { "Magic Defense": 3 }, requiresMagic: true },
        { name: "Elemental Resistance", description: "Provides resistance to elemental damage", statBonus: { "Elemental Resistance": 5 }, requiresMagic: true },
        { name: "Arcane Recovery", description: "Slowly regenerates magic points", statBonus: { "MP Regeneration": 1 }, requiresMagic: true }
      ],
      potions: [
        { name: "Extended Duration", description: "Effects last longer", statBonus: { "Duration": 30 }, requiresMagic: true },
        { name: "Potency", description: "Increases the potion's effect", statBonus: { "Effect Strength": 25 }, requiresMagic: true },
        { name: "Purity", description: "Removes negative side effects", specialAbility: "No side effects", requiresMagic: true }
      ],
      spellcraft: [
        { name: "Focused Energy", description: "Increases spell damage", statBonus: { "Spell Damage": 15 }, requiresMagic: true },
        { name: "Mana Efficiency", description: "Reduces mana cost", statBonus: { "Mana Cost": -10 }, requiresMagic: true },
        { name: "Spell Mastery", description: "Improves spell control", specialAbility: "Increased area of effect", requiresMagic: true }
      ],
      // Effects that can be applied to any item type
      any: [
        { name: "Magical Aura", description: "Item emits a soft magical glow", requiresMagic: true },
        { name: "Enchanted", description: "Item feels warm to the touch", requiresMagic: true },
        { name: "Arcane Inscription", description: "Magical runes appear on the item", requiresMagic: true }
      ]
    }
  },
  stability: {
    name: "Magic Stability",
    description: "Controls how stable the magical energies are during crafting",
    levels: ["Chaotic", "Unstable", "Balanced", "Stable", "Perfect"],
    effects: {
      weapons: [
        { name: "Chaotic Edge", description: "Weapon damage is unpredictable", statBonus: { "Damage Variance": 50 } },
        { name: "Balanced Strike", description: "Weapon has consistent damage", statBonus: { "Critical Chance": 5 } },
        { name: "Perfect Balance", description: "Weapon feels like an extension of your body", statBonus: { "Attack Speed": 10 } }
      ],
      armor: [
        { name: "Shifting Protection", description: "Armor protection varies unpredictably", statBonus: { "Defense Variance": 30 } },
        { name: "Balanced Protection", description: "Armor provides consistent protection", statBonus: { "Defense": 5 } },
        { name: "Perfect Fit", description: "Armor moves with you perfectly", statBonus: { "Movement Speed": 5 } }
      ],
      potions: [
        { name: "Volatile Mixture", description: "Potion effects are unpredictable", specialAbility: "Random additional effect" },
        { name: "Balanced Brew", description: "Potion effects are consistent", statBonus: { "Effect Duration": 20 } },
        { name: "Perfect Mixture", description: "Potion effects are maximized", statBonus: { "Effect Strength": 30 } }
      ],
      spellcraft: [
        { name: "Wild Magic", description: "Spell effects are unpredictable", specialAbility: "Random additional effect" },
        { name: "Controlled Casting", description: "Spells are more precise", statBonus: { "Spell Accuracy": 15 } },
        { name: "Perfect Harmony", description: "Spells are in perfect harmony with the caster", statBonus: { "Spell Critical Chance": 10 } }
      ],
      // Effects that can be applied to any item type
      any: [
        { name: "Chaotic Energy", description: "Item occasionally sparks with wild energy" },
        { name: "Balanced Aura", description: "Item has a consistent magical aura" },
        { name: "Perfect Resonance", description: "Item resonates perfectly with its owner" }
      ]
    }
  },
  curse: {
    name: "Curse Energy",
    description: "Infuses dark energies that can provide powerful but dangerous effects",
    levels: ["None", "Minor", "Moderate", "Major", "Overwhelming"],
    magicCost: 5, // Base magic cost that scales with level
    effects: {
      weapons: [
        { name: "Life Drain", description: "Weapon drains life from enemies", specialAbility: "Lifesteal", curseEffect: "Drains user's health when not in combat" },
        { name: "Soul Eater", description: "Weapon consumes souls of defeated enemies", statBonus: { "Damage": 15 }, curseEffect: "Reduces maximum health" },
        { name: "Blood Pact", description: "Weapon becomes more powerful as user loses health", specialAbility: "Damage increases with missing health", curseEffect: "Cannot be healed above 50% health" }
      ],
      armor: [
        { name: "Shadow Form", description: "Armor allows partial phasing through attacks", statBonus: { "Dodge Chance": 10 }, curseEffect: "Takes damage from healing" },
        { name: "Pain Reflection", description: "Armor reflects damage back to attackers", specialAbility: "Damage reflection", curseEffect: "User takes a portion of reflected damage" },
        { name: "Void Shield", description: "Armor absorbs incoming damage", statBonus: { "Damage Reduction": 20 }, curseEffect: "Absorbs healing as well" }
      ],
      potions: [
        { name: "Corrupted Brew", description: "Potion effects are amplified but corrupted", statBonus: { "Effect Strength": 50 }, curseEffect: "Causes damage over time" },
        { name: "Tainted Elixir", description: "Potion provides powerful benefits with a cost", specialAbility: "Double effect duration", curseEffect: "Reduces maximum health temporarily" },
        { name: "Forbidden Concoction", description: "Potion grants forbidden power", specialAbility: "Grants temporary invulnerability", curseEffect: "User takes double damage after effect ends" }
      ],
      spellcraft: [
        { name: "Forbidden Knowledge", description: "Spell draws on forbidden knowledge", statBonus: { "Spell Damage": 30 }, curseEffect: "Damages caster on use" },
        { name: "Soul Binding", description: "Spell binds with the caster's soul", specialAbility: "No mana cost", curseEffect: "Uses health instead of mana" },
        { name: "Dark Pact", description: "Spell is empowered by a dark pact", statBonus: { "Spell Area": 50 }, curseEffect: "Reduces maximum mana permanently" }
      ],
      // Effects that can be applied to any item type
      any: [
        { name: "Whispers", description: "Item whispers dark thoughts to its owner", curseEffect: "Occasionally causes confusion" },
        { name: "Blood Price", description: "Item requires blood to function", curseEffect: "Drains health on use" },
        { name: "Soul Binding", description: "Item binds to the soul of its owner", curseEffect: "Cannot be unequipped without a ritual" }
      ]
    }
  }
};

// Export recipes
export const recipes: Recipe[] = [
  // Basic crafting recipes (no magic cost for non-magical items)
  {
    id: "wooden_axe",
    inputs: ["wood", "wood", "stone"],
    output: "axe",
    description: "Craft a simple axe for chopping wood",
    category: "weapons",
    difficulty: 1,
    requiredStats: {
      metalworking: 1,
    },
    experienceGain: {
      metalworking: 15,
    },
  },
  {
    id: "staff",
    inputs: ["wood", "wood", "crystal"],
    output: "staff",
    description: "Craft a staff to channel magical energies",
    category: "weapons",
    difficulty: 2,
    requiredStats: {
      metalworking: 2,
      magicworking: 1,
    },
    experienceGain: {
      magicworking: 20,
    },
    magicCost: 10, // Requires magic points because it's a magical item
  },
  {
    id: "helmet",
    inputs: ["leather", "leather", "iron"],
    output: "helmet",
    description: "Craft a protective helmet from leather and metal",
    category: "armor",
    difficulty: 2,
    requiredStats: {
      metalworking: 2,
    },
    experienceGain: {
      metalworking: 25,
    },
  },
  {
    id: "potion",
    inputs: ["herb", "herb", "stone"],
    output: "potion",
    description: "Mix herbs with a stone mortar to create a healing potion",
    category: "potions",
    difficulty: 1,
    requiredStats: {
      spellcraft: 1,
    },
    experienceGain: {
      spellcraft: 15,
    },
  },
  {
    id: "mana_potion",
    inputs: ["herb", "crystal", "stone"],
    output: "mana_potion",
    description: "Combine magical ingredients to restore magical energy",
    category: "potions",
    difficulty: 2,
    requiredStats: {
      spellcraft: 2,
    },
    experienceGain: {
      spellcraft: 20,
    },
    magicCost: 5, // Requires magic points because it's a magical potion
  },
  
  // Add more standard recipes here...
  
  // Secret Recipes (can be discovered by accident)
  {
    id: "phoenix_feather",
    inputs: ["fire_essence", "herb", "crystal"],
    output: "phoenix_feather",
    description: "A magical feather that can resurrect its owner once",
    category: "spellcraft",
    difficulty: 5,
    requiredStats: {
      spellcraft: 4,
      magicworking: 3,
    },
    experienceGain: {
      spellcraft: 50,
      magicworking: 30,
    },
    magicCost: 25,
    isSecret: true,
    patternType: "triangle", // Requires a specific pattern to discover
  },
  {
    id: "void_crystal",
    inputs: ["crystal", "crystal", "cursed_energy"],
    output: "void_crystal",
    description: "A crystal infused with void energy that can absorb magical attacks",
    category: "spellcraft",
    difficulty: 6,
    requiredStats: {
      spellcraft: 5,
      magicworking: 4,
    },
    experienceGain: {
      spellcraft: 60,
      magicworking: 40,
    },
    magicCost: 30,
    isSecret: true,
    patternType: "cross", // Requires a specific pattern to discover
  },
  {
    id: "shadow_blade",
    inputs: ["iron", "cursed_energy", "void_essence"],
    output: "shadow_blade",
    description: "A blade that phases through armor but drains the wielder's life force",
    category: "weapons",
    difficulty: 7,
    requiredStats: {
      metalworking: 5,
      magicworking: 4,
    },
    experienceGain: {
      metalworking: 50,
      magicworking: 60,
    },
    magicCost: 35,
    isSecret: true,
    patternType: "diagonal", // Requires a specific pattern to discover
  },
  {
    id: "ethereal_armor",
    inputs: ["iron", "crystal", "void_essence", "light_essence"],
    output: "ethereal_armor",
    description: "Armor that exists partially in another dimension, providing incredible protection",
    category: "armor",
    difficulty: 8,
    requiredStats: {
      metalworking: 6,
      magicworking: 6,
    },
    experienceGain: {
      metalworking: 70,
      magicworking: 70,
    },
    magicCost: 40,
    isSecret: true,
    patternType: "square", // Requires a specific pattern to discover
  },
  {
    id: "elixir_of_immortality",
    inputs: ["phoenix_feather", "herb", "crystal", "light_essence"],
    output: "elixir_of_immortality",
    description: "A legendary potion that grants temporary immortality",
    category: "potions",
    difficulty: 9,
    requiredStats: {
      spellcraft: 8,
    },
    experienceGain: {
      spellcraft: 100,
    },
    magicCost: 50,
    isSecret: true,
    patternType: "circle", // Requires a specific pattern to discover
  },
  {
    id: "cursed_energy_ring",
    inputs: ["iron", "cursed_energy", "void_essence"],
    output: "cursed_energy_ring",
    description: "A ring that allows the wearer to harness cursed energy for crafting",
    category: "spellcraft",
    difficulty: 6,
    requiredStats: {
      magicworking: 5,
      spellcraft: 4,
    },
    experienceGain: {
      magicworking: 50,
      spellcraft: 40,
    },
    magicCost: 30,
    isSecret: true,
    patternType: "linear", // Requires a specific pattern to discover
  },
]; 