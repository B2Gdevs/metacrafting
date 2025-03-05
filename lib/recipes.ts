import { Recipe } from "@/components/recipe-book";

// Define item effects that can be applied based on crafting controls
export type CraftingEffect = {
  name: string;
  description: string;
  statBonus?: Record<string, number>;
  durabilityMod?: number;
  elementalEffect?: string;
  specialAbility?: string;
};

// Define crafting control types
export type CraftingControlType = "magic" | "stability" | "curse";

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
        { name: "Arcane Touch", description: "Adds minor magical damage", statBonus: { "Magic Damage": 2 } },
        { name: "Elemental Binding", description: "Imbues the weapon with elemental energy", elementalEffect: "random" },
        { name: "Soul Link", description: "Creates a bond between the wielder and the weapon", specialAbility: "Increases damage as wielder loses health" }
      ],
      armor: [
        { name: "Magical Barrier", description: "Creates a magical shield", statBonus: { "Magic Defense": 3 } },
        { name: "Elemental Resistance", description: "Provides resistance to elemental damage", statBonus: { "Elemental Resistance": 5 } },
        { name: "Arcane Recovery", description: "Slowly regenerates magic points", statBonus: { "MP Regeneration": 1 } }
      ],
      potions: [
        { name: "Extended Duration", description: "Effects last longer", statBonus: { "Duration": 30 } },
        { name: "Potency", description: "Increases the potion's effect", statBonus: { "Effect Strength": 25 } },
        { name: "Purity", description: "Removes negative side effects", specialAbility: "No side effects" }
      ],
      spellcraft: [
        { name: "Focused Energy", description: "Increases spell damage", statBonus: { "Spell Damage": 15 } },
        { name: "Mana Efficiency", description: "Reduces mana cost", statBonus: { "Mana Cost": -10 } },
        { name: "Spell Mastery", description: "Improves spell control", specialAbility: "Increased area of effect" }
      ]
    }
  },
  stability: {
    name: "Magic Stability",
    description: "Controls how stable the magical energies are during crafting",
    levels: ["Chaotic", "Unstable", "Balanced", "Stable", "Perfect"],
    effects: {
      weapons: [
        { name: "Consistent Power", description: "Reliable magical output", statBonus: { "Damage Consistency": 10 } },
        { name: "Energy Containment", description: "Better magical energy control", specialAbility: "Reduced magic consumption" },
        { name: "Harmonic Resonance", description: "Weapon resonates with wielder", statBonus: { "Attunement": 5 } }
      ],
      armor: [
        { name: "Energy Dispersion", description: "Spreads impact across the armor", statBonus: { "Damage Reduction": 3 } },
        { name: "Magical Dampening", description: "Reduces magical feedback", statBonus: { "Spell Damage Reduction": 5 } },
        { name: "Stable Protection", description: "Consistent defensive properties", durabilityMod: 0.3 }
      ],
      potions: [
        { name: "Stabilized Formula", description: "Consistent effect strength", statBonus: { "Reliability": 25 } },
        { name: "Balanced Reaction", description: "Even distribution of effects", specialAbility: "Effects all body systems equally" },
        { name: "Controlled Release", description: "Gradual effect application", statBonus: { "Duration": 20 } }
      ],
      spellcraft: [
        { name: "Contained Power", description: "Prevents magical leakage", statBonus: { "Mana Efficiency": 10 } },
        { name: "Stable Matrix", description: "Maintains spell structure", statBonus: { "Spell Duration": 15 } },
        { name: "Harmonic Balance", description: "Balances opposing magical forces", specialAbility: "Can combine opposing elements" }
      ]
    }
  },
  curse: {
    name: "Curse Energy",
    description: "Infuses dark energies that can be harnessed with a Cursed Energy Ring",
    levels: ["None", "Whisper", "Murmur", "Voice", "Scream"],
    effects: {
      weapons: [
        { name: "Soul Drain", description: "Drains life from enemies", statBonus: { "Life Steal": 3 } },
        { name: "Void Touch", description: "Corrupts the target with void energy", elementalEffect: "void" },
        { name: "Blood Pact", description: "Weapon grows stronger as you take damage", specialAbility: "Damage increases as health decreases" }
      ],
      armor: [
        { name: "Pain Reflection", description: "Returns a portion of damage to attackers", statBonus: { "Damage Reflection": 5 } },
        { name: "Shadow Form", description: "Occasionally turns user incorporeal", specialAbility: "15% chance to avoid damage" },
        { name: "Sacrificial Ward", description: "Converts health to a powerful shield", statBonus: { "Shield Strength": 20 } }
      ],
      potions: [
        { name: "Corrupted Brew", description: "Powerful but with side effects", statBonus: { "Effect Strength": 40, "Health Cost": 10 } },
        { name: "Blood Magic", description: "Uses life force to enhance effects", specialAbility: "Effects scale with missing health" },
        { name: "Forbidden Knowledge", description: "Grants temporary insight at a cost", statBonus: { "Wisdom": 15, "Sanity": -10 } }
      ],
      spellcraft: [
        { name: "Forbidden Power", description: "Taps into dangerous energies", statBonus: { "Spell Power": 30, "Control": -15 } },
        { name: "Soul Binding", description: "Binds part of your soul to the spell", specialAbility: "Spell persists after death" },
        { name: "Eldritch Whispers", description: "Spell carries maddening whispers", statBonus: { "Fear Effect": 25 } }
      ]
    }
  }
};

// Enhanced recipes with categories, difficulty, and required stats
export const recipes: Recipe[] = [
  {
    id: "axe",
    inputs: ["wood", "wood", "stone"],
    output: "axe",
    description: "Combine wood and stone to create a basic axe",
    category: "items",
    difficulty: 1,
    requiredStats: {
      metalworking: 1,
    },
    experienceGain: {
      metalworking: 10,
    },
  },
  {
    id: "pickaxe",
    inputs: ["wood", "wood", "stone", "stone"],
    output: "pickaxe",
    description: "Combine wood and stone to create a mining pickaxe",
    category: "items",
    difficulty: 1,
    requiredStats: {
      metalworking: 1,
    },
    experienceGain: {
      metalworking: 15,
    },
  },
  {
    id: "sword",
    inputs: ["wood", "iron", "iron"],
    output: "sword",
    description: "Forge iron into a deadly blade",
    category: "weapons",
    difficulty: 3,
    requiredStats: {
      metalworking: 3,
    },
    temperature: 800, // Will be replaced with crafting controls
    experienceGain: {
      metalworking: 30,
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
  },
  {
    id: "healing_salve",
    inputs: ["herb", "herb", "herb", "crystal"],
    output: "healing_salve",
    description: "Mix herbs with a crystal to create a healing salve",
    category: "potions",
    difficulty: 3,
    requiredStats: {
      spellcraft: 3,
    },
    experienceGain: {
      spellcraft: 25,
    },
  },
  {
    id: "enchanted_sword",
    inputs: ["sword", "crystal", "crystal"],
    output: "enchanted_sword",
    description: "Imbue a sword with magical crystals to enhance its power",
    category: "weapons",
    difficulty: 4,
    requiredStats: {
      metalworking: 3,
      magicworking: 3,
    },
    temperature: 500, // Will be replaced with crafting controls
    magicCost: 10,
    experienceGain: {
      metalworking: 20,
      magicworking: 40,
    },
  },
  {
    id: "enchanted_leather",
    inputs: ["leather", "crystal", "herb"],
    output: "enchanted_leather",
    description: "Infuse leather with magical properties using crystals and herbs",
    category: "items",
    difficulty: 3,
    requiredStats: {
      magicworking: 2,
      spellcraft: 1,
    },
    temperature: 50, // Will be replaced with crafting controls
    experienceGain: {
      magicworking: 25,
      spellcraft: 10,
    },
  },
  {
    id: "silver_amulet",
    inputs: ["silver", "crystal", "crystal"],
    output: "silver_amulet",
    description: "Craft a silver amulet that enhances magical abilities",
    category: "items",
    difficulty: 4,
    requiredStats: {
      metalworking: 3,
      magicworking: 3,
    },
    temperature: 600, // Will be replaced with crafting controls
    experienceGain: {
      metalworking: 20,
      magicworking: 30,
    },
  },
  {
    id: "fireball_scroll",
    inputs: ["crystal", "herb", "ancient_rune"],
    output: "fireball_scroll",
    description: "Inscribe a powerful fire spell onto a magical scroll",
    category: "spellcraft",
    difficulty: 4,
    requiredStats: {
      spellcraft: 4,
    },
    magicCost: 15,
    experienceGain: {
      spellcraft: 35,
    },
  },
  {
    id: "frost_rune",
    inputs: ["crystal", "silver", "ancient_rune"],
    output: "frost_rune",
    description: "Imbue a rune with frost magic",
    category: "spellcraft",
    difficulty: 3,
    requiredStats: {
      spellcraft: 3,
      magicworking: 2,
    },
    temperature: 0, // Will be replaced with crafting controls
    magicCost: 12,
    experienceGain: {
      spellcraft: 30,
      magicworking: 15,
    },
  },
  {
    id: "runic_staff",
    inputs: ["staff", "ancient_rune", "crystal", "crystal"],
    output: "runic_staff",
    description: "Enhance a staff with an ancient rune and crystals",
    category: "weapons",
    difficulty: 6,
    requiredStats: {
      magicworking: 5,
      spellcraft: 4,
    },
    temperature: 300, // Will be replaced with crafting controls
    magicCost: 20,
    experienceGain: {
      magicworking: 50,
      spellcraft: 40,
    },
    isSecret: true,
  },
  {
    id: "dragon_armor",
    inputs: ["dragon_scale", "dragon_scale", "dragon_scale", "enchanted_leather", "steel"],
    output: "dragon_armor",
    description: "Forge legendary armor from dragon scales and enchanted materials",
    category: "armor",
    difficulty: 8,
    requiredStats: {
      metalworking: 6,
      magicworking: 5,
    },
    temperature: 1200, // Will be replaced with crafting controls
    magicCost: 30,
    experienceGain: {
      metalworking: 70,
      magicworking: 60,
    },
    isSecret: true,
  },
  {
    id: "lightning_gem",
    inputs: ["crystal", "crystal", "ancient_rune", "silver"],
    output: "lightning_gem",
    description: "Create a gem that can channel lightning magic",
    category: "spellcraft",
    difficulty: 5,
    requiredStats: {
      spellcraft: 4,
      magicworking: 3,
    },
    temperature: 400, // Will be replaced with crafting controls
    magicCost: 20,
    experienceGain: {
      spellcraft: 45,
      magicworking: 25,
    },
    isSecret: true,
  },
]; 