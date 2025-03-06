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
import { FilterState } from "@/hooks/use-marketplace";
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

  return (
    <div className="bg-card p-4 rounded-lg shadow-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Item Type</Label>
        <Select
          value={filterState.type}
          onValueChange={(value) => updateFilterState({ type: value })}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="weapon">Weapons</SelectItem>
            <SelectItem value="armor">Armor</SelectItem>
            <SelectItem value="accessory">Accessories</SelectItem>
            <SelectItem value="consumable">Consumables</SelectItem>
            <SelectItem value="material">Materials</SelectItem>
            <SelectItem value="quest">Quest Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rarity">Rarity</Label>
        <Select
          value={filterState.rarity}
          onValueChange={(value) => updateFilterState({ rarity: value })}
        >
          <SelectTrigger id="rarity">
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

      <div className="space-y-2">
        <Label>Currency</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="gold-currency"
            checked={filterState.currencies.gold}
            onCheckedChange={(checked) => 
              updateFilterState({ 
                currencies: { 
                  ...filterState.currencies, 
                  gold: !!checked 
                } 
              })
            }
          />
          <Label htmlFor="gold-currency" className="cursor-pointer">Gold</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="gems-currency"
            checked={filterState.currencies.gems}
            onCheckedChange={(checked) => 
              updateFilterState({ 
                currencies: { 
                  ...filterState.currencies, 
                  gems: !!checked 
                } 
              })
            }
          />
          <Label htmlFor="gems-currency" className="cursor-pointer">Gems</Label>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="price-range">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Gold Price Range</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min={0}
                    value={filterState.minPrice}
                    onChange={(e) => updateFilterState({ minPrice: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    min={0}
                    value={filterState.maxPrice}
                    onChange={(e) => updateFilterState({ maxPrice: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                </div>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={[filterState.minPrice, filterState.maxPrice]}
                  onValueChange={([min, max]) => updateFilterState({ minPrice: min, maxPrice: max })}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <Label>Gems Price Range</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min={0}
                    value={filterState.minGemsPrice}
                    onChange={(e) => updateFilterState({ minGemsPrice: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    min={0}
                    value={filterState.maxGemsPrice}
                    onChange={(e) => updateFilterState({ maxGemsPrice: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[filterState.minGemsPrice, filterState.maxGemsPrice]}
                  onValueChange={([min, max]) => updateFilterState({ minGemsPrice: min, maxGemsPrice: max })}
                  className="mt-2"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-properties">
          <AccordionTrigger>Item Properties</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="equippable-only"
                  checked={filterState.showEquippableOnly}
                  onCheckedChange={(checked) => updateFilterState({ showEquippableOnly: !!checked })}
                />
                <Label htmlFor="equippable-only" className="cursor-pointer">Show Equippable Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="with-stats-only"
                  checked={filterState.showWithStatsOnly}
                  onCheckedChange={(checked) => updateFilterState({ showWithStatsOnly: !!checked })}
                />
                <Label htmlFor="with-stats-only" className="cursor-pointer">Show Items With Stats Only</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stats-filter">
          <AccordionTrigger>Stats Filter</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {Object.entries(filterState.stats).map(([stat, [min, max]]) => (
                <div key={stat} className="space-y-2">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleStatExpanded(stat)}
                  >
                    <Label>{formatStatName(stat)}</Label>
                    <span>{expandedStats[stat] ? '▼' : '▶'}</span>
                  </div>
                  
                  {expandedStats[stat] && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min={0}
                          value={min}
                          onChange={(e) => {
                            const newMin = parseInt(e.target.value) || 0;
                            updateFilterState({
                              stats: {
                                ...filterState.stats,
                                [stat]: [newMin, max]
                              }
                            });
                          }}
                          className="w-20"
                        />
                        <span>to</span>
                        <Input
                          type="number"
                          min={0}
                          value={max}
                          onChange={(e) => {
                            const newMax = parseInt(e.target.value) || 0;
                            updateFilterState({
                              stats: {
                                ...filterState.stats,
                                [stat]: [min, newMax]
                              }
                            });
                          }}
                          className="w-20"
                        />
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[min, max]}
                        onValueChange={([newMin, newMax]) => 
                          updateFilterState({
                            stats: {
                              ...filterState.stats,
                              [stat]: [newMin, newMax]
                            }
                          })
                        }
                        className="mt-2"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button 
        variant="outline" 
        onClick={resetFilters}
        className="w-full"
      >
        Reset Filters
      </Button>
    </div>
  );
} 