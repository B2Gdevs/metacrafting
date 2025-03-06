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
  inventory: Array<{ id: string; quantity: number }>;
  gameItems: Record<string, Item>;
}

interface UseInventoryFilterReturn {
  inventoryFilter: FilterType | string;
  setInventoryFilter: (filter: FilterType | string) => void;
  rarityFilter: RarityType | string;
  setRarityFilter: (filter: RarityType | string) => void;
  showEquippableOnly: boolean;
  setShowEquippableOnly: (show: boolean) => void;
  filteredInventory: Array<{ id: string; quantity: number; gameItem: Item }>;
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
        
        // Skip if game item doesn't exist
        if (!gameItem) return false;
        
        // Type filter
        if (inventoryFilter !== FilterType.All && gameItem.type !== inventoryFilter) {
          return false;
        }
        
        // Rarity filter
        if (rarityFilter !== RarityType.All && gameItem.rarity !== rarityFilter) {
          return false;
        }
        
        // Equippable filter
        if (showEquippableOnly && !gameItem.equippable) {
          return false;
        }
        
        return true;
      })
      .map(item => ({
        ...item,
        gameItem: gameItems[item.id]
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