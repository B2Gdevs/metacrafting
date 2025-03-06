"use client"

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { FilterType, RarityType } from "@/hooks/use-inventory-filter";

interface InventoryFiltersProps {
  inventoryFilter: string;
  setInventoryFilter: (filter: string) => void;
  rarityFilter: string;
  setRarityFilter: (filter: string) => void;
  showEquippableOnly: boolean;
  setShowEquippableOnly: (show: boolean) => void;
}

export default function InventoryFilters({
  inventoryFilter,
  setInventoryFilter,
  rarityFilter,
  setRarityFilter,
  showEquippableOnly,
  setShowEquippableOnly
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 pb-3 border-b border-amber-900/50 mb-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-amber-400" />
        <span className="text-sm text-amber-400 font-medium">FILTERS:</span>
      </div>
      
      <Select value={inventoryFilter} onValueChange={(value) => setInventoryFilter(value)}>
        <SelectTrigger className="h-8 w-32 bg-gray-800/80 border-amber-900/50 hover:border-amber-500/70 transition-colors">
          <SelectValue placeholder="Item Type" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-amber-900">
          <SelectItem value={FilterType.All}>All Types</SelectItem>
          <SelectItem value={FilterType.Weapon}>Weapons</SelectItem>
          <SelectItem value={FilterType.Armor}>Armor</SelectItem>
          <SelectItem value={FilterType.Accessory}>Accessories</SelectItem>
          <SelectItem value={FilterType.Potion}>Potions</SelectItem>
          <SelectItem value={FilterType.Ingredient}>Ingredients</SelectItem>
          <SelectItem value={FilterType.Tool}>Tools</SelectItem>
          <SelectItem value={FilterType.Magical}>Magical</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={rarityFilter} onValueChange={(value) => setRarityFilter(value)}>
        <SelectTrigger className="h-8 w-32 bg-gray-800/80 border-amber-900/50 hover:border-amber-500/70 transition-colors">
          <SelectValue placeholder="Rarity" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-amber-900">
          <SelectItem value={RarityType.All}>All Rarities</SelectItem>
          <SelectItem value={RarityType.Common}>Common</SelectItem>
          <SelectItem value={RarityType.Uncommon}>Uncommon</SelectItem>
          <SelectItem value={RarityType.Rare}>Rare</SelectItem>
          <SelectItem value={RarityType.Epic}>Epic</SelectItem>
          <SelectItem value={RarityType.Legendary}>Legendary</SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        size="sm" 
        variant={showEquippableOnly ? "default" : "outline"}
        className={`h-8 text-xs ${showEquippableOnly ? 'bg-amber-900/80 text-amber-100 hover:bg-amber-800' : 'border-amber-900/50 text-amber-400 hover:border-amber-500/70'}`}
        onClick={() => setShowEquippableOnly(!showEquippableOnly)}
      >
        Equippable Only
      </Button>
    </div>
  );
} 