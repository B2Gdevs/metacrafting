"use client"

import { User } from "lucide-react";
import ItemSlot from "@/components/item-slot";
import { Item } from "@/components/item-slot";
import { EquipmentSlot } from "@/lib/items";

interface EquipmentSlotProps {
  slot: EquipmentSlot;
  label: string;
  itemId?: string;
  gameItem?: Item;
  ringIndex?: number;
  isSelected: boolean;
  onSelect: (slot: EquipmentSlot, ringIndex?: number) => void;
}

export default function EquipmentSlotComponent({
  slot,
  label,
  itemId,
  gameItem,
  ringIndex,
  isSelected,
  onSelect
}: EquipmentSlotProps) {
  return (
    <div 
      className={`relative border ${isSelected ? 'border-amber-500' : 'border-gray-700'} rounded-lg p-1 cursor-pointer`}
      onClick={() => onSelect(slot, ringIndex)}
    >
      <div className="text-xs text-gray-500 mb-1 text-center">{label}</div>
      <div className="w-12 h-12 mx-auto bg-gray-800 rounded flex items-center justify-center">
        {itemId && gameItem ? (
          <ItemSlot 
            item={gameItem} 
            onDragStart={() => {}} 
            isEquipped={true}
            showBadge={false}
          />
        ) : (
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
} 