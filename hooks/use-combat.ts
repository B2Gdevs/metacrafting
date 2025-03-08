"use client"

import { useState, useEffect, useCallback, useMemo } from "react";
import { CharacterStats } from "@/components/character-sheet";
import { Item } from "@/components/item-slot";
import { 
  CombatEntity, 
  CombatAction, 
  CombatResult, 
  StatusEffect,
  calculateCombatStats, 
  calculateBasicAttackDamage,
  calculateSpecialSkillDamage,
  SpecialSkill
} from "@/lib/combat-utils";

// Define enemy types
export type EnemyType = {
  id: string;
  name: string;
  level: number;
  baseHealth: number;
  baseMagicPoints: number;
  baseStats: {
    attack: number;
    defense: number;
    magicAttack: number;
    magicDefense: number;
    speed: number;
  };
  skills: string[];
  loot: {
    gold: number;
    experience: number;
    items: {
      id: string;
      chance: number;
    }[];
  };
  image: string;
};

// Define combat log entry
export type CombatLogEntry = {
  message: string;
  timestamp: number;
  type: "player" | "enemy" | "system" | "loot";
};

// Define combat state
export type CombatState = "idle" | "active" | "playerTurn" | "enemyTurn" | "victory" | "defeat";

// Define status effect type for our combat system
export type CombatStatusEffectType = "poison" | "burn" | "bleed" | "stun" | "weakness" | "buff" | "debuff";

// Update the StatusEffect interface to use our custom type
export interface CombatStatusEffect {
  type: CombatStatusEffectType;
  duration: number;
  value: number;
}

export interface UseCombatProps {
  character: CharacterStats;
  inventory: Array<{ id: string; quantity: number }>;
  gameItems?: Record<string, Item>;
  onUpdateCharacter?: (updatedCharacter: Partial<CharacterStats>) => void;
  onUpdateInventory?: (updatedInventory: Array<{ id: string; quantity: number }>) => void;
  onCombatEnd?: (result: "victory" | "defeat") => void;
}

export interface UseCombatReturn {
  // Combat state
  combatState: CombatState;
  selectedEnemy: EnemyType | null;
  enemyEntity: CombatEntity | null;
  playerEntity: CombatEntity | null;
  combatLog: CombatLogEntry[];
  availableActions: CombatAction[];
  selectedAction: CombatAction | null;
  turnCounter: number;
  rewards: {
    gold: number;
    experience: number;
    items: { id: string; quantity: number }[];
  } | null;
  
  // Handlers
  startCombat: (enemy: EnemyType) => void;
  handleActionSelect: (action: CombatAction) => void;
  executePlayerAction: () => void;
  collectRewards: () => void;
  endCombat: () => void;
  
  // Helper functions
  getStatusEffectStyle: (effect: StatusEffect) => string;
}

// Sample enemy data
export const enemies: EnemyType[] = [
  {
    id: "goblin",
    name: "Forest Goblin",
    level: 3,
    baseHealth: 50,
    baseMagicPoints: 20,
    baseStats: {
      attack: 12,
      defense: 8,
      magicAttack: 5,
      magicDefense: 5,
      speed: 15
    },
    skills: ["poison_blade"],
    loot: {
      gold: 25,
      experience: 30,
      items: [
        { id: "wood", chance: 80 },
        { id: "goblin_tooth", chance: 40 },
        { id: "crude_dagger", chance: 15 }
      ]
    },
    image: "/enemies/goblin.png"
  },
  {
    id: "skeleton",
    name: "Ancient Skeleton",
    level: 5,
    baseHealth: 70,
    baseMagicPoints: 30,
    baseStats: {
      attack: 15,
      defense: 12,
      magicAttack: 8,
      magicDefense: 10,
      speed: 10
    },
    skills: ["bone_spike"],
    loot: {
      gold: 40,
      experience: 50,
      items: [
        { id: "bone", chance: 90 },
        { id: "rusty_sword", chance: 30 },
        { id: "ancient_coin", chance: 20 }
      ]
    },
    image: "/enemies/skeleton.png"
  },
  {
    id: "fire_elemental",
    name: "Fire Elemental",
    level: 8,
    baseHealth: 100,
    baseMagicPoints: 80,
    baseStats: {
      attack: 12,
      defense: 10,
      magicAttack: 25,
      magicDefense: 20,
      speed: 18
    },
    skills: ["firebolt", "fire_shield"],
    loot: {
      gold: 70,
      experience: 90,
      items: [
        { id: "fire_essence", chance: 75 },
        { id: "ember_stone", chance: 40 },
        { id: "flame_crystal", chance: 15 }
      ]
    },
    image: "/enemies/fire_elemental.png"
  }
];

export const useCombat = ({
  character,
  inventory,
  gameItems,
  onUpdateCharacter,
  onUpdateInventory,
  onCombatEnd
}: UseCombatProps): UseCombatReturn => {
  // Combat state
  const [combatState, setCombatState] = useState<CombatState>("idle");
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyType | null>(null);
  const [enemyEntity, setEnemyEntity] = useState<CombatEntity | null>(null);
  const [playerEntity, setPlayerEntity] = useState<CombatEntity | null>(null);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [availableActions, setAvailableActions] = useState<CombatAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<CombatAction | null>(null);
  const [turnCounter, setTurnCounter] = useState(0);
  const [rewards, setRewards] = useState<{
    gold: number;
    experience: number;
    items: { id: string; quantity: number }[];
  } | null>(null);

  // End combat and reset state
  const endCombat = useCallback(() => {
    setCombatState("idle");
    setSelectedEnemy(null);
    setEnemyEntity(null);
    setPlayerEntity(null);
    setCombatLog([]);
    setAvailableActions([]);
    setSelectedAction(null);
    setTurnCounter(0);
    setRewards(null);
  }, []);

  // Initialize combat when an enemy is selected
  useEffect(() => {
    if (selectedEnemy && combatState === "idle") {
      initializeCombat(selectedEnemy);
    }
  }, [selectedEnemy, combatState]);

  // Process turns
  useEffect(() => {
    if (combatState === "enemyTurn" && enemyEntity && playerEntity) {
      // Add a small delay before enemy action
      const timer = setTimeout(() => {
        processEnemyTurn();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [combatState, enemyEntity, playerEntity]);

  // Add entry to combat log
  const addToCombatLog = useCallback((message: string, type: "player" | "enemy" | "system" | "loot") => {
    setCombatLog(prev => [
      {
        message,
        timestamp: Date.now(),
        type
      },
      ...prev
    ]);
  }, []);

  // Update available actions for player
  const updateAvailableActions = useCallback((player: CombatEntity) => {
    const actions: CombatAction[] = [
      {
        name: "Attack",
        type: "attack",
        target: 0
      }
    ];
    
    // Add special skills
    if (player.stats.specialSkills) {
      player.stats.specialSkills.forEach(skill => {
        if (player.magicPoints >= skill.manaCost) {
          actions.push({
            name: skill.name,
            type: "special",
            target: 0,
            skill: skill
          });
        }
      });
    }
    
    // Add flee option
    actions.push({
      name: "Flee",
      type: "flee",
      target: 0
    });
    
    setAvailableActions(actions);
  }, []);

  // Initialize combat with selected enemy
  const initializeCombat = useCallback((enemy: EnemyType) => {
    // Create player combat entity
    const equippedItems: Record<string, Item> = {};
    
    // Add equipped items from character
    Object.entries(character.equipment).forEach(([slot, item]) => {
      if (Array.isArray(item)) {
        // Handle arrays like rings
        item.forEach((ringItem, index) => {
          if (ringItem && typeof ringItem !== 'string') {
            equippedItems[`${slot}_${index}`] = ringItem;
          }
        });
      } else if (item && typeof item !== 'string') {
        // Handle single items
        equippedItems[slot] = item;
      }
    });
    
    const playerCombatStats = calculateCombatStats(character, equippedItems);
    
    const player: CombatEntity = {
      name: character.name,
      level: character.level,
      health: character.health,
      maxHealth: character.maxHealth,
      magicPoints: character.magicPoints,
      maxMagicPoints: character.maxMagicPoints,
      stats: playerCombatStats,
      statusEffects: []
    };
    
    // Create enemy combat entity
    const enemyCombatStats = {
      attack: enemy.baseStats.attack,
      defense: enemy.baseStats.defense,
      magicAttack: enemy.baseStats.magicAttack,
      magicDefense: enemy.baseStats.magicDefense,
      speed: enemy.baseStats.speed,
      critChance: 5,
      critDamage: 150,
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
      specialSkills: enemy.skills.map(skillId => {
        // Get skill from registry (assuming it exists in combat-utils)
        return {
          id: skillId,
          name: skillId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          description: "Enemy skill",
          type: "damage" as const,
          target: "enemy" as const,
          basePower: 100,
          manaCost: 10,
          cooldown: 3,
          requiredRarity: "common" as const
        };
      })
    };
    
    const enemyEntity: CombatEntity = {
      name: enemy.name,
      level: enemy.level,
      health: enemy.baseHealth,
      maxHealth: enemy.baseHealth,
      magicPoints: enemy.baseMagicPoints,
      maxMagicPoints: enemy.baseMagicPoints,
      stats: enemyCombatStats,
      statusEffects: []
    };
    
    // Set entities
    setPlayerEntity(player);
    setEnemyEntity(enemyEntity);
    
    // Determine who goes first based on speed
    const playerGoesFirst = player.stats.speed >= enemyEntity.stats.speed;
    
    // Set combat state
    setCombatState(playerGoesFirst ? "playerTurn" : "enemyTurn");
    
    // Add combat start log
    addToCombatLog(`Combat started with ${enemy.name}!`, "system");
    
    // Set available actions
    updateAvailableActions(player);
  }, [character, addToCombatLog, updateAvailableActions]);

  // Handle player action selection
  const handleActionSelect = useCallback((action: CombatAction) => {
    setSelectedAction(action);
  }, []);

  // Process status effects for an entity
  const processStatusEffects = useCallback((entity: CombatEntity): CombatEntity => {
    if (entity.statusEffects.length === 0) return entity;
    
    let health = entity.health;
    const updatedStatusEffects: StatusEffect[] = [];
    
    // Process each status effect
    entity.statusEffects.forEach(effect => {
      // Apply tick effect if available
      if (effect.tickEffect) {
        const damage = effect.tickEffect();
        if (typeof damage === 'number') {
          health -= damage;
          addToCombatLog(`${entity.name} takes ${damage} damage from ${effect.name}!`, entity === playerEntity ? "enemy" : "player");
        }
      }
      
      // Reduce duration
      const newDuration = effect.duration - 1;
      
      // Keep effect if duration is still positive
      if (newDuration > 0) {
        updatedStatusEffects.push({
          ...effect,
          duration: newDuration
        });
      } else {
        addToCombatLog(`${effect.name} has worn off from ${entity.name}!`, "system");
      }
    });
    
    return {
      ...entity,
      health: Math.max(0, health),
      statusEffects: updatedStatusEffects
    };
  }, [playerEntity, addToCombatLog]);

  // Handle combat victory
  const handleCombatVictory = useCallback(() => {
    if (!enemyEntity || !playerEntity) return;
    
    // Calculate rewards
    const goldReward = Math.floor(enemyEntity.level * 10 * (1 + Math.random() * 0.5));
    const expReward = Math.floor(enemyEntity.level * 20 * (1 + Math.random() * 0.5));
    
    // Calculate item drops
    const itemDrops: {id: string, quantity: number}[] = [];
    
    // 50% chance to drop a health potion
    if (Math.random() < 0.5) {
      itemDrops.push({id: "health_potion", quantity: 1});
    }
    
    // 30% chance to drop a mana potion
    if (Math.random() < 0.3) {
      itemDrops.push({id: "mana_potion", quantity: 1});
    }
    
    // Set rewards
    setRewards({
      gold: goldReward,
      experience: expReward,
      items: itemDrops
    });
    
    // Update combat state
    setCombatState("victory");
    
    // Add to combat log
    addToCombatLog(`You defeated ${enemyEntity.name}!`, "system");
    addToCombatLog(`Gained ${goldReward} gold and ${expReward} experience!`, "loot");
    
    itemDrops.forEach(item => {
      addToCombatLog(`Received ${item.id} x${item.quantity}`, "loot");
    });
  }, [enemyEntity, playerEntity, addToCombatLog]);

  // Handle combat defeat
  const handleCombatDefeat = useCallback(() => {
    setCombatState("defeat");
    addToCombatLog("You have been defeated!", "system");
    
    // Update character stats
    const updatedCharacter = {
      ...character,
      health: Math.max(1, Math.floor(character.maxHealth * 0.1)), // Restore 10% health
      magicPoints: Math.max(1, Math.floor(character.maxMagicPoints * 0.1)) // Restore 10% mana
    };
    
    // Update character and inventory
    if (onUpdateCharacter) {
      onUpdateCharacter(updatedCharacter);
    }
    if (onUpdateInventory) {
      onUpdateInventory(inventory);
    }
    
    // Call onCombatEnd callback if provided
    if (onCombatEnd) {
      onCombatEnd("defeat");
    }
  }, [character, onUpdateCharacter, onUpdateInventory, addToCombatLog, onCombatEnd, inventory]);

  // Execute player action
  const executePlayerAction = useCallback(() => {
    if (!selectedAction || !playerEntity || !enemyEntity) return;
    
    let result: CombatResult | null = null;
    
    switch (selectedAction.type) {
      case "attack":
        result = calculateBasicAttackDamage(playerEntity, enemyEntity);
        
        // Apply damage to enemy
        const newEnemyHealth = Math.max(0, enemyEntity.health - (result.damage || 0));
        setEnemyEntity({
          ...enemyEntity,
          health: newEnemyHealth
        });
        
        // Add to combat log
        addToCombatLog(result.message, "player");
        
        // Check if enemy is defeated
        if (newEnemyHealth <= 0) {
          handleCombatVictory();
          return;
        }
        break;
        
      case "special":
        if (selectedAction.skill) {
          // Check if player has enough mana
          if (playerEntity.magicPoints < selectedAction.skill.manaCost) {
            addToCombatLog("Not enough magic points!", "system");
            return;
          }
          
          result = calculateSpecialSkillDamage(playerEntity, enemyEntity, selectedAction.skill);
          
          // Apply damage to enemy
          const newEnemyHealth = Math.max(0, enemyEntity.health - (result.damage || 0));
          
          // Apply healing to player if applicable
          let newPlayerHealth = playerEntity.health;
          if (result.healing) {
            newPlayerHealth = Math.min(playerEntity.maxHealth, playerEntity.health + result.healing);
          }
          
          // Apply status effects if applicable
          let newEnemyStatusEffects = [...enemyEntity.statusEffects];
          if (result.statusEffects && result.statusEffects.length > 0) {
            newEnemyStatusEffects = [...newEnemyStatusEffects, ...result.statusEffects];
          }
          
          // Update entities
          setEnemyEntity({
            ...enemyEntity,
            health: newEnemyHealth,
            statusEffects: newEnemyStatusEffects
          });
          
          setPlayerEntity({
            ...playerEntity,
            health: newPlayerHealth,
            magicPoints: playerEntity.magicPoints - selectedAction.skill.manaCost
          });
          
          // Add to combat log
          addToCombatLog(result.message, "player");
          
          // Check if enemy is defeated
          if (newEnemyHealth <= 0) {
            handleCombatVictory();
            return;
          }
        }
        break;
        
      case "flee":
        // 50% chance to flee
        if (Math.random() > 0.5) {
          addToCombatLog("You successfully fled from combat!", "system");
          endCombat();
          return;
        } else {
          addToCombatLog("Failed to flee!", "system");
        }
        break;
    }
    
    // End player turn, start enemy turn
    setCombatState("enemyTurn");
    setSelectedAction(null);
    setTurnCounter(prev => prev + 1);
  }, [selectedAction, playerEntity, enemyEntity, addToCombatLog, handleCombatVictory, endCombat]);

  // Process enemy turn
  const processEnemyTurn = useCallback(() => {
    if (!enemyEntity || !playerEntity) return;
    
    // Process status effects
    const updatedEnemyEntity = processStatusEffects(enemyEntity);
    setEnemyEntity(updatedEnemyEntity);
    
    // Check if enemy is defeated by status effects
    if (updatedEnemyEntity.health <= 0) {
      handleCombatVictory();
      return;
    }
    
    // Choose enemy action
    let result: CombatResult | null = null;
    
    // 30% chance to use special skill if available
    if (updatedEnemyEntity.stats.specialSkills && 
        updatedEnemyEntity.stats.specialSkills.length > 0 && 
        updatedEnemyEntity.magicPoints >= updatedEnemyEntity.stats.specialSkills[0].manaCost &&
        Math.random() < 0.3) {
      
      const skill = updatedEnemyEntity.stats.specialSkills[0];
      result = calculateSpecialSkillDamage(updatedEnemyEntity, playerEntity, skill);
      
      // Update enemy mana
      setEnemyEntity({
        ...updatedEnemyEntity,
        magicPoints: updatedEnemyEntity.magicPoints - skill.manaCost
      });
    } else {
      // Basic attack
      result = calculateBasicAttackDamage(updatedEnemyEntity, playerEntity);
      
      // 10% chance to apply a random status effect on basic attack
      if (Math.random() < 0.1) {
        // These effects are already defined in CombatStatusEffectType
        const possibleEffects = ["poison", "bleed", "weakness"] as const;
        const randomEffect = possibleEffects[Math.floor(Math.random() * possibleEffects.length)];
        
        if (!result.statusEffects) {
          result.statusEffects = [];
        }
        
        result.statusEffects.push({
          name: randomEffect.charAt(0).toUpperCase() + randomEffect.slice(1),
          description: `Suffering from ${randomEffect}`,
          type: "debuff",
          effect: randomEffect,
          duration: 2,
          statModifiers: {},
          tickEffect: () => Math.floor(updatedEnemyEntity.level * 1.5)
        });
        
        result.message += ` The attack causes ${randomEffect}!`;
      }
    }
    
    // Apply damage to player
    const newPlayerHealth = Math.max(0, playerEntity.health - (result.damage || 0));
    
    // Apply status effects if applicable
    let newPlayerStatusEffects = [...playerEntity.statusEffects];
    if (result.statusEffects && result.statusEffects.length > 0) {
      newPlayerStatusEffects = [...newPlayerStatusEffects, ...result.statusEffects];
    }
    
    // Update player entity
    setPlayerEntity({
      ...playerEntity,
      health: newPlayerHealth,
      statusEffects: newPlayerStatusEffects
    });
    
    // Add to combat log
    addToCombatLog(result.message, "enemy");
    
    // Check if player is defeated
    if (newPlayerHealth <= 0) {
      handleCombatDefeat();
      return;
    }
    
    // End enemy turn, start player turn
    setTimeout(() => {
      // Process player status effects
      const updatedPlayerEntity = processStatusEffects({...playerEntity, health: newPlayerHealth, statusEffects: newPlayerStatusEffects});
      setPlayerEntity(updatedPlayerEntity);
      
      // Check if player is defeated by status effects
      if (updatedPlayerEntity.health <= 0) {
        handleCombatDefeat();
        return;
      }
      
      setCombatState("playerTurn");
      setTurnCounter(prev => prev + 1);
      
      // Update available actions in case mana changed
      updateAvailableActions(updatedPlayerEntity);
    }, 1000);
  }, [enemyEntity, playerEntity, processStatusEffects, handleCombatVictory, addToCombatLog, handleCombatDefeat, updateAvailableActions]);

  // Start combat with a specific enemy
  const startCombat = useCallback((enemy: EnemyType) => {
    setSelectedEnemy(enemy);
    setCombatState("idle"); // Will trigger initialization
  }, []);

  // Collect rewards and end combat
  const collectRewards = useCallback(() => {
    if (!rewards) return;
    
    // Update character with rewards
    const updatedCharacter = {
      ...character,
      gold: character.gold + rewards.gold,
      experience: character.experience + rewards.experience
    };
    
    // Check for level up
    if (updatedCharacter.experience >= updatedCharacter.experienceToNextLevel) {
      updatedCharacter.level += 1;
      updatedCharacter.experience -= updatedCharacter.experienceToNextLevel;
      updatedCharacter.experienceToNextLevel = Math.floor(updatedCharacter.experienceToNextLevel * 1.5);
      updatedCharacter.maxHealth += 10;
      updatedCharacter.health = updatedCharacter.maxHealth;
      updatedCharacter.maxMagicPoints += 5;
      updatedCharacter.magicPoints = updatedCharacter.maxMagicPoints;
      
      // Increase stats
      updatedCharacter.strength += 1;
      updatedCharacter.speed += 1;
      
      addToCombatLog(`${character.name} leveled up to level ${updatedCharacter.level}!`, "system");
    }
    
    // Add items to inventory
    const updatedInventory = [...inventory];
    
    rewards.items.forEach(item => {
      const existingItem = updatedInventory.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        updatedInventory.push(item);
      }
    });
    
    // Update character and inventory
    if (onUpdateCharacter) {
      onUpdateCharacter(updatedCharacter);
    }
    if (onUpdateInventory) {
      onUpdateInventory(updatedInventory);
    }
    
    // End combat
    endCombat();
    
    // Call onCombatEnd callback if provided
    if (onCombatEnd) {
      onCombatEnd("victory");
    }
  }, [rewards, character, inventory, onUpdateCharacter, onUpdateInventory, endCombat, addToCombatLog, onCombatEnd]);

  // Helper function to get status effect styling
  const getStatusEffectStyle = useCallback((effect: StatusEffect) => {
    if (effect.effect) {
      switch(effect.effect) {
        case "poison": return "border-green-600 text-green-400";
        case "burn": return "border-orange-600 text-orange-400";
        case "bleed": return "border-red-600 text-red-400";
        case "stun": return "border-yellow-600 text-yellow-400";
        case "weakness": return "border-purple-600 text-purple-400";
      }
    }
    
    // Fallback to type-based styling
    switch(effect.type) {
      case "buff": return "border-blue-600 text-blue-400";
      case "debuff": return "border-purple-600 text-purple-400";
      default: return "border-gray-600 text-gray-400";
    }
  }, []);

  return {
    // Combat state
    combatState,
    selectedEnemy,
    enemyEntity,
    playerEntity,
    combatLog,
    availableActions,
    selectedAction,
    turnCounter,
    rewards,
    
    // Handlers
    startCombat,
    handleActionSelect,
    executePlayerAction,
    collectRewards,
    endCombat,
    
    // Helper functions
    getStatusEffectStyle
  };
}; 