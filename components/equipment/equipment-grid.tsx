"use client"

import { CharacterStats } from "@/components/character-sheet";
import { Item } from "@/components/item-slot";
import { EquipmentSlot } from "@/lib/items";
import EquipmentSlotComponent from "./equipment-slot";

interface EquipmentGridProps {
  character: CharacterStats;
  gameItems: Record<string, Item>;
  selectedEquipSlot: EquipmentSlot | null;
  selectedRingIndex: number | null;
  onSelectEquipSlot: (slot: EquipmentSlot, ringIndex?: number) => void;
}

export default function EquipmentGrid({
  character,
  gameItems,
  selectedEquipSlot,
  selectedRingIndex,
  onSelectEquipSlot
}: EquipmentGridProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Character Avatar */}
      <div className="w-24 h-24 rounded-full bg-amber-900 border-2 border-amber-600 flex items-center justify-center overflow-hidden mb-4">
        <img
          src={character.image || "/placeholder-user.jpg"}
          alt="Character Avatar"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Equipment Grid with Rings on Sides */}
      <div className="grid grid-cols-5 gap-1 mb-4 w-full max-w-md">
        {/* Left Rings (0-4) */}
        <div className="flex flex-col gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`left-ring-${index}`} className="scale-90">
              <EquipmentSlotComponent
                slot="rings"
                label={`${index + 1}`}
                itemId={character.equipment.rings[index]}
                gameItem={character.equipment.rings[index] ? gameItems[character.equipment.rings[index]] : undefined}
                ringIndex={index}
                isSelected={selectedEquipSlot === "rings" && selectedRingIndex === index}
                onSelect={onSelectEquipSlot}
              />
            </div>
          ))}
        </div>
        
        {/* Center Equipment */}
        <div className="col-span-3 grid grid-rows-4 gap-1">
          {/* Head */}
          <div className="flex justify-center">
            <EquipmentSlotComponent
              slot="head"
              label="Head"
              itemId={character.equipment.head}
              gameItem={character.equipment.head ? gameItems[character.equipment.head] : undefined}
              isSelected={selectedEquipSlot === "head"}
              onSelect={onSelectEquipSlot}
            />
          </div>
          
          {/* Weapon, Chest, Offhand */}
          <div className="flex justify-between">
            <div className="scale-95">
              <EquipmentSlotComponent
                slot="weapon"
                label="Weapon"
                itemId={character.equipment.weapon}
                gameItem={character.equipment.weapon ? gameItems[character.equipment.weapon] : undefined}
                isSelected={selectedEquipSlot === "weapon"}
                onSelect={onSelectEquipSlot}
              />
            </div>
            <div className="scale-95">
              <EquipmentSlotComponent
                slot="chest"
                label="Chest"
                itemId={character.equipment.chest}
                gameItem={character.equipment.chest ? gameItems[character.equipment.chest] : undefined}
                isSelected={selectedEquipSlot === "chest"}
                onSelect={onSelectEquipSlot}
              />
            </div>
            <div className="scale-95">
              <EquipmentSlotComponent
                slot="offhand"
                label="Off"
                itemId={character.equipment.offhand}
                gameItem={character.equipment.offhand ? gameItems[character.equipment.offhand] : undefined}
                isSelected={selectedEquipSlot === "offhand"}
                onSelect={onSelectEquipSlot}
              />
            </div>
          </div>
          
          {/* Legs */}
          <div className="flex justify-center">
            <EquipmentSlotComponent
              slot="legs"
              label="Legs"
              itemId={character.equipment.legs}
              gameItem={character.equipment.legs ? gameItems[character.equipment.legs] : undefined}
              isSelected={selectedEquipSlot === "legs"}
              onSelect={onSelectEquipSlot}
            />
          </div>
          
          {/* Hands, Feet */}
          <div className="flex justify-around">
            <div className="scale-95">
              <EquipmentSlotComponent
                slot="hands"
                label="Hands"
                itemId={character.equipment.hands}
                gameItem={character.equipment.hands ? gameItems[character.equipment.hands] : undefined}
                isSelected={selectedEquipSlot === "hands"}
                onSelect={onSelectEquipSlot}
              />
            </div>
            <div className="scale-95">
              <EquipmentSlotComponent
                slot="feet"
                label="Feet"
                itemId={character.equipment.feet}
                gameItem={character.equipment.feet ? gameItems[character.equipment.feet] : undefined}
                isSelected={selectedEquipSlot === "feet"}
                onSelect={onSelectEquipSlot}
              />
            </div>
          </div>
        </div>
        
        {/* Right Rings (5-9) */}
        <div className="flex flex-col gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`right-ring-${index}`} className="scale-90">
              <EquipmentSlotComponent
                slot="rings"
                label={`${index + 6}`}
                itemId={character.equipment.rings[index + 5]}
                gameItem={character.equipment.rings[index + 5] ? gameItems[character.equipment.rings[index + 5]] : undefined}
                ringIndex={index + 5}
                isSelected={selectedEquipSlot === "rings" && selectedRingIndex === index + 5}
                onSelect={onSelectEquipSlot}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 