"use client";

import React, { RefObject } from "react";
import { useDrop } from "react-dnd";
import type { DropTargetMonitor } from 'react-dnd';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import ItemSlot from "@/components/item-slot";
import { Item } from "@/components/item-slot";
import { EquipmentSlot } from "@/lib/items";
import { calculateCombatStats } from "@/lib/combat-utils";
import { CharacterStats } from "@/components/character-sheet";
import { gameItems } from "@/lib/items";

interface EquipmentLayoutProps {
  character: CharacterStats;
  onEquip: (itemId: string, slot: EquipmentSlot) => void;
  onUnequip: (slot: EquipmentSlot, ringIndex?: number) => void;
  selectedItem: string | null;
}

export default function EquipmentLayout({
  character,
  onEquip,
  onUnequip,
  selectedItem
}: EquipmentLayoutProps) {
  // Calculate combat stats based on equipped items
  const equippedItems: Record<string, Item> = {};
  
  // Add equipped items from character
  Object.entries(character.equipment).forEach(([slot, item]) => {
    if (slot === "rings") {
      // Handle arrays like rings
      if (Array.isArray(item)) {
        item.forEach((ringItem, index) => {
          if (ringItem && typeof ringItem === 'string' && gameItems[ringItem]) {
            equippedItems[`${slot}_${index}`] = gameItems[ringItem];
          }
        });
      }
    } else if (item && typeof item === 'string' && gameItems[item]) {
      // Handle single items
      equippedItems[slot] = gameItems[item];
    }
  });
  
  const combatStats = calculateCombatStats(character, equippedItems);

  // Set up drop target for equipment slots
  const [{ isOver: isOverHead }, dropHead] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      if (selectedItem) onEquip(selectedItem, "head");
      return { type: "equipment", slot: "head" };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isOver: isOverChest }, dropChest] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      if (selectedItem) onEquip(selectedItem, "chest");
      return { type: "equipment", slot: "chest" };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isOver: isOverLegs }, dropLegs] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      if (selectedItem) onEquip(selectedItem, "legs");
      return { type: "equipment", slot: "legs" };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isOver: isOverFeet }, dropFeet] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      if (selectedItem) onEquip(selectedItem, "feet");
      return { type: "equipment", slot: "feet" };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isOver: isOverHands }, dropHands] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      if (selectedItem) onEquip(selectedItem, "hands");
      return { type: "equipment", slot: "hands" };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isOver: isOverWeapon }, dropWeapon] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      if (selectedItem) onEquip(selectedItem, "weapon");
      return { type: "equipment", slot: "weapon" };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isOver: isOverOffhand }, dropOffhand] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      if (selectedItem) onEquip(selectedItem, "offhand");
      return { type: "equipment", slot: "offhand" };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isOver: isOverRing1 }, dropRing1] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      if (selectedItem) onEquip(selectedItem, "rings" as EquipmentSlot);
      return { type: "equipment", slot: "rings", index: 0 };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isOver: isOverRing2 }, dropRing2] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      if (selectedItem) onEquip(selectedItem, "rings" as EquipmentSlot);
      return { type: "equipment", slot: "rings", index: 1 };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [{ isOver: isOverNeck }, dropNeck] = useDrop({
    accept: "INVENTORY_ITEM",
    drop: () => {
      if (selectedItem) onEquip(selectedItem, "neck");
      return { type: "equipment", slot: "neck" };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
          <CardDescription>Drag items to equip them</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Top row */}
            <div className="flex justify-center">
              <div ref={dropHead as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.head || null}
                  label="Head"
                  isOver={isOverHead}
                  onRemove={() => onUnequip("head")}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div ref={dropNeck as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.neck || null}
                  label="Neck"
                  isOver={isOverNeck}
                  onRemove={() => onUnequip("neck")}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="mb-1 text-xs text-center">Rings</div>
                <div className="flex gap-2">
                  <div ref={dropRing1 as unknown as RefObject<HTMLDivElement>}>
                    <ItemSlot
                      item={character.equipment.rings?.[0] || null}
                      label="1"
                      isOver={isOverRing1}
                      onRemove={() => onUnequip("rings", 0)}
                      size="small"
                    />
                  </div>
                  <div ref={dropRing2 as unknown as RefObject<HTMLDivElement>}>
                    <ItemSlot
                      item={character.equipment.rings?.[1] || null}
                      label="2"
                      isOver={isOverRing2}
                      onRemove={() => onUnequip("rings", 1)}
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle row */}
            <div className="flex justify-center">
              <div ref={dropHands as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.hands || null}
                  label="Hands"
                  isOver={isOverHands}
                  onRemove={() => onUnequip("hands")}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div ref={dropChest as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.chest || null}
                  label="Chest"
                  isOver={isOverChest}
                  onRemove={() => onUnequip("chest")}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div ref={dropOffhand as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.offhand || null}
                  label="Offhand"
                  isOver={isOverOffhand}
                  onRemove={() => onUnequip("offhand")}
                />
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex justify-center">
              <div ref={dropWeapon as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.weapon || null}
                  label="Weapon"
                  isOver={isOverWeapon}
                  onRemove={() => onUnequip("weapon")}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div ref={dropLegs as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.legs || null}
                  label="Legs"
                  isOver={isOverLegs}
                  onRemove={() => onUnequip("legs")}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div ref={dropFeet as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.feet || null}
                  label="Feet"
                  isOver={isOverFeet}
                  onRemove={() => onUnequip("feet")}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Combat Stats</CardTitle>
          <CardDescription>Stats based on your equipment and character</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Attack:</span>
                <span className="font-medium">{combatStats.attack}</span>
              </div>
              <div className="flex justify-between">
                <span>Defense:</span>
                <span className="font-medium">{combatStats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span>Magic Attack:</span>
                <span className="font-medium">{combatStats.magicAttack}</span>
              </div>
              <div className="flex justify-between">
                <span>Magic Defense:</span>
                <span className="font-medium">{combatStats.magicDefense}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Speed:</span>
                <span className="font-medium">{combatStats.speed}</span>
              </div>
              <div className="flex justify-between">
                <span>Crit Chance:</span>
                <span className="font-medium">{combatStats.critChance}%</span>
              </div>
              <div className="flex justify-between">
                <span>Crit Damage:</span>
                <span className="font-medium">{combatStats.critDamage}%</span>
              </div>
            </div>
          </div>

          {/* Elemental Resistances */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Elemental Resistances</h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(combatStats.elementalResistances).map(([element, value]) => (
                <div key={element} className="flex flex-col items-center">
                  <Badge variant={value > 0 ? "default" : "outline"} className="mb-1">
                    {element.charAt(0).toUpperCase() + element.slice(1)}
                  </Badge>
                  <span className={value > 0 ? "text-green-500" : ""}>{value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Special Skills */}
          {combatStats.specialSkills.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Special Skills</h3>
              <div className="space-y-2">
                {combatStats.specialSkills.map((skill, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="mr-2">
                          {skill.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="w-64 p-2">
                          <h4 className="font-bold">{skill.name}</h4>
                          <p className="text-xs">{skill.description}</p>
                          <div className="mt-1 text-xs">
                            <div>Type: {skill.type}</div>
                            {skill.element && <div>Element: {skill.element}</div>}
                            <div>Power: {skill.basePower}</div>
                            <div>Mana Cost: {skill.manaCost}</div>
                            <div>Cooldown: {skill.cooldown} turns</div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 