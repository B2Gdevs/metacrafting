import { CharacterStats } from "@/components/character-sheet";
import { Item, ItemRarity } from "@/components/item-slot";
import { EquipmentSlot } from "./items";

// Define special skill types
export type SpecialSkillType = 
  | "damage" 
  | "heal" 
  | "buff" 
  | "debuff" 
  | "aoe" 
  | "dot" 
  | "shield" 
  | "lifesteal" 
  | "manaburn" 
  | "stun" 
  | "reflect";

// Define special skill target types
export type TargetType = "self" | "enemy" | "all_enemies" | "all_allies" | "all";

// Define element types for attacks
export type ElementType = "physical" | "fire" | "ice" | "lightning" | "earth" | "arcane" | "void" | "holy";

// Define special skill structure
export interface SpecialSkill {
  id: string;
  name: string;
  description: string;
  type: SpecialSkillType;
  element?: ElementType;
  target: TargetType;
  basePower: number;
  manaCost: number;
  cooldown: number;
  requiredRarity: ItemRarity;
  requiredStats?: {
    strength?: number;
    speed?: number;
    magicworking?: number;
    spellcraft?: number;
  };
  effects?: {
    duration?: number;
    chance?: number;
    statModifiers?: Record<string, number>;
  };
}

// Define combat stats structure
export interface CombatStats {
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
  critChance: number;
  critDamage: number;
  elementalResistances: Record<ElementType, number>;
  specialSkills: SpecialSkill[];
}

// Define combat entity structure
export interface CombatEntity {
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  magicPoints: number;
  maxMagicPoints: number;
  stats: CombatStats;
  statusEffects: StatusEffect[];
}

// Define status effect structure
export interface StatusEffect {
  name: string;
  description: string;
  duration: number;
  type: "buff" | "debuff";
  statModifiers: Record<string, number>;
  tickEffect?: () => void;
}

// Define combat action structure
export interface CombatAction {
  name: string;
  type: "attack" | "special" | "item" | "flee";
  target: number;
  skill?: SpecialSkill;
  item?: Item;
}

// Define combat result structure
export interface CombatResult {
  damage?: number;
  healing?: number;
  statusEffects?: StatusEffect[];
  isCritical?: boolean;
  message: string;
}

// Define pattern bonus types for crafting grid layouts
export type PatternBonusType = "linear" | "diagonal" | "square" | "cross" | "triangle" | "circle";

// Define pattern bonus effects
export interface PatternBonus {
  type: PatternBonusType;
  itemType: string;
  statBonus: Record<string, number>;
  rarityBoost: number;
  description: string;
}

/**
 * Calculate the total combat stats for a character based on their base stats and equipment
 */
export function calculateCombatStats(
  character: CharacterStats,
  equippedItems: Record<string, Item>
): CombatStats {
  // Initialize base combat stats
  const combatStats: CombatStats = {
    attack: character.strength * 2,
    defense: character.strength,
    magicAttack: character.craftingStats.spellcraft * 3,
    magicDefense: character.craftingStats.magicworking * 2,
    speed: character.speed * 2,
    critChance: 5, // Base 5% crit chance
    critDamage: 150, // Base 150% crit damage
    elementalResistances: {
      physical: 0,
      fire: 0,
      ice: 0,
      lightning: 0,
      earth: 0,
      arcane: 0,
      void: 0,
      holy: 0
    },
    specialSkills: []
  };

  // Add stats from equipped items
  Object.values(equippedItems).forEach(item => {
    if (!item) return;

    // Add basic stats
    if (item.stats) {
      if (item.stats.Attack) combatStats.attack += item.stats.Attack;
      if (item.stats.Defense) combatStats.defense += item.stats.Defense;
      if (item.stats["Magic Power"]) combatStats.magicAttack += item.stats["Magic Power"];
      if (item.stats["Magic Defense"]) combatStats.magicDefense += item.stats["Magic Defense"];
      if (item.stats.Speed) combatStats.speed += item.stats.Speed;
      if (item.stats["Crit Chance"]) combatStats.critChance += item.stats["Crit Chance"];
      if (item.stats["Crit Damage"]) combatStats.critDamage += item.stats["Crit Damage"];
      
      // Add elemental resistances
      if (item.stats["Fire Resistance"]) combatStats.elementalResistances.fire += item.stats["Fire Resistance"];
      if (item.stats["Ice Resistance"]) combatStats.elementalResistances.ice += item.stats["Ice Resistance"];
      if (item.stats["Lightning Resistance"]) combatStats.elementalResistances.lightning += item.stats["Lightning Resistance"];
      if (item.stats["Earth Resistance"]) combatStats.elementalResistances.earth += item.stats["Earth Resistance"];
      if (item.stats["Arcane Resistance"]) combatStats.elementalResistances.arcane += item.stats["Arcane Resistance"];
      if (item.stats["Void Resistance"]) combatStats.elementalResistances.void += item.stats["Void Resistance"];
      if (item.stats["Holy Resistance"]) combatStats.elementalResistances.holy += item.stats["Holy Resistance"];
    }

    // Add special skills from items
    if (item.specialAbility && specialSkillsRegistry[item.specialAbility]) {
      combatStats.specialSkills.push(specialSkillsRegistry[item.specialAbility]);
    }
  });

  return combatStats;
}

/**
 * Calculate damage for a basic attack
 */
export function calculateBasicAttackDamage(
  attacker: CombatEntity,
  defender: CombatEntity,
  element: ElementType = "physical"
): CombatResult {
  // Base damage calculation
  let damage = attacker.stats.attack;
  
  // Check for critical hit
  const isCritical = Math.random() * 100 < attacker.stats.critChance;
  if (isCritical) {
    damage = damage * (attacker.stats.critDamage / 100);
  }
  
  // Apply defense reduction
  const defenseReduction = defender.stats.defense / (defender.stats.defense + 50);
  damage = damage * (1 - defenseReduction);
  
  // Apply elemental resistance
  const resistance = defender.stats.elementalResistances[element] || 0;
  damage = damage * (1 - (resistance / 100));
  
  // Ensure minimum damage
  damage = Math.max(1, Math.floor(damage));
  
  return {
    damage,
    isCritical,
    message: `${attacker.name} attacks ${defender.name} for ${damage} ${element} damage${isCritical ? " (Critical Hit!)" : ""}!`
  };
}

/**
 * Calculate damage for a special skill
 */
export function calculateSpecialSkillDamage(
  attacker: CombatEntity,
  defender: CombatEntity,
  skill: SpecialSkill
): CombatResult {
  // Base damage calculation based on skill type
  let damage = 0;
  let healing = 0;
  let statusEffects: StatusEffect[] = [];
  
  switch (skill.type) {
    case "damage":
      // Damage based on magic attack for magical elements, physical attack for physical
      if (skill.element && ["fire", "ice", "lightning", "arcane", "void", "holy"].includes(skill.element)) {
        damage = attacker.stats.magicAttack * (skill.basePower / 100);
      } else {
        damage = attacker.stats.attack * (skill.basePower / 100);
      }
      break;
      
    case "heal":
      healing = attacker.stats.magicAttack * (skill.basePower / 100);
      break;
      
    case "buff":
    case "debuff":
      if (skill.effects && skill.effects.statModifiers) {
        const duration = skill.effects.duration || 3;
        statusEffects.push({
          name: skill.name,
          description: skill.description,
          duration,
          type: skill.type === "buff" ? "buff" : "debuff",
          statModifiers: skill.effects.statModifiers
        });
      }
      break;
      
    case "dot":
      damage = attacker.stats.magicAttack * (skill.basePower / 100) / 3; // Initial damage
      if (skill.effects && skill.effects.duration) {
        statusEffects.push({
          name: `${skill.name} (DoT)`,
          description: `Taking damage over time from ${skill.name}`,
          duration: skill.effects.duration,
          type: "debuff",
          statModifiers: {},
          tickEffect: () => {
            return attacker.stats.magicAttack * (skill.basePower / 100) / 3;
          }
        });
      }
      break;
      
    case "shield":
      if (skill.effects && skill.effects.statModifiers) {
        statusEffects.push({
          name: `${skill.name} Shield`,
          description: `Protected by ${skill.name}`,
          duration: skill.effects.duration || 3,
          type: "buff",
          statModifiers: skill.effects.statModifiers
        });
      }
      break;
      
    case "lifesteal":
      damage = attacker.stats.attack * (skill.basePower / 100);
      healing = damage * 0.5; // Heal for 50% of damage dealt
      break;
  }
  
  // Apply critical hit chance for damage skills
  let isCritical = false;
  if (damage > 0) {
    isCritical = Math.random() * 100 < attacker.stats.critChance;
    if (isCritical) {
      damage = damage * (attacker.stats.critDamage / 100);
    }
    
    // Apply defense or magic defense
    if (skill.element && ["fire", "ice", "lightning", "arcane", "void", "holy"].includes(skill.element)) {
      const defenseReduction = defender.stats.magicDefense / (defender.stats.magicDefense + 50);
      damage = damage * (1 - defenseReduction);
    } else {
      const defenseReduction = defender.stats.defense / (defender.stats.defense + 50);
      damage = damage * (1 - defenseReduction);
    }
    
    // Apply elemental resistance if applicable
    if (skill.element) {
      const resistance = defender.stats.elementalResistances[skill.element] || 0;
      damage = damage * (1 - (resistance / 100));
    }
    
    // Ensure minimum damage
    damage = Math.max(1, Math.floor(damage));
  }
  
  // Generate result message
  let message = "";
  if (damage > 0) {
    message = `${attacker.name} uses ${skill.name} on ${defender.name} for ${damage} damage${isCritical ? " (Critical Hit!)" : ""}!`;
  } else if (healing > 0) {
    message = `${attacker.name} uses ${skill.name} and heals for ${healing} health!`;
  } else if (statusEffects.length > 0) {
    message = `${attacker.name} uses ${skill.name}!`;
  }
  
  return {
    damage,
    healing,
    statusEffects,
    isCritical,
    message
  };
}

/**
 * Check if a crafting grid pattern matches a specific pattern type
 */
export function checkGridPattern(
  grid: (string | null)[],
  patternType: PatternBonusType
): boolean {
  // Check if the grid has items (non-null values)
  const hasItems = grid.some(item => item !== null);
  if (!hasItems) return false;
  
  switch (patternType) {
    case "linear":
      // Check horizontal lines
      for (let row = 0; row < 3; row++) {
        const rowItems = [grid[row * 3], grid[row * 3 + 1], grid[row * 3 + 2]];
        if (rowItems.every(item => item !== null)) return true;
      }
      
      // Check vertical lines
      for (let col = 0; col < 3; col++) {
        const colItems = [grid[col], grid[col + 3], grid[col + 6]];
        if (colItems.every(item => item !== null)) return true;
      }
      return false;
      
    case "diagonal":
      // Check diagonals
      const diagonal1 = [grid[0], grid[4], grid[8]];
      const diagonal2 = [grid[2], grid[4], grid[6]];
      return diagonal1.every(item => item !== null) || diagonal2.every(item => item !== null);
      
    case "square":
      // Check 2x2 squares
      const squares = [
        [0, 1, 3, 4], // Top-left
        [1, 2, 4, 5], // Top-right
        [3, 4, 6, 7], // Bottom-left
        [4, 5, 7, 8]  // Bottom-right
      ];
      
      return squares.some(square => 
        square.every(index => grid[index] !== null)
      );
      
    case "cross":
      // Check cross pattern (center + adjacent)
      const cross = [1, 3, 4, 5, 7]; // Top, left, center, right, bottom
      return cross.every(index => grid[index] !== null);
      
    case "triangle":
      // Check triangle patterns
      const triangles = [
        [0, 1, 2, 4], // Top row + center
        [0, 3, 6, 4], // Left column + center
        [2, 5, 8, 4], // Right column + center
        [6, 7, 8, 4]  // Bottom row + center
      ];
      
      return triangles.some(triangle => 
        triangle.every(index => grid[index] !== null)
      );
      
    case "circle":
      // Check circle pattern (all outer cells)
      const circle = [0, 1, 2, 3, 5, 6, 7, 8]; // All except center
      return circle.every(index => grid[index] !== null);
      
    default:
      return false;
  }
}

/**
 * Get pattern bonuses for a crafting grid
 */
export function getGridPatternBonuses(
  grid: (string | null)[],
  itemType: string
): PatternBonus[] {
  const matchedPatterns: PatternBonus[] = [];
  
  // Check each pattern type
  patternBonuses.forEach(bonus => {
    if (bonus.itemType === itemType && checkGridPattern(grid, bonus.type)) {
      matchedPatterns.push(bonus);
    }
  });
  
  return matchedPatterns;
}

/**
 * Calculate the rarity of a crafted item based on inputs, character stats, and crafting controls
 */
export function calculateCraftedItemRarity(
  character: CharacterStats,
  craftingControls: Record<string, number>,
  patternBonuses: PatternBonus[]
): ItemRarity {
  // Base rarity points
  let rarityPoints = 0;
  
  // Add points based on character crafting stats
  rarityPoints += character.craftingStats.metalworking * 5;
  rarityPoints += character.craftingStats.magicworking * 8;
  rarityPoints += character.craftingStats.spellcraft * 7;
  
  // Add points based on crafting controls
  rarityPoints += craftingControls.magic * 0.5;
  rarityPoints += craftingControls.stability * 0.3;
  if (craftingControls.curse) {
    rarityPoints += craftingControls.curse * 0.8;
  }
  
  // Add points from pattern bonuses
  patternBonuses.forEach(bonus => {
    rarityPoints += bonus.rarityBoost * 10;
  });
  
  // Determine rarity based on points
  if (rarityPoints >= 200) return "legendary";
  if (rarityPoints >= 150) return "epic";
  if (rarityPoints >= 100) return "rare";
  if (rarityPoints >= 50) return "uncommon";
  return "common";
}

/**
 * Calculate the chance of adding a special skill to a crafted item
 */
export function calculateSpecialSkillChance(
  character: CharacterStats,
  craftingControls: Record<string, number>,
  itemRarity: ItemRarity
): number {
  // Base chance based on rarity
  let baseChance = 0;
  switch (itemRarity) {
    case "common": baseChance = 5; break;
    case "uncommon": baseChance = 15; break;
    case "rare": baseChance = 30; break;
    case "epic": baseChance = 50; break;
    case "legendary": baseChance = 75; break;
  }
  
  // Add bonus from character stats
  const statBonus = 
    character.craftingStats.magicworking * 2 + 
    character.craftingStats.spellcraft * 3;
  
  // Add bonus from crafting controls
  const controlBonus = 
    (craftingControls.magic / 100) * 15 + 
    (craftingControls.stability / 100) * 10;
  
  // Calculate final chance (cap at 95%)
  return Math.min(95, baseChance + statBonus + controlBonus);
}

/**
 * Get available special skills for an item based on its type and rarity
 */
export function getAvailableSpecialSkills(
  itemType: string,
  itemRarity: ItemRarity
): SpecialSkill[] {
  return Object.values(specialSkillsRegistry).filter(skill => {
    // Check if the skill is available for this item type
    const validType = 
      (itemType === "weapon" && ["damage", "lifesteal", "dot", "manaburn"].includes(skill.type)) ||
      (itemType === "armor" && ["shield", "reflect", "buff"].includes(skill.type)) ||
      (itemType === "accessory" && ["buff", "debuff", "aoe"].includes(skill.type));
    
    // Check if the skill is available for this rarity
    const rarityValue = {
      "common": 1,
      "uncommon": 2,
      "rare": 3,
      "epic": 4,
      "legendary": 5
    };
    
    const requiredRarityValue = rarityValue[skill.requiredRarity];
    const itemRarityValue = rarityValue[itemRarity];
    
    const validRarity = itemRarityValue >= requiredRarityValue;
    
    return validType && validRarity;
  });
}

// Registry of pattern bonuses
export const patternBonuses: PatternBonus[] = [
  {
    type: "linear",
    itemType: "weapon",
    statBonus: { "Attack": 5, "Damage": 10 },
    rarityBoost: 1,
    description: "Linear arrangement increases weapon damage"
  },
  {
    type: "cross",
    itemType: "weapon",
    statBonus: { "Crit Chance": 5, "Crit Damage": 15 },
    rarityBoost: 2,
    description: "Cross arrangement increases critical hit potential"
  },
  {
    type: "diagonal",
    itemType: "weapon",
    statBonus: { "Speed": 3, "Attack": 3 },
    rarityBoost: 1.5,
    description: "Diagonal arrangement increases weapon speed"
  },
  {
    type: "square",
    itemType: "armor",
    statBonus: { "Defense": 8, "Health": 15 },
    rarityBoost: 1.5,
    description: "Square arrangement increases armor defense"
  },
  {
    type: "circle",
    itemType: "armor",
    statBonus: { "Magic Defense": 10, "Elemental Resistance": 5 },
    rarityBoost: 2,
    description: "Circle arrangement increases magical protection"
  },
  {
    type: "triangle",
    itemType: "accessory",
    statBonus: { "Magic Power": 8, "MP Regeneration": 3 },
    rarityBoost: 1.5,
    description: "Triangle arrangement enhances magical properties"
  },
  {
    type: "linear",
    itemType: "potion",
    statBonus: { "Effect Strength": 15, "Duration": 10 },
    rarityBoost: 1,
    description: "Linear arrangement increases potion potency"
  }
];

// Registry of special skills
export const specialSkillsRegistry: Record<string, SpecialSkill> = {
  "firebolt": {
    id: "firebolt",
    name: "Firebolt",
    description: "Launch a bolt of fire at the enemy",
    type: "damage",
    element: "fire",
    target: "enemy",
    basePower: 120,
    manaCost: 15,
    cooldown: 2,
    requiredRarity: "uncommon"
  },
  "ice_spike": {
    id: "ice_spike",
    name: "Ice Spike",
    description: "Impale the enemy with a spike of ice",
    type: "damage",
    element: "ice",
    target: "enemy",
    basePower: 130,
    manaCost: 18,
    cooldown: 2,
    requiredRarity: "uncommon"
  },
  "lightning_strike": {
    id: "lightning_strike",
    name: "Lightning Strike",
    description: "Call down lightning on your foe",
    type: "damage",
    element: "lightning",
    target: "enemy",
    basePower: 150,
    manaCost: 25,
    cooldown: 3,
    requiredRarity: "rare"
  },
  "arcane_blast": {
    id: "arcane_blast",
    name: "Arcane Blast",
    description: "Unleash pure arcane energy",
    type: "damage",
    element: "arcane",
    target: "enemy",
    basePower: 180,
    manaCost: 30,
    cooldown: 4,
    requiredRarity: "epic"
  },
  "void_rift": {
    id: "void_rift",
    name: "Void Rift",
    description: "Open a rift to the void, damaging all enemies",
    type: "damage",
    element: "void",
    target: "all_enemies",
    basePower: 120,
    manaCost: 40,
    cooldown: 5,
    requiredRarity: "legendary"
  },
  "healing_light": {
    id: "healing_light",
    name: "Healing Light",
    description: "Bathe yourself in healing light",
    type: "heal",
    element: "holy",
    target: "self",
    basePower: 150,
    manaCost: 25,
    cooldown: 3,
    requiredRarity: "rare"
  },
  "strength_aura": {
    id: "strength_aura",
    name: "Strength Aura",
    description: "Increase your strength temporarily",
    type: "buff",
    target: "self",
    basePower: 0,
    manaCost: 20,
    cooldown: 4,
    requiredRarity: "uncommon",
    effects: {
      duration: 3,
      statModifiers: { "Attack": 15 }
    }
  },
  "protective_barrier": {
    id: "protective_barrier",
    name: "Protective Barrier",
    description: "Create a magical barrier that absorbs damage",
    type: "shield",
    target: "self",
    basePower: 0,
    manaCost: 30,
    cooldown: 5,
    requiredRarity: "rare",
    effects: {
      duration: 3,
      statModifiers: { "Defense": 20, "Magic Defense": 20 }
    }
  },
  "vampiric_strike": {
    id: "vampiric_strike",
    name: "Vampiric Strike",
    description: "Drain life from your enemy",
    type: "lifesteal",
    element: "physical",
    target: "enemy",
    basePower: 100,
    manaCost: 15,
    cooldown: 3,
    requiredRarity: "rare"
  },
  "poison_blade": {
    id: "poison_blade",
    name: "Poison Blade",
    description: "Inflict poison that damages over time",
    type: "dot",
    target: "enemy",
    basePower: 80,
    manaCost: 20,
    cooldown: 4,
    requiredRarity: "uncommon",
    effects: {
      duration: 3
    }
  },
  "mana_drain": {
    id: "mana_drain",
    name: "Mana Drain",
    description: "Drain the enemy's magical energy",
    type: "manaburn",
    element: "arcane",
    target: "enemy",
    basePower: 60,
    manaCost: 15,
    cooldown: 3,
    requiredRarity: "rare"
  },
  "stunning_blow": {
    id: "stunning_blow",
    name: "Stunning Blow",
    description: "Strike with a chance to stun the enemy",
    type: "stun",
    element: "physical",
    target: "enemy",
    basePower: 90,
    manaCost: 25,
    cooldown: 4,
    requiredRarity: "rare",
    effects: {
      chance: 70,
      duration: 1
    }
  },
  "reflective_shield": {
    id: "reflective_shield",
    name: "Reflective Shield",
    description: "Create a shield that reflects damage back to attackers",
    type: "reflect",
    target: "self",
    basePower: 0,
    manaCost: 35,
    cooldown: 5,
    requiredRarity: "epic",
    effects: {
      duration: 3,
      statModifiers: { "Damage Reflection": 30 }
    }
  },
  "elemental_fury": {
    id: "elemental_fury",
    name: "Elemental Fury",
    description: "Unleash a barrage of elemental attacks",
    type: "aoe",
    target: "all_enemies",
    basePower: 100,
    manaCost: 45,
    cooldown: 6,
    requiredRarity: "legendary"
  }
};
