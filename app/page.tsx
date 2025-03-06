"use client";

import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CraftingSystem from "@/components/crafting-system";
import CharacterSheet, { CharacterStats } from "@/components/character-sheet";
import CombatSystem from "@/components/combat-system";
import Marketplace from "@/components/marketplace";
import { gameItems } from "@/lib/items";
import { Hammer, Sword, User, ShoppingCart } from "lucide-react";

export default function Home() {
  // Define shared state
  const [character, setCharacter] = useState<CharacterStats>({
    name: "Craftmaster",
    level: 5,
    experience: 240,
    experienceToNextLevel: 500,
    strength: 8,
    speed: 6,
    health: 100,
    maxHealth: 100,
    magicPoints: 50,
    maxMagicPoints: 50,
    image: "/placeholder-user.jpg",
    gold: 500,
    gems: 10,
    craftingStats: {
      metalworking: 3,
      magicworking: 2,
      spellcraft: 2,
    },
    craftingExperience: {
      metalworking: 150,
      magicworking: 80,
      spellcraft: 120,
    },
    equipment: {
      rings: [],
    }
  });

  const [inventory, setInventory] = useState([
    { id: "wood", quantity: 5 },
    { id: "stone", quantity: 3 },
    { id: "iron", quantity: 2 },
    { id: "leather", quantity: 4 },
    { id: "herb", quantity: 3 },
    { id: "crystal", quantity: 2 },
    { id: "magic_potion", quantity: 2 },
  ]);

  // Handle consuming a magic potion
  const handleConsumeMagicPotion = () => {
    const potionIndex = inventory.findIndex(item => item.id === "magic_potion");
    if (potionIndex >= 0 && inventory[potionIndex].quantity > 0) {
      // Update inventory
      const newInventory = [...inventory];
      newInventory[potionIndex].quantity -= 1;
      if (newInventory[potionIndex].quantity <= 0) {
        newInventory.splice(potionIndex, 1);
      }
      setInventory(newInventory);
      
      // Update character mana
      setCharacter(prev => ({
        ...prev,
        magicPoints: Math.min(prev.maxMagicPoints, prev.magicPoints + 25)
      }));
      
      return true;
    }
    return false;
  };

  // Handle character updates
  const handleUpdateCharacter = (updatedCharacter: typeof character) => {
    setCharacter(updatedCharacter);
  };

  // Handle inventory updates
  const handleUpdateInventory = (updatedInventory: typeof inventory) => {
    setInventory(updatedInventory);
  };

  // Handle equipping an item
  const handleEquipItem = (itemId: string, slot: any) => {
    const newCharacter = { ...character };
    
    // Handle rings separately since they can have multiple slots
    if (slot === "rings") {
      // Find the first empty ring slot or add to the end
      const emptyIndex = newCharacter.equipment.rings.findIndex(ring => !ring);
      if (emptyIndex !== -1) {
        newCharacter.equipment.rings[emptyIndex] = itemId;
      } else {
        newCharacter.equipment.rings.push(itemId);
      }
    } else {
      // For other slots, just assign the item
      (newCharacter.equipment as any)[slot] = itemId;
    }
    
    // Remove the item from inventory
    const newInventory = [...inventory];
    const itemIndex = newInventory.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      newInventory[itemIndex].quantity -= 1;
      if (newInventory[itemIndex].quantity <= 0) {
        newInventory.splice(itemIndex, 1);
      }
    }
    
    setCharacter(newCharacter);
    setInventory(newInventory);
  };

  // Handle unequipping an item
  const handleUnequipItem = (slot: any, ringIndex?: number) => {
    const newCharacter = { ...character };
    let itemId: string | undefined;
    
    // Handle rings separately
    if (slot === "rings" && ringIndex !== undefined) {
      itemId = newCharacter.equipment.rings[ringIndex];
      if (itemId) {
        newCharacter.equipment.rings[ringIndex] = "";
      }
    } else {
      itemId = (newCharacter.equipment as any)[slot];
      if (itemId) {
        (newCharacter.equipment as any)[slot] = undefined;
      }
    }
    
    // Add the item back to inventory
    if (itemId) {
      const newInventory = [...inventory];
      const existingItem = newInventory.find(item => item.id === itemId);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        newInventory.push({ id: itemId, quantity: 1 });
      }
      
      setInventory(newInventory);
    }
    
    setCharacter(newCharacter);
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
                setCharacter={setCharacter}
                inventory={inventory}
                setInventory={setInventory}
                gameItems={gameItems}
              />
            </TabsContent>

            <TabsContent value="marketplace">
              <Marketplace
                character={character}
                inventory={inventory}
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

