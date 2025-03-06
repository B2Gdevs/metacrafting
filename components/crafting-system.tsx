"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { gameItems } from "@/lib/items"
import { recipes } from "@/lib/recipes"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Book, CheckCircle, Info, Sparkles } from "lucide-react"
import { useState } from "react"
import { type CharacterStats } from "./character-sheet"
import RecipeBook from "./recipe-book"

// Import new components
import CraftingCharacterStats from "./crafting/crafting-character-stats"
import CraftingControlsPanel from "./crafting/crafting-controls-panel"
import CraftingGridPanel from "./crafting/crafting-grid-panel"
import CraftingInventory from "./crafting/crafting-inventory"

// Import hook
import { useCrafting } from "@/hooks/use-crafting"

type InventoryItem = {
  id: string
  quantity: number
  craftingPattern?: string
}

interface CraftingSystemProps {
  character: CharacterStats;
  inventory: InventoryItem[];
  onUpdateCharacter: (updatedCharacter: CharacterStats) => void;
  onUpdateInventory: (updatedInventory: InventoryItem[]) => void;
  onConsumeMagicPotion: () => boolean;
}

export default function CraftingSystem({
  character,
  inventory,
  onUpdateCharacter,
  onUpdateInventory,
  onConsumeMagicPotion
}: CraftingSystemProps) {
  // Active tab state
  const [activeTab, setActiveTab] = useState("crafting")

  // Recipe book dialog state
  const [isRecipeBookOpen, setIsRecipeBookOpen] = useState(false)

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
    
    // Notification state
    craftingNotification,
    
    // Handlers
    handleDragStart,
    handleDropOnGrid,
    handleDropOnInventory,
    handleControlChange,
    handleCraft,
    handleQuickCraft,
    handleQuickAdd,
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
    magicCost,
    
    // Helper functions
    findMatchingRecipe
  } = useCrafting({
    character,
    inventory,
    gameItems,
    recipes,
    onUpdateCharacter: (updatedCharacter, updatedInventory) => {
      onUpdateCharacter(updatedCharacter);
      // If inventory is provided, update it separately
      if (updatedInventory) {
        onUpdateInventory(updatedInventory);
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
              <Info className="ml-2 h-4 w-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-md">
              <p className="text-sm">
                Drag ingredients from your inventory to the crafting grid. Select recipes from the recipe book to see what you can craft.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Recipe Book Dialog Trigger */}
        <Dialog open={isRecipeBookOpen} onOpenChange={setIsRecipeBookOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="ml-auto">
              <Book className="h-5 w-5 text-amber-400" />
              <span className="ml-2">Recipe Book</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <RecipeBook 
              recipes={recipes} 
              gameItems={gameItems} 
              onSelectRecipe={(recipe) => {
                setSelectedRecipe(recipe);
              }}
              onQuickCraft={(recipeId) => {
                handleQuickCraft(recipeId);
                setIsRecipeBookOpen(false);
              }}
              onQuickAdd={(recipe) => {
                handleQuickAdd(recipe);
                setIsRecipeBookOpen(false);
              }}
              inventory={inventory}
            />
          </DialogContent>
        </Dialog>
      </h1>

      {/* Crafting Notification */}
      <AnimatePresence>
        {craftingNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-3 rounded-md flex items-center ${
              craftingNotification.type === 'success' 
                ? 'bg-green-900/30 border border-green-700' 
                : 'bg-red-900/30 border border-red-700'
            }`}
          >
            {craftingNotification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            )}
            <p className={`text-sm ${
              craftingNotification.type === 'success' ? 'text-green-300' : 'text-red-300'
            }`}>
              {craftingNotification.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls and Character Stats */}
          <div className="space-y-6">
            {/* Crafting Controls at the top */}
            <CraftingControlsPanel
              controlValues={controlValues}
              onControlChange={handleControlChange}
              selectedRecipe={selectedRecipe}
              hasCursedRing={hasCursedRing}
              magicPoints={character.magicPoints}
              maxMagicPoints={character.maxMagicPoints}
            />
            
            {/* Character Stats below controls */}
            <CraftingCharacterStats
              character={character}
              onConsumeMagicPotion={handleConsumeMagicPotion}
              manaPotionCount={manaPotionCount}
            />
          </div>
          
          {/* Right Column - Grid and Inventory side by side */}
          <div className="space-y-6">
            {/* Crafting and Clear buttons at the top */}
            <div className="flex justify-center gap-4 mb-2">
              <button 
                className={`px-4 py-2 rounded-md font-medium ${
                  grid.some(item => item !== null) 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => handleCraft()}
                disabled={!grid.some(item => item !== null)}
              >
                Craft Item
              </button>
              <button 
                className="px-4 py-2 rounded-md border border-amber-700 text-amber-400 hover:bg-amber-900/20"
                onClick={clearGrid}
              >
                Clear Grid
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Crafting Grid */}
              <div>
                <CraftingGridPanel
                  grid={grid}
                  onDrop={handleDropOnGrid}
                  onDragStart={handleDragStart}
                  isDraggingOver={isDraggingOver}
                  highlightedCells={highlightedCells}
                  selectedRecipe={selectedRecipe}
                />
              </div>
              
              {/* Right side - Inventory aligned with grid */}
              <div>
                <CraftingInventory
                  inventory={inventory}
                  gameItems={gameItems}
                  onDragStart={handleDragStart}
                  onDropArea={handleDropOnInventory}
                />
              </div>
            </div>
            
            {/* Notification area for crafting success/failure */}
            {craftingNotification && (
              <div className={`mt-4 p-3 rounded-md ${
                craftingNotification.type === 'success' 
                  ? 'bg-green-900/30 border border-green-700 text-green-300' 
                  : 'bg-red-900/30 border border-red-700 text-red-300'
              }`}>
                {craftingNotification.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

