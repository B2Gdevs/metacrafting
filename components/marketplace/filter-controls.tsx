"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { FilterState } from "@/lib/store";
import { CurrencyType } from "@/lib/marketplace-types";
import { formatStatName } from "@/lib/marketplace-utils";

interface FilterControlsProps {
  filterState: FilterState;
  updateFilterState: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function FilterControls({
  filterState,
  updateFilterState,
  resetFilters,
  searchTerm,
  setSearchTerm
}: FilterControlsProps) {
  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});
  
  const toggleStatExpanded = (stat: string) => {
    setExpandedStats(prev => ({
      ...prev,
      [stat]: !prev[stat]
    }));
  };
  
  // Handle currency checkbox changes
  const handleCurrencyChange = (currency: CurrencyType, checked: boolean) => {
    updateFilterState({
      currencies: {
        ...filterState.currencies,
        [currency]: checked
      }
    });
  };
  
  // Handle price range changes
  const handlePriceRangeChange = (values: number[], currency: 'gold' | 'gems') => {
    if (currency === 'gold') {
      updateFilterState({
        minPrice: values[0],
        maxPrice: values[1]
      });
    } else {
      updateFilterState({
        minGemsPrice: values[0],
        maxGemsPrice: values[1]
      });
    }
  };
  
  // Handle stat range changes
  const handleStatRangeChange = (stat: string, values: number[]) => {
    updateFilterState({
      stats: {
        ...filterState.stats,
        [stat]: [values[0], values[1]]
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Item Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type-filter">Item Type</Label>
          <Select 
            value={filterState.type} 
            onValueChange={(value) => updateFilterState({ type: value })}
          >
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="Select item type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="weapon">Weapons</SelectItem>
              <SelectItem value="armor">Armor</SelectItem>
              <SelectItem value="accessory">Accessories</SelectItem>
              <SelectItem value="potion">Potions</SelectItem>
              <SelectItem value="ingredient">Ingredients</SelectItem>
              <SelectItem value="magical">Magical Items</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Rarity Filter */}
        <div className="space-y-2">
          <Label htmlFor="rarity-filter">Rarity</Label>
          <Select 
            value={filterState.rarity} 
            onValueChange={(value) => updateFilterState({ rarity: value })}
          >
            <SelectTrigger id="rarity-filter">
              <SelectValue placeholder="Select rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities</SelectItem>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="uncommon">Uncommon</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
              <SelectItem value="mythic">Mythic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Currency Filter */}
        <div className="space-y-2">
          <Label>Currency</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="gold-currency" 
                checked={filterState.currencies[CurrencyType.GOLD]}
                onCheckedChange={(checked) => 
                  handleCurrencyChange(CurrencyType.GOLD, checked as boolean)
                }
              />
              <Label htmlFor="gold-currency" className="text-amber-400">Gold</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="gems-currency" 
                checked={filterState.currencies[CurrencyType.GEMS]}
                onCheckedChange={(checked) => 
                  handleCurrencyChange(CurrencyType.GEMS, checked as boolean)
                }
              />
              <Label htmlFor="gems-currency" className="text-blue-400">Gems</Label>
            </div>
            
            <div className="text-xs text-gray-400 mt-1 italic">
              <p>• When both are checked: Show all items with either gold or gem prices</p>
              <p>• When only Gold is checked: Show only items with gold prices</p>
              <p>• When only Gems is checked: Show only items with gem prices</p>
              <p>• When both are unchecked: No items will be shown</p>
              <p>• Items requiring both currencies will only appear when both are checked</p>
              <p>• Price ranges apply to all visible items with that currency</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Price Range Filters */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="gold-price-range" className="text-amber-400">Gold Price Range</Label>
            <span className="text-xs text-gray-400">
              {filterState.minPrice} - {filterState.maxPrice}
            </span>
          </div>
          <Slider
            id="gold-price-range"
            min={0}
            max={1000}
            step={10}
            value={[filterState.minPrice, filterState.maxPrice]}
            onValueChange={(values) => handlePriceRangeChange(values, 'gold')}
            className="py-4"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="gems-price-range" className="text-blue-400">Gems Price Range</Label>
            <span className="text-xs text-gray-400">
              {filterState.minGemsPrice} - {filterState.maxGemsPrice}
            </span>
          </div>
          <Slider
            id="gems-price-range"
            min={0}
            max={100}
            step={1}
            value={[filterState.minGemsPrice, filterState.maxGemsPrice]}
            onValueChange={(values) => handlePriceRangeChange(values, 'gems')}
            className="py-4"
          />
        </div>
      </div>
      
      {/* Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="equippable-only" 
            checked={filterState.showEquippableOnly}
            onCheckedChange={(checked) => 
              updateFilterState({ showEquippableOnly: checked as boolean })
            }
          />
          <Label htmlFor="equippable-only">Equippable Items Only</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="with-stats-only" 
            checked={filterState.showWithStatsOnly}
            onCheckedChange={(checked) => 
              updateFilterState({ showWithStatsOnly: checked as boolean })
            }
          />
          <Label htmlFor="with-stats-only">Items With Stats Only</Label>
        </div>
      </div>
      
      {/* Stat Range Filters */}
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="stat-filters">
          <AccordionTrigger>Stat Filters</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {Object.entries(filterState.stats).map(([stat, [min, max]]) => (
                <div key={stat} className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor={`${stat}-range`} className="capitalize">{formatStatName(stat)}</Label>
                    <span className="text-xs text-gray-400">
                      {min} - {max}
                    </span>
                  </div>
                  <Slider
                    id={`${stat}-range`}
                    min={0}
                    max={100}
                    step={1}
                    value={[min, max]}
                    onValueChange={(values) => handleStatRangeChange(stat, values)}
                    className="py-4"
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Reset Filters Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={resetFilters}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
} 