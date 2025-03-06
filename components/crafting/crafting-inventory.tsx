"use client"

import { useState, useEffect } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ItemSlot, { Item, ItemType, ItemRarity } from "@/components/item-slot"

interface CraftingInventoryProps {
  inventory: Array<{ id: string; quantity: number; craftingPattern?: string }>
  gameItems: Record<string, Item>
  onDragStart: (item: string, source: "inventory" | "grid", index: number) => void
  onDropArea: () => void
}

// Helper function to get a human-readable pattern name
const getPatternName = (pattern?: string): string => {
  if (!pattern || pattern === "none") return "No pattern";
  
  // Handle multiple patterns
  if (pattern.includes(",")) {
    const patterns = pattern.split(",");
    // Format each pattern and join with "and"
    const formattedPatterns = patterns.map(p => 
      p.charAt(0).toUpperCase() + p.slice(1).replace(/([A-Z])/g, ' $1')
    );
    
    if (formattedPatterns.length === 2) {
      return `${formattedPatterns[0]} and ${formattedPatterns[1]}`;
    } else {
      const lastPattern = formattedPatterns.pop();
      return `${formattedPatterns.join(", ")} and ${lastPattern}`;
    }
  }
  
  // Single pattern
  return pattern.charAt(0).toUpperCase() + 
    pattern.slice(1).replace(/([A-Z])/g, ' $1');
};

// Component to render a visual representation of a pattern
const PatternVisual = ({ pattern }: { pattern: string }) => {
  // If no pattern or "none", return nothing
  if (!pattern || pattern === "none") {
    return <div className="text-gray-500 italic text-xs">No specific pattern used</div>;
  }
  
  // Split multiple patterns
  const patterns = pattern.includes(",") ? pattern.split(",") : [pattern];
  
  return (
    <div className="space-y-1">
      {patterns.map((p, index) => (
        <div key={index} className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-xs text-blue-400">
            {p.charAt(0).toUpperCase() + p.slice(1).replace(/([A-Z])/g, ' $1')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function CraftingInventory({
  inventory,
  gameItems,
  onDragStart,
  onDropArea
}: CraftingInventoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<ItemType | "all">("all")
  const [rarityFilter, setRarityFilter] = useState<ItemRarity | "all">("all")
  
  // Debug: Log items with patterns
  useEffect(() => {
    const itemsWithPatterns = inventory.filter(item => item.craftingPattern);
    if (itemsWithPatterns.length > 0) {
      console.log("Items with patterns:", itemsWithPatterns);
    }
  }, [inventory]);
  
  // Filter inventory items based on search and filters
  const filteredInventory = inventory.filter(item => {
    const gameItem = gameItems[item.id]
    if (!gameItem) return false
    
    // Search filter
    if (searchTerm && !gameItem.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Type filter
    if (typeFilter !== "all" && gameItem.type !== typeFilter) {
      return false
    }
    
    // Rarity filter
    if (rarityFilter !== "all" && gameItem.rarity !== rarityFilter) {
      return false
    }
    
    return true
  })
  
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <h3 className="text-lg font-medium text-amber-400 mb-4">Inventory</h3>
      
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search items..."
              className="pl-8 bg-gray-800 border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">FILTERS:</span>
            </div>
            
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ItemType | "all")}>
              <SelectTrigger className="h-8 w-32 bg-gray-800/80 border-amber-900/50 hover:border-amber-500/70 transition-colors">
                <SelectValue placeholder="Item Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-amber-900">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="weapon">Weapons</SelectItem>
                <SelectItem value="armor">Armor</SelectItem>
                <SelectItem value="accessory">Accessories</SelectItem>
                <SelectItem value="potion">Potions</SelectItem>
                <SelectItem value="ingredient">Ingredients</SelectItem>
                <SelectItem value="tool">Tools</SelectItem>
                <SelectItem value="magical">Magical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={rarityFilter} onValueChange={(value) => setRarityFilter(value as ItemRarity | "all")}>
              <SelectTrigger className="h-8 w-32 bg-gray-800/80 border-amber-900/50 hover:border-amber-500/70 transition-colors">
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-amber-900">
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="mythic">Mythic</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-xs border-amber-900/50 text-amber-400 hover:border-amber-500/70"
              onClick={() => {
                setSearchTerm("")
                setTypeFilter("all")
                setRarityFilter("all")
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
        
        {/* Inventory Grid */}
        <div 
          className="grid grid-cols-6 gap-4 max-h-[400px] overflow-y-auto p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDrop={(e) => {
            e.preventDefault()
            onDropArea()
          }}
        >
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item, index) => {
              const gameItem = gameItems[item.id];
              if (!gameItem) return null;
              
              return (
                <div key={`${item.id}-${index}`} className="flex flex-col items-center mb-3 p-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1 bg-gray-900/30 rounded">
                          <ItemSlot 
                            item={gameItem} 
                            onDragStart={() => onDragStart(item.id, "inventory", index)}
                            quantity={item.quantity}
                            size="small"
                            disableTooltip={true}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="w-64 p-3">
                        <div className="space-y-2">
                          <p className="font-medium text-lg">{gameItem.name}</p>
                          <p className="text-sm text-gray-400">{gameItem.description}</p>
                          
                          {gameItem.stats && Object.keys(gameItem.stats).length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-400 mb-1">Stats:</p>
                              <div className="space-y-1">
                                {Object.entries(gameItem.stats).map(([stat, value]) => (
                                  <div key={stat} className="flex justify-between text-xs">
                                    <span className="text-gray-400">{stat}</span>
                                    <span className="text-blue-400">+{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {item.craftingPattern && item.craftingPattern !== "none" && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-400 mb-1">Crafting Patterns:</p>
                              <PatternVisual pattern={item.craftingPattern} />
                            </div>
                          )}
                          
                          {!item.craftingPattern && (
                            <p className="text-xs italic text-gray-500 mt-2">Not crafted by you</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            })
          ) : (
            <div className="col-span-6 py-8 text-center text-gray-500">
              No items match the current filters
            </div>
          )}
        </div>
        
        <div className="text-right text-xs text-gray-400">
          {filteredInventory.length} / {inventory.length} items
        </div>
      </div>
    </div>
  )
} 