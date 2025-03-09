import { useState, useMemo } from "react";
import { Item, ItemRarity, ItemType } from "@/components/item-slot";

export enum FilterType {
  All = "all",
  Weapon = "weapon",
  Armor = "armor",
  Accessory = "accessory",
  Potion = "potion",
  Ingredient = "ingredient",
  Tool = "tool",
  Magical = "magical"
}

export enum RarityType {
  All = "all",
  Common = "common",
  Uncommon = "uncommon",
  Rare = "rare",
  Epic = "epic",
  Legendary = "legendary",
  Mythic = "mythic"
}

interface UseInventoryFilterProps {
  inventory: Array<{ id: string; quantity: number; craftingPattern?: string; itemHash?: string }>;
  gameItems: Record<string, Item>;
}

interface UseInventoryFilterReturn {
  inventoryFilter: FilterType | string;
  setInventoryFilter: (filter: FilterType | string) => void;
  rarityFilter: RarityType | string;
  setRarityFilter: (filter: RarityType | string) => void;
  showEquippableOnly: boolean;
  setShowEquippableOnly: (show: boolean) => void;
  filteredInventory: Array<{ 
    id: string; 
    quantity: number; 
    gameItem: Item; 
    craftingPattern?: string;
    itemHash?: string;
  }>;
}

export const useInventoryFilter = ({
  inventory,
  gameItems
}: UseInventoryFilterProps): UseInventoryFilterReturn => {
  const [inventoryFilter, setInventoryFilter] = useState<FilterType | string>(FilterType.All);
  const [rarityFilter, setRarityFilter] = useState<RarityType | string>(RarityType.All);
  const [showEquippableOnly, setShowEquippableOnly] = useState(false);

  // Filter inventory items based on current filters
  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => {
        const gameItem = gameItems[item.id];
        if (!gameItem) return false;
        
        // Filter by type
        if (inventoryFilter !== FilterType.All && gameItem.type !== inventoryFilter) {
          return false;
        }
        
        // Filter by rarity
        if (rarityFilter !== RarityType.All && gameItem.rarity !== rarityFilter) {
          return false;
        }
        
        // Filter by equippable
        if (showEquippableOnly && !gameItem.equippable) {
          return false;
        }
        
        return true;
      })
      .map(item => ({
        id: item.id,
        quantity: item.quantity,
        gameItem: gameItems[item.id],
        craftingPattern: item.craftingPattern,
        itemHash: item.itemHash
      }));
  }, [inventory, gameItems, inventoryFilter, rarityFilter, showEquippableOnly]);

  return {
    inventoryFilter,
    setInventoryFilter,
    rarityFilter,
    setRarityFilter,
    showEquippableOnly,
    setShowEquippableOnly,
    filteredInventory
  };
}; 