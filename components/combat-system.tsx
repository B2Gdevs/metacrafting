"use client";

import React from "react";
import { CharacterStats } from "@/components/character-sheet";
import { Item } from "@/components/item-slot";
import { useCombat, enemies } from "@/hooks/use-combat";
import CombatEnemySelection from "@/components/combat/combat-enemy-selection";
import CombatInterface from "@/components/combat/combat-interface";
import { CombatVictory, CombatDefeat } from "@/components/combat/combat-results";

interface CombatSystemProps {
  character: CharacterStats;
  setCharacter: (character: Partial<CharacterStats>) => void;
  inventory: { id: string; quantity: number }[];
  setInventory: (inventory: { id: string; quantity: number }[]) => void;
  gameItems: Record<string, Item>;
  onCombatEnd?: (result: "victory" | "defeat") => void;
}

export default function CombatSystem({
  character,
  setCharacter,
  inventory,
  setInventory,
  gameItems,
  onCombatEnd
}: CombatSystemProps) {
  const {
    // Combat state
    combatState,
    selectedEnemy,
    enemyEntity,
    playerEntity,
    combatLog,
    availableActions,
    selectedAction,
    rewards,
    
    // Handlers
    startCombat,
    handleActionSelect,
    executePlayerAction,
    collectRewards,
    endCombat,
    
    // Helper functions
    getStatusEffectStyle
  } = useCombat({
    character,
    inventory,
    gameItems,
    onUpdateCharacter: (updatedCharacter) => {
      setCharacter(updatedCharacter);
    },
    onUpdateInventory: (updatedInventory) => {
      if (updatedInventory) {
        setInventory(updatedInventory);
      }
    },
    onCombatEnd
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Combat Arena</h1>
      
      {/* Enemy Selection */}
      {combatState === "idle" && !selectedEnemy && (
        <CombatEnemySelection 
          enemies={enemies} 
          onSelectEnemy={startCombat} 
        />
      )}
      
      {/* Combat Interface */}
      {(combatState === "playerTurn" || combatState === "enemyTurn") && 
       playerEntity && enemyEntity && (
        <CombatInterface
          playerEntity={playerEntity}
          enemyEntity={enemyEntity}
          combatLog={combatLog}
          availableActions={availableActions}
          selectedAction={selectedAction}
          onActionSelect={handleActionSelect}
          onExecuteAction={executePlayerAction}
          getStatusEffectStyle={getStatusEffectStyle}
          isPlayerTurn={combatState === "playerTurn"}
        />
      )}
      
      {/* Victory Screen */}
      {combatState === "victory" && rewards && (
        <CombatVictory 
          rewards={rewards} 
          onCollectRewards={collectRewards} 
        />
      )}
      
      {/* Defeat Screen */}
      {combatState === "defeat" && (
        <CombatDefeat 
          onContinue={endCombat} 
        />
      )}
    </div>
  );
}
