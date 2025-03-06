"use client"

import { Item } from "@/components/item-slot";
import ItemSlot from "@/components/item-slot";
import { EquipmentSlot } from "@/lib/items";

interface InventoryGridProps {
  items: Array<{ id: string; quantity: number; gameItem: Item }>;
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
                    />
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