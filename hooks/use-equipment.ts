import { useState } from "react";
import { EquipmentSlot } from "@/lib/items";
import { Item } from "@/components/item-slot";
import { CharacterStats } from "@/components/character-sheet";

interface UseEquipmentProps {
  character: CharacterStats;
  inventory: Array<{ id: string; quantity: number }>;
  gameItems: Record<string, Item>;
  onEquipItem: (itemId: string, slot: EquipmentSlot) => void;
  onUnequipItem: (slot: EquipmentSlot, ringIndex?: number) => void;
}

interface UseEquipmentReturn {
  selectedEquipSlot: EquipmentSlot | null;
  selectedRingIndex: number | null;
  handleSelectEquipSlot: (slot: EquipmentSlot, ringIndex?: number) => void;
  handleEquipItem: (itemId: string) => void;
  handleUnequipItem: () => void;
  getEquippableItems: (slot: EquipmentSlot) => Array<Item & { quantity: number; id: string }>;
  resetSelection: () => void;
}

export const useEquipment = ({
  character,
  inventory,
  gameItems,
  onEquipItem,
  onUnequipItem
}: UseEquipmentProps): UseEquipmentReturn => {
  const [selectedEquipSlot, setSelectedEquipSlot] = useState<EquipmentSlot | null>(null);
  const [selectedRingIndex, setSelectedRingIndex] = useState<number | null>(null);

  // Handle selecting an equipment slot
  const handleSelectEquipSlot = (slot: EquipmentSlot, ringIndex?: number) => {
    setSelectedEquipSlot(slot);
    if (slot === "rings") {
      setSelectedRingIndex(ringIndex || 0);
    } else {
      setSelectedRingIndex(null);
    }
  };

  // Handle equipping an item
  const handleEquipItem = (itemId: string) => {
    if (selectedEquipSlot) {
      if (selectedEquipSlot === "rings" && selectedRingIndex !== null) {
        onEquipItem(itemId, selectedEquipSlot);
      } else {
        onEquipItem(itemId, selectedEquipSlot);
      }
      resetSelection();
    }
  };

  // Handle unequipping an item
  const handleUnequipItem = () => {
    if (selectedEquipSlot) {
      if (selectedEquipSlot === "rings" && selectedRingIndex !== null) {
        onUnequipItem(selectedEquipSlot, selectedRingIndex);
      } else {
        onUnequipItem(selectedEquipSlot);
      }
      resetSelection();
    }
  };

  // Reset selection
  const resetSelection = () => {
    setSelectedEquipSlot(null);
    setSelectedRingIndex(null);
  };

  // Get equippable items from inventory for a specific slot
  const getEquippableItems = (slot: EquipmentSlot) => {
    return inventory
      .filter(item => {
        const gameItem = gameItems[item.id];
        // Check if gameItem exists before accessing its properties
        return gameItem && gameItem.equippable && gameItem.slot === slot;
      })
      .map(item => ({
        ...gameItems[item.id],
        quantity: item.quantity,
        id: item.id
      }));
  };

  return {
    selectedEquipSlot,
    selectedRingIndex,
    handleSelectEquipSlot,
    handleEquipItem,
    handleUnequipItem,
    getEquippableItems,
    resetSelection
  };
}; 