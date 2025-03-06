"use client"

import { Button } from "@/components/ui/button";
import { CharacterStats } from "@/components/character-sheet";
import { Item } from "@/components/item-slot";
import ItemSlot from "@/components/item-slot";
import { EquipmentSlot } from "@/lib/items";

interface EquipmentSelectionProps {
  selectedEquipSlot: EquipmentSlot;
  selectedRingIndex: number | null;
  character: CharacterStats;
  equippableItems: Array<Item & { quantity: number; id: string }>;
  onCancel: () => void;
  onUnequip: () => void;
  onEquip: (itemId: string) => void;
}

export default function EquipmentSelection({
  selectedEquipSlot,
  selectedRingIndex,
  character,
  equippableItems,
  onCancel,
  onUnequip,
  onEquip
}: EquipmentSelectionProps) {
  // Check if there's an item currently equipped in the selected slot
  const hasEquippedItem = selectedEquipSlot === "rings" 
    ? selectedRingIndex !== null && character.equipment.rings[selectedRingIndex]
    : character.equipment[selectedEquipSlot];

  return (
    <div className="mt-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-amber-400">
          Select {selectedEquipSlot.charAt(0).toUpperCase() + selectedEquipSlot.slice(1)}
          {selectedEquipSlot === "rings" && selectedRingIndex !== null && ` (Slot ${selectedRingIndex + 1})`}
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs h-7 border-red-900 bg-red-950/30 hover:bg-red-900/50 text-red-400"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
      
      {/* Unequip option */}
      {hasEquippedItem && (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-7 mb-2 border-amber-900 bg-amber-950/30 hover:bg-amber-900/50 text-amber-400"
          onClick={onUnequip}
        >
          Unequip Current Item
        </Button>
      )}
      
      {/* Equippable items */}
      <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
        {equippableItems.map((item) => (
          <div key={item.id} onClick={() => onEquip(item.id)}>
            <ItemSlot
              item={item}
              onDragStart={() => {}}
              quantity={item.quantity}
            />
          </div>
        ))}
        
        {equippableItems.length === 0 && (
          <div className="col-span-4 text-center text-gray-500 py-4">
            No equippable items found
          </div>
        )}
      </div>
    </div>
  );
} 