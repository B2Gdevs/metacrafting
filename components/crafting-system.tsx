"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { gameItems } from "@/lib/items"
import { recipes } from "@/lib/recipes"
import { AlertTriangle, Book, CheckCircle, Info, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { type CharacterStats } from "./character-sheet"
import RecipeBook from "./recipe-book"

// Import new components
import CraftingCharacterStats from "./crafting/crafting-character-stats"
import CraftingControlsPanel from "./crafting/crafting-controls-panel"
import CraftingGridPanel from "./crafting/crafting-grid-panel"
import CraftingInventory from "./crafting/crafting-inventory"
import DebugInventory from "./crafting/debug-inventory"

// Import hook
import { useCrafting } from "@/hooks/use-crafting"

type InventoryItem = {
  id: string
  quantity: number
  craftingPattern?: string
  itemHash?: string
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
    setCraftingNotification,
    
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
  console.log("updatedInventory", updatedInventory)

      }
    }
  });

  // Add useEffect to automatically clear notifications after a delay
  useEffect(() => {
    if (craftingNotification) {
      const timer = setTimeout(() => {
        // This will trigger a re-render in the useCrafting hook
        // which will clear the notification
        if (craftingNotification) {
          handleCraftingNotificationDismiss();
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [craftingNotification]);

  // Add a handler to dismiss notifications
  const handleCraftingNotificationDismiss = () => {
    setCraftingNotification(null);
  };


  return (
    <div className="container mx-auto p-4">
      <ToastProvider>
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

        {/* Replace the inline notification with a Toast */}
        {craftingNotification && (
          <Toast
            variant={craftingNotification.type === 'success' ? 'default' : 'destructive'}
            className={`${
              craftingNotification.type === 'success' 
                ? 'bg-green-900/90 border-green-700 text-green-100' 
                : 'bg-red-900/90 border-red-700 text-red-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {craftingNotification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              )}
              <span>{craftingNotification.message}</span>
            </div>
          </Toast>
        )}
        
        {/* Add Debug Inventory component */}
        <DebugInventory 
          inventory={inventory}
          onUpdateInventory={onUpdateInventory}
        />
        
        <ToastViewport />
      </ToastProvider>

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
          </div>
        </div>
      </div>
    </div>
  )
}

