"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterStats } from "@/components/character-sheet";
import { Item, ItemRarity } from "@/components/item-slot";
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
type EnemyType = {
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
type CombatLogEntry = {
  message: string;
  timestamp: number;
  type: "player" | "enemy" | "system" | "loot";
};

// Define combat state
type CombatState = "idle" | "active" | "playerTurn" | "enemyTurn" | "victory" | "defeat";

// Define status effect type for our combat system
type CombatStatusEffectType = "poison" | "burn" | "bleed" | "stun" | "weakness" | "buff" | "debuff";

// Update the StatusEffect interface to use our custom type
interface CombatStatusEffect {
  type: CombatStatusEffectType;
  duration: number;
  value: number;
}

// Sample enemy data
const enemies: EnemyType[] = [
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

export default function CombatSystem({ 
  character, 
  setCharacter, 
  inventory, 
  setInventory,
  onCombatEnd
}: { 
  character: CharacterStats; 
  setCharacter: React.Dispatch<React.SetStateAction<CharacterStats>>;
  inventory: { id: string; quantity: number }[];
  setInventory: React.Dispatch<React.SetStateAction<{ id: string; quantity: number }[]>>;
  onCombatEnd?: (result: "victory" | "defeat") => void;
}) {
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

  // Initialize combat with selected enemy
  const initializeCombat = (enemy: EnemyType) => {
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
          requiredRarity: "common" as ItemRarity
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
  };

  // Update available actions for player
  const updateAvailableActions = (player: CombatEntity) => {
    const actions: CombatAction[] = [
      {
        name: "Attack",
        type: "attack",
        target: 0
      }
    ];
    
    // Add special skills
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
    
    // Add flee option
    actions.push({
      name: "Flee",
      type: "flee",
      target: 0
    });
    
    setAvailableActions(actions);
  };

  // Add entry to combat log
  const addToCombatLog = (message: string, type: "player" | "enemy" | "system" | "loot") => {
    setCombatLog(prev => [
      {
        message,
        timestamp: Date.now(),
        type
      },
      ...prev
    ]);
  };

  // Handle player action selection
  const handleActionSelect = (action: CombatAction) => {
    setSelectedAction(action);
  };

  // Execute player action
  const executePlayerAction = () => {
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
  };

  // Process enemy turn
  const processEnemyTurn = () => {
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
    if (updatedEnemyEntity.stats.specialSkills.length > 0 && 
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
    }, 1000);
  };

  // Process status effects for an entity
  const processStatusEffects = (entity: CombatEntity): CombatEntity => {
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
  };

  // Handle combat victory
  const handleCombatVictory = () => {
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
  };

  // Handle combat defeat
  const handleCombatDefeat = () => {
    setCombatState("defeat");
    addToCombatLog("You have been defeated!", "system");
    
    // Update character stats
    setCharacter(prev => ({
      ...prev,
      health: Math.max(1, Math.floor(prev.maxHealth * 0.1)), // Restore 10% health
      magicPoints: Math.max(1, Math.floor(prev.maxMagicPoints * 0.1)) // Restore 10% mana
    }));
    
    // Call onCombatEnd callback if provided
    if (onCombatEnd) {
      onCombatEnd("defeat");
    }
  };

  // End combat and reset state
  const endCombat = () => {
    setCombatState("idle");
    setSelectedEnemy(null);
    setEnemyEntity(null);
    setPlayerEntity(null);
    setCombatLog([]);
    setAvailableActions([]);
    setSelectedAction(null);
    setTurnCounter(0);
    setRewards(null);
  };

  // Start combat with a specific enemy
  const startCombat = (enemy: EnemyType) => {
    setSelectedEnemy(enemy);
    setCombatState("idle"); // Will trigger initialization
  };

  // Collect rewards and end combat
  const collectRewards = () => {
    endCombat();
  };

  // Render enemy selection
  const renderEnemySelection = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {enemies.map(enemy => (
          <Card key={enemy.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => startCombat(enemy)}>
            <CardHeader>
              <CardTitle>{enemy.name}</CardTitle>
              <CardDescription>Level {enemy.level}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                  {enemy.image ? (
                    <img src={enemy.image} alt={enemy.name} className="max-w-full max-h-full" />
                  ) : (
                    <span>{enemy.name[0]}</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Health:</span>
                  <span>{enemy.baseHealth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attack:</span>
                  <span>{enemy.baseStats.attack}</span>
                </div>
                <div className="flex justify-between">
                  <span>Defense:</span>
                  <span>{enemy.baseStats.defense}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Fight</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Render combat interface
  const renderCombatInterface = () => {
    if (!playerEntity || !enemyEntity) return null;
    
    // Helper function to get status effect styling
    const getStatusEffectStyle = (effect: StatusEffect) => {
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
    };
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Player and Enemy Status */}
        <div className="space-y-4">
          {/* Player Status */}
          <Card className="game-card">
            <CardHeader className="game-card-header pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-amber-400">{playerEntity.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Lvl {playerEntity.level}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="game-card-content pt-2">
              {/* Health Bar */}
              <div className="space-y-1 mb-2">
                <div className="flex justify-between text-sm">
                  <span>Health</span>
                  <span>{playerEntity.health} / {playerEntity.maxHealth}</span>
                </div>
                <Progress 
                  value={(playerEntity.health / playerEntity.maxHealth) * 100} 
                  className="h-2 bg-gray-800"
                  indicatorClassName="bg-green-600"
                />
              </div>
              
              {/* Magic Points Bar */}
              <div className="space-y-1 mb-2">
                <div className="flex justify-between text-sm">
                  <span>Magic</span>
                  <span>{playerEntity.magicPoints} / {playerEntity.maxMagicPoints}</span>
                </div>
                <Progress 
                  value={(playerEntity.magicPoints / playerEntity.maxMagicPoints) * 100} 
                  className="h-2 bg-gray-800"
                  indicatorClassName="bg-blue-600"
                />
              </div>
              
              {/* Status Effects */}
              {playerEntity.statusEffects.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm mb-1">Status Effects:</div>
                  <div className="flex flex-wrap gap-1">
                    {playerEntity.statusEffects.map((effect, index) => (
                      <Badge 
                        key={`${effect.type}-${index}`}
                        variant="outline"
                        className={getStatusEffectStyle(effect)}
                      >
                        {effect.name} ({effect.duration})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Enemy Status */}
          <Card className="game-card">
            <CardHeader className="game-card-header pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-red-400">{enemyEntity.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Lvl {enemyEntity.level}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="game-card-content pt-2">
              {/* Health Bar */}
              <div className="space-y-1 mb-2">
                <div className="flex justify-between text-sm">
                  <span>Health</span>
                  <span>{enemyEntity.health} / {enemyEntity.maxHealth}</span>
                </div>
                <Progress 
                  value={(enemyEntity.health / enemyEntity.maxHealth) * 100} 
                  className="h-2 bg-gray-800"
                  indicatorClassName="bg-red-600"
                />
              </div>
              
              {/* Status Effects */}
              {enemyEntity.statusEffects.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm mb-1">Status Effects:</div>
                  <div className="flex flex-wrap gap-1">
                    {enemyEntity.statusEffects.map((effect, index) => (
                      <Badge 
                        key={`${effect.type}-${index}`}
                        variant="outline"
                        className={getStatusEffectStyle(effect)}
                      >
                        {effect.name} ({effect.duration})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Combat Actions and Log */}
        <div className="space-y-4">
          {/* Combat Actions */}
          <Card className="game-card">
            <CardHeader className="game-card-header">
              <CardTitle className="text-lg text-amber-400">Combat Actions</CardTitle>
            </CardHeader>
            <CardContent className="game-card-content">
              <div className="grid grid-cols-2 gap-2">
                {availableActions.map((action) => (
                  <Button
                    key={action.name}
                    variant={selectedAction?.name === action.name ? "default" : "outline"}
                    className={`
                      ${selectedAction?.name === action.name 
                        ? "bg-amber-700 hover:bg-amber-600 text-white" 
                        : "game-button-secondary"}
                      justify-start text-left
                    `}
                    disabled={combatState !== "playerTurn"}
                    onClick={() => handleActionSelect(action)}
                  >
                    {action.name}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button
                  variant="default"
                  className="game-button-primary"
                  disabled={combatState !== "playerTurn" || !selectedAction}
                  onClick={executePlayerAction}
                >
                  Execute Action
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Combat Log */}
          <Card className="game-card">
            <CardHeader className="game-card-header">
              <CardTitle className="text-lg text-amber-400">Combat Log</CardTitle>
            </CardHeader>
            <CardContent className="game-card-content p-0">
              <div className="h-[300px] overflow-y-auto p-4">
                {combatLog.map((entry, index) => (
                  <div 
                    key={index} 
                    className={`mb-1 text-sm ${
                      entry.type === "player" ? "text-blue-400" :
                      entry.type === "enemy" ? "text-red-400" :
                      entry.type === "loot" ? "text-amber-400" : "text-gray-400"
                    }`}
                  >
                    {entry.message}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Render victory screen
  const renderVictoryScreen = () => {
    if (!rewards) return null;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Victory!</CardTitle>
          <CardDescription>You have defeated the enemy!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Rewards:</h3>
              <ul className="list-disc list-inside">
                <li>{rewards.gold} Gold</li>
                <li>{rewards.experience} Experience</li>
                {rewards.items.map((item, index) => (
                  <li key={index}>{item.quantity}x {item.id}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={collectRewards} className="w-full">Continue</Button>
        </CardFooter>
      </Card>
    );
  };

  // Render defeat screen
  const renderDefeatScreen = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Defeat</CardTitle>
          <CardDescription>You have been defeated!</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You have been restored to 10% health and magic points.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={endCombat} className="w-full">Continue</Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Combat Arena</h1>
      
      {combatState === "idle" && !selectedEnemy && renderEnemySelection()}
      {(combatState === "playerTurn" || combatState === "enemyTurn") && renderCombatInterface()}
      {combatState === "victory" && renderVictoryScreen()}
      {combatState === "defeat" && renderDefeatScreen()}
    </div>
  );
}
