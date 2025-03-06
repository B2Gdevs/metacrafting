"use client";

import { EquipmentSlot } from "@/lib/items";
import { Item } from "@/components/item-slot";

// Equipment slot constants
export const EQUIPMENT_SLOTS = {
  HEAD: "head" as EquipmentSlot,
  CHEST: "chest" as EquipmentSlot,
  LEGS: "legs" as EquipmentSlot,
  FEET: "feet" as EquipmentSlot,
  HANDS: "hands" as EquipmentSlot,
  RINGS: "rings" as EquipmentSlot,
  WEAPON: "weapon" as EquipmentSlot,
  OFFHAND: "offhand" as EquipmentSlot,
  NECK: "neck" as EquipmentSlot,
};

// Equipment slot display names
export const EQUIPMENT_SLOT_LABELS = {
  head: "Head",
  chest: "Chest",
  legs: "Legs",
  feet: "Feet",
  hands: "Hands",
  rings: "Rings",
  weapon: "Weapon",
  offhand: "Offhand",
  neck: "Neck",
} as Record<EquipmentSlot, string>;

// Equipment slot layout configuration
export const EQUIPMENT_LAYOUT = {
  TOP_ROW: [EQUIPMENT_SLOTS.HEAD, EQUIPMENT_SLOTS.NECK, EQUIPMENT_SLOTS.RINGS],
  MIDDLE_ROW: [EQUIPMENT_SLOTS.HANDS, EQUIPMENT_SLOTS.CHEST, EQUIPMENT_SLOTS.OFFHAND],
  BOTTOM_ROW: [EQUIPMENT_SLOTS.WEAPON, EQUIPMENT_SLOTS.LEGS, EQUIPMENT_SLOTS.FEET],
};

// Combat stat labels
export const COMBAT_STAT_LABELS = {
  ATTACK: "Attack",
  DEFENSE: "Defense",
  MAGIC_ATTACK: "Magic Attack",
  MAGIC_DEFENSE: "Magic Defense",
  SPEED: "Speed",
  CRIT_CHANCE: "Crit Chance",
  CRIT_DAMAGE: "Crit Damage",
};

// Helper function to create a drop handler for equipment slots
export const createEquipmentDropHandler = (
  selectedItem: string | null,
  onEquip: (itemId: string, slot: EquipmentSlot) => void,
  slot: EquipmentSlot,
  ringIndex?: number
) => {
  return () => {
    if (selectedItem) {
      onEquip(selectedItem, slot);
    }
    return { 
      type: "equipment", 
      slot, 
      ...(ringIndex !== undefined ? { index: ringIndex } : {})
    };
  };
};

// Helper function to format element name
export const formatElementName = (element: string): string => {
  return element.charAt(0).toUpperCase() + element.slice(1);
}; 