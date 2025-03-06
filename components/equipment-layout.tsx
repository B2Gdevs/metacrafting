"use client";

import React, { RefObject, useMemo } from "react";
import { useDrop } from "react-dnd";
import type { DropTargetMonitor } from 'react-dnd';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ItemSlot from "@/components/item-slot";
import { Item } from "@/components/item-slot";
import { EquipmentSlot } from "@/lib/items";
import { calculateCombatStats } from "@/lib/combat-utils";
import { CharacterStats } from "@/components/character-sheet";
import { gameItems } from "@/lib/items";
import { 
  EQUIPMENT_SLOTS, 
  EQUIPMENT_SLOT_LABELS, 
  COMBAT_STAT_LABELS,
  createEquipmentDropHandler,
  formatElementName
} from "@/lib/equipment-utils";

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
  const equippedItems = useMemo(() => {
    const items: Record<string, Item> = {};
    
    // Add equipped items from character
    Object.entries(character.equipment).forEach(([slot, item]) => {
      if (slot === EQUIPMENT_SLOTS.RINGS) {
        // Handle arrays like rings
        if (Array.isArray(item)) {
          item.forEach((ringItem, index) => {
            if (ringItem && typeof ringItem === 'string' && gameItems[ringItem]) {
              items[`${slot}_${index}`] = gameItems[ringItem];
            }
          });
        }
      } else if (item && typeof item === 'string' && gameItems[item]) {
        // Handle single items
        items[slot] = gameItems[item];
      }
    });
    
    return items;
  }, [character.equipment]);
  
  const combatStats = calculateCombatStats(character, equippedItems);

  // Create drop handlers for each equipment slot
  const createDropRef = (slot: EquipmentSlot, ringIndex?: number) => {
    const dropHandler = createEquipmentDropHandler(selectedItem, onEquip, slot, ringIndex);
    
    const [{ isOver }, dropRef] = useDrop({
      accept: "INVENTORY_ITEM",
      drop: dropHandler,
      collect: (monitor: DropTargetMonitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });
    
    return { isOver, dropRef };
  };

  // Create drop refs for all equipment slots
  const headDrop = createDropRef(EQUIPMENT_SLOTS.HEAD);
  const chestDrop = createDropRef(EQUIPMENT_SLOTS.CHEST);
  const legsDrop = createDropRef(EQUIPMENT_SLOTS.LEGS);
  const feetDrop = createDropRef(EQUIPMENT_SLOTS.FEET);
  const handsDrop = createDropRef(EQUIPMENT_SLOTS.HANDS);
  const weaponDrop = createDropRef(EQUIPMENT_SLOTS.WEAPON);
  const offhandDrop = createDropRef(EQUIPMENT_SLOTS.OFFHAND);
  const neckDrop = createDropRef(EQUIPMENT_SLOTS.NECK);
  const ring1Drop = createDropRef(EQUIPMENT_SLOTS.RINGS, 0);
  const ring2Drop = createDropRef(EQUIPMENT_SLOTS.RINGS, 1);

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
              <div ref={headDrop.dropRef as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.head || null}
                  label={EQUIPMENT_SLOT_LABELS[EQUIPMENT_SLOTS.HEAD]}
                  isOver={headDrop.isOver}
                  onRemove={() => onUnequip(EQUIPMENT_SLOTS.HEAD)}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div ref={neckDrop.dropRef as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.neck || null}
                  label={EQUIPMENT_SLOT_LABELS[EQUIPMENT_SLOTS.NECK]}
                  isOver={neckDrop.isOver}
                  onRemove={() => onUnequip(EQUIPMENT_SLOTS.NECK)}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="mb-1 text-xs text-center">{EQUIPMENT_SLOT_LABELS[EQUIPMENT_SLOTS.RINGS]}</div>
                <div className="flex gap-2">
                  <div ref={ring1Drop.dropRef as unknown as RefObject<HTMLDivElement>}>
                    <ItemSlot
                      item={character.equipment.rings?.[0] || null}
                      label="1"
                      isOver={ring1Drop.isOver}
                      onRemove={() => onUnequip(EQUIPMENT_SLOTS.RINGS, 0)}
                      size="small"
                    />
                  </div>
                  <div ref={ring2Drop.dropRef as unknown as RefObject<HTMLDivElement>}>
                    <ItemSlot
                      item={character.equipment.rings?.[1] || null}
                      label="2"
                      isOver={ring2Drop.isOver}
                      onRemove={() => onUnequip(EQUIPMENT_SLOTS.RINGS, 1)}
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle row */}
            <div className="flex justify-center">
              <div ref={handsDrop.dropRef as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.hands || null}
                  label={EQUIPMENT_SLOT_LABELS[EQUIPMENT_SLOTS.HANDS]}
                  isOver={handsDrop.isOver}
                  onRemove={() => onUnequip(EQUIPMENT_SLOTS.HANDS)}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div ref={chestDrop.dropRef as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.chest || null}
                  label={EQUIPMENT_SLOT_LABELS[EQUIPMENT_SLOTS.CHEST]}
                  isOver={chestDrop.isOver}
                  onRemove={() => onUnequip(EQUIPMENT_SLOTS.CHEST)}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div ref={offhandDrop.dropRef as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.offhand || null}
                  label={EQUIPMENT_SLOT_LABELS[EQUIPMENT_SLOTS.OFFHAND]}
                  isOver={offhandDrop.isOver}
                  onRemove={() => onUnequip(EQUIPMENT_SLOTS.OFFHAND)}
                />
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex justify-center">
              <div ref={weaponDrop.dropRef as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.weapon || null}
                  label={EQUIPMENT_SLOT_LABELS[EQUIPMENT_SLOTS.WEAPON]}
                  isOver={weaponDrop.isOver}
                  onRemove={() => onUnequip(EQUIPMENT_SLOTS.WEAPON)}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div ref={legsDrop.dropRef as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.legs || null}
                  label={EQUIPMENT_SLOT_LABELS[EQUIPMENT_SLOTS.LEGS]}
                  isOver={legsDrop.isOver}
                  onRemove={() => onUnequip(EQUIPMENT_SLOTS.LEGS)}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div ref={feetDrop.dropRef as unknown as RefObject<HTMLDivElement>}>
                <ItemSlot
                  item={character.equipment.feet || null}
                  label={EQUIPMENT_SLOT_LABELS[EQUIPMENT_SLOTS.FEET]}
                  isOver={feetDrop.isOver}
                  onRemove={() => onUnequip(EQUIPMENT_SLOTS.FEET)}
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
                <span>{COMBAT_STAT_LABELS.ATTACK}:</span>
                <span className="font-medium">{combatStats.attack}</span>
              </div>
              <div className="flex justify-between">
                <span>{COMBAT_STAT_LABELS.DEFENSE}:</span>
                <span className="font-medium">{combatStats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span>{COMBAT_STAT_LABELS.MAGIC_ATTACK}:</span>
                <span className="font-medium">{combatStats.magicAttack}</span>
              </div>
              <div className="flex justify-between">
                <span>{COMBAT_STAT_LABELS.MAGIC_DEFENSE}:</span>
                <span className="font-medium">{combatStats.magicDefense}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{COMBAT_STAT_LABELS.SPEED}:</span>
                <span className="font-medium">{combatStats.speed}</span>
              </div>
              <div className="flex justify-between">
                <span>{COMBAT_STAT_LABELS.CRIT_CHANCE}:</span>
                <span className="font-medium">{combatStats.critChance}%</span>
              </div>
              <div className="flex justify-between">
                <span>{COMBAT_STAT_LABELS.CRIT_DAMAGE}:</span>
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
                    {formatElementName(element)}
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
                            {skill.element && <div>Element: {formatElementName(skill.element)}</div>}
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