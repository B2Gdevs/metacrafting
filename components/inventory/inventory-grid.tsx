"use client"

import { Item, ItemType, ItemRarity } from "@/components/item-slot";
import ItemSlot from "@/components/item-slot";
import { EquipmentSlot } from "@/lib/items";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PatternVisual from "@/components/crafting/pattern-visual";

interface InventoryGridProps {
  items: Array<{ 
    id: string; 
    quantity: number; 
    gameItem: Item;
    craftingPattern?: string;
    itemHash?: string;
  }>;
  onSelectEquipSlot?: (slot: EquipmentSlot) => void;
  onEquipItem?: (itemId: string) => void;
  emptyMessage?: string;
  slotsPerRow?: number;
  minRows?: number;
}

export default function InventoryGrid({
  items,
  onSelectEquipSlot,
  onEquipItem,
  emptyMessage = "No items match the selected filters",
  slotsPerRow = 7,
  minRows = 5
}: InventoryGridProps) {
  // Calculate how many rows we need (minimum of minRows)
  const rowsNeeded = Math.max(minRows, Math.ceil(items.length / slotsPerRow));
  const totalSlots = rowsNeeded * slotsPerRow;

  return (
    <div className="relative">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-amber-900/10 rounded-lg blur-xl z-0"></div>
      
      {/* Inventory Grid */}
      <div className="relative bg-gray-900/80 border border-amber-900/30 rounded-lg p-4 shadow-lg backdrop-blur-sm z-10">
        <div className="grid grid-cols-7 gap-2 max-h-[400px] overflow-y-auto p-1">
          {/* Create a fixed grid of identical empty slots */}
          {Array.from({ length: totalSlots }).map((_, index) => {
            const inventoryItem = items[index];
            
            return (
              <div 
                key={index} 
                className="aspect-square rounded-md border border-gray-700/30 bg-gray-800/40 flex items-center justify-center"
              >
                {inventoryItem && (
                  <div className="w-full h-full flex items-center justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <ItemSlot
                              item={inventoryItem.gameItem}
                              onDragStart={() => {}}
                              quantity={inventoryItem.quantity}
                              onClick={() => {
                                if (onSelectEquipSlot && 
                                    onEquipItem && 
                                    inventoryItem.gameItem && 
                                    inventoryItem.gameItem.equippable && 
                                    inventoryItem.gameItem.slot) {
                                  onSelectEquipSlot(inventoryItem.gameItem.slot as EquipmentSlot)
                                  onEquipItem(inventoryItem.id)
                                }
                              }}
                              size="small"
                              disableTooltip={true}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="w-72 p-4">
                          <div className="space-y-3">
                            <div>
                              <p className="font-medium text-lg">{inventoryItem.gameItem.name}</p>
                              <p className="text-sm text-gray-400">{inventoryItem.gameItem.description}</p>
                            </div>
                            
                            {inventoryItem.gameItem.stats && Object.keys(inventoryItem.gameItem.stats).length > 0 && (
                              <div className="mt-2 bg-gray-900/50 p-2 rounded">
                                <p className="text-xs font-medium text-gray-400 mb-1">Stats:</p>
                                <div className="space-y-1">
                                  {Object.entries(inventoryItem.gameItem.stats).map(([stat, value]) => (
                                    <div key={stat} className="flex justify-between text-xs">
                                      <span className="text-gray-400">{stat}</span>
                                      <span className="text-blue-400">+{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {inventoryItem.craftingPattern && inventoryItem.craftingPattern !== "none" && (
                              <div className="mt-2 bg-gray-900/50 p-2 rounded">
                                <p className="text-xs font-medium text-gray-400 mb-1">Crafting Patterns:</p>
                                <PatternVisual pattern={inventoryItem.craftingPattern} />
                              </div>
                            )}
                            
                            {!inventoryItem.craftingPattern && (
                              <p className="text-xs italic text-gray-500 mt-2">Not crafted by you</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {items.length === 0 && (
          <div className="text-center text-amber-400/70 py-12 italic">
            {emptyMessage}
          </div>
        )}
        
        {/* Item count display */}
        <div className="mt-3 text-right text-sm text-amber-400/70">
          {items.length} items
        </div>
      </div>
    </div>
  );
} 