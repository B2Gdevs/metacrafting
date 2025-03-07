"use client";

import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CraftingSystem from "@/components/crafting-system";
import CharacterSheet, { CharacterStats } from "@/components/character-sheet";
import CombatSystem from "@/components/combat-system";
import Marketplace from "@/components/marketplace";
import { gameItems } from "@/lib/items";
import { useGameStore } from "@/lib/store";
import { Hammer, Sword, User, ShoppingCart } from "lucide-react";

export default function Home() {
  // Get state and actions from the game store
  const {
    character,
    inventory,
    updateCharacter,
    updateInventory,
    addToInventory,
    removeFromInventory
  } = useGameStore();

  // Handle consuming a magic potion
  const handleConsumeMagicPotion = () => {
    const potionIndex = inventory.findIndex(item => item.id === "magic_potion");
    if (potionIndex >= 0 && inventory[potionIndex].quantity > 0) {
      // Update inventory
      removeFromInventory("magic_potion", 1);
      
      // Update character mana
      updateCharacter({
        magicPoints: Math.min(character.maxMagicPoints, character.magicPoints + 25)
      });
      
      return true;
    }
    return false;
  };

  // Handle character updates
  const handleUpdateCharacter = (updatedCharacter: CharacterStats) => {
    updateCharacter(updatedCharacter);
  };

  // Handle inventory updates
  const handleUpdateInventory = (updatedInventory: Array<{ id: string; quantity: number }>) => {
    updateInventory(updatedInventory);
  };

  // Handle equipping an item
  const handleEquipItem = (itemId: string, slot: any) => {
    const newCharacter = { ...character };
    
    // Handle rings separately since they can have multiple slots
    if (slot === "rings") {
      // Find the first empty ring slot or add to the end
      const ringsArray = newCharacter.equipment.rings || [];
      const emptyIndex = ringsArray.findIndex(ring => !ring);
      if (emptyIndex !== -1) {
        ringsArray[emptyIndex] = itemId;
      } else {
        ringsArray.push(itemId);
      }
      newCharacter.equipment.rings = ringsArray;
    } else {
      // For other slots, just assign the item
      (newCharacter.equipment as any)[slot] = itemId;
    }
    
    // Remove the item from inventory
    removeFromInventory(itemId, 1);
    
    // Update character
    updateCharacter(newCharacter);
  };

  // Handle unequipping an item
  const handleUnequipItem = (slot: any, ringIndex?: number) => {
    const newCharacter = { ...character };
    let itemId: string | undefined;
    
    // Handle rings separately
    if (slot === "rings" && ringIndex !== undefined) {
      const ringsArray = [...(newCharacter.equipment.rings || [])];
      itemId = ringsArray[ringIndex];
      if (itemId) {
        ringsArray[ringIndex] = "";
        newCharacter.equipment.rings = ringsArray;
      }
    } else {
      itemId = (newCharacter.equipment as any)[slot];
      if (itemId) {
        (newCharacter.equipment as any)[slot] = undefined;
      }
    }
    
    // Add the item back to inventory
    if (itemId) {
      addToInventory(itemId, 1);
    }
    
    // Update character
    updateCharacter(newCharacter);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-amber-400 mb-6">MetaCrafting System</h1>
          <Tabs defaultValue="crafting">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="crafting" className="data-[state=active]:bg-gray-800 data-[state=active]:text-amber-400">
                <Hammer className="mr-2 h-4 w-4" />
                Crafting
              </TabsTrigger>
              <TabsTrigger value="character" className="data-[state=active]:bg-gray-800 data-[state=active]:text-amber-400">
                <User className="mr-2 h-4 w-4" />
                Character
              </TabsTrigger>
              <TabsTrigger value="combat" className="data-[state=active]:bg-gray-800 data-[state=active]:text-amber-400">
                <Sword className="mr-2 h-4 w-4" />
                Combat
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-gray-800 data-[state=active]:text-amber-400">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Marketplace
              </TabsTrigger>
            </TabsList>

            <TabsContent value="crafting">
              <CraftingSystem 
                character={character}
                inventory={inventory}
                onUpdateCharacter={handleUpdateCharacter}
                onUpdateInventory={handleUpdateInventory}
                onConsumeMagicPotion={handleConsumeMagicPotion}
              />
            </TabsContent>

            <TabsContent value="character">
              <CharacterSheet 
                character={character}
                onConsumeMagicPotion={handleConsumeMagicPotion}
                onUpdateCharacter={handleUpdateCharacter}
                inventory={inventory}
                gameItems={gameItems}
                onEquipItem={handleEquipItem}
                onUnequipItem={handleUnequipItem}
              />
            </TabsContent>

            <TabsContent value="combat">
              <CombatSystem 
                character={character}
                setCharacter={(updates) => updateCharacter(updates)}
                inventory={inventory}
                setInventory={(newInventory) => updateInventory(newInventory)}
                gameItems={gameItems}
              />
            </TabsContent>

            <TabsContent value="marketplace">
              <Marketplace
                onUpdateCharacter={handleUpdateCharacter}
                onUpdateInventory={handleUpdateInventory}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </DndProvider>
  );
}

