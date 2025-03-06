"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Book, HelpCircle, Sparkles, Filter, ArrowDownUp, Flame, X, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ItemSlot, { type Item, type ItemType, type ItemRarity } from "./item-slot"
import RecipeBook, { type Recipe, type RecipeCategory } from "./recipe-book"
import CharacterSheet, { type CharacterStats } from "./character-sheet"
import CraftingControls from "@/components/crafting-controls"
import { gameItems } from "@/lib/items"
import { recipes, CraftingControlType } from "@/lib/recipes"
import { EquipmentSlot } from "@/lib/items"
import { Slider } from "@/components/ui/slider"

// Import new components
import CraftingCharacterStats from "./crafting/crafting-character-stats"
import CraftingRecipeDetails from "./crafting/crafting-recipe-details"
import CraftingControlsPanel from "./crafting/crafting-controls-panel"
import CraftingGridPanel from "./crafting/crafting-grid-panel"
import CraftingInventory from "./crafting/crafting-inventory"

// Import hook
import { useCrafting } from "@/hooks/use-crafting"

type InventoryItem = {
  id: string
  quantity: number
}

export default function CraftingSystem() {
  // Character state
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
      spellcraft: 100,
    },
    equipment: {
      head: "",
      chest: "",
      legs: "",
      feet: "",
      hands: "",
      rings: ["", "", "", "", "", "", "", "", "", ""],
      weapon: "",
      offhand: "",
      neck: "",
    },
  })

  // Inventory state with quantities
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: "iron_ingot", quantity: 10 },
    { id: "copper_ingot", quantity: 8 },
    { id: "silver_ingot", quantity: 5 },
    { id: "gold_ingot", quantity: 3 },
    { id: "mithril_ingot", quantity: 2 },
    { id: "leather", quantity: 12 },
    { id: "cloth", quantity: 15 },
    { id: "wood", quantity: 20 },
    { id: "gemstone", quantity: 7 },
    { id: "magic_essence", quantity: 5 },
    { id: "mana_crystal", quantity: 3 },
    { id: "dragon_scale", quantity: 1 },
    { id: "phoenix_feather", quantity: 1 },
    { id: "mana_potion", quantity: 3 },
  ])

  // Active tab state
  const [activeTab, setActiveTab] = useState("crafting")

  // Use the crafting hook
  const {
    // Grid state
    grid,
    isDraggingOver,
    highlightedCells,
    
    // Control state
    controlValues,
    
    // Recipe state
    selectedRecipe,
    
    // Handlers
    handleDragStart,
    handleDropOnGrid,
    handleDropOnInventory,
    handleControlChange,
    handleCraft,
    handleQuickCraft,
    clearGrid,
    handleConsumeMagicPotion,
    handleEquipItem,
    handleUnequipItem,
    handleInventoryItemClick,
    setSelectedRecipe,
    
    // Computed values
    successChance,
    hasCursedRing,
    manaPotionCount,
    magicCost
  } = useCrafting({
    character,
    inventory,
    gameItems,
    recipes,
    onUpdateCharacter: (updatedCharacter, updatedInventory) => {
      setCharacter(updatedCharacter);
      // If inventory is provided, update it separately
      if (updatedInventory) {
        setInventory(updatedInventory);
      }
    }
  });

  // Check if player has all required ingredients for the selected recipe
  const hasRequiredItems = () => {
    if (!selectedRecipe) return false;
    
    const requiredItems: Record<string, number> = {};
    selectedRecipe.inputs.forEach(itemId => {
      requiredItems[itemId] = (requiredItems[itemId] || 0) + 1;
    });
    
    return Object.entries(requiredItems).every(([itemId, count]) => {
      const inventoryItem = inventory.find(item => item.id === itemId);
      return inventoryItem && inventoryItem.quantity >= count;
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-amber-400 mb-6 flex items-center">
        <Sparkles className="mr-2 h-6 w-6" />
        Crafting Workshop
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="ml-2 cursor-help">
                <HelpCircle className="h-5 w-5 text-gray-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-md">
              <p>
                Craft powerful items by placing ingredients in the grid and adjusting the crafting controls.
                Different patterns in the grid will provide different bonuses to your crafted items.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 p-1">
          <TabsTrigger value="crafting" className="data-[state=active]:bg-gray-700">
            <Sparkles className="mr-2 h-4 w-4" />
            Crafting
          </TabsTrigger>
          <TabsTrigger value="recipes" className="data-[state=active]:bg-gray-700">
            <Book className="mr-2 h-4 w-4" />
            Recipe Book
          </TabsTrigger>
          <TabsTrigger value="character" className="data-[state=active]:bg-gray-700">
            <HelpCircle className="mr-2 h-4 w-4" />
            Character
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crafting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Character Stats and Recipe Details */}
            <div className="space-y-6">
              <CraftingCharacterStats
                character={character}
                onConsumeMagicPotion={handleConsumeMagicPotion}
                manaPotionCount={manaPotionCount}
              />
              
              <CraftingRecipeDetails
                recipe={selectedRecipe}
                gameItems={gameItems}
                successChance={successChance}
                controlValues={controlValues}
                magicCost={magicCost}
                magicPoints={character.magicPoints}
                onCraft={handleCraft}
                onClearGrid={clearGrid}
                hasRequiredItems={hasRequiredItems()}
              />
            </div>
            
            {/* Middle Column - Crafting Grid and Controls */}
            <div className="space-y-6">
              <CraftingGridPanel
                grid={grid}
                onDrop={handleDropOnGrid}
                isDraggingOver={isDraggingOver}
                highlightedCells={highlightedCells}
                selectedRecipe={selectedRecipe}
              />
              
              <CraftingControlsPanel
                controlValues={controlValues}
                onControlChange={handleControlChange}
                selectedRecipe={selectedRecipe}
                hasCursedRing={hasCursedRing}
                magicPoints={character.magicPoints}
                maxMagicPoints={character.maxMagicPoints}
              />
            </div>
            
            {/* Right Column - Inventory */}
            <div>
              <CraftingInventory
                inventory={inventory}
                gameItems={gameItems}
                onDragStart={handleDragStart}
                onDropArea={handleDropOnInventory}
              />
            </div>
          </div>
          
          {/* Crafting Tips */}
          <Alert className="bg-gray-800 border-amber-900">
            <AlertDescription className="text-gray-300">
              <strong className="text-amber-400">Crafting Tip:</strong> Experiment with different ingredient combinations and patterns to discover new recipes and effects.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="recipes">
          <RecipeBook
            recipes={recipes}
            gameItems={gameItems}
            characterStats={character}
            inventory={inventory}
            onQuickCraft={handleQuickCraft}
          />
        </TabsContent>

        <TabsContent value="character">
          <CharacterSheet
            character={character}
            onConsumeMagicPotion={handleConsumeMagicPotion}
            onUpdateCharacter={setCharacter}
            manaPotionCount={manaPotionCount}
            inventory={inventory}
            gameItems={gameItems}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

