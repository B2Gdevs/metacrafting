"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Shield, Hammer, Sparkles, BookOpen, Heart, Zap, ArrowUp, Info, User, Coins, Diamond, Filter } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ItemSlot, { Item, ItemType, ItemRarity } from "./item-slot"
import { EquipmentSlot } from "@/lib/items"

export type CharacterStats = {
  name: string
  level: number
  experience: number
  experienceToNextLevel: number
  strength: number
  speed: number
  health: number
  maxHealth: number
  magicPoints: number
  maxMagicPoints: number
  image?: string
  gold: number
  gems: number
  craftingStats: {
    metalworking: number
    magicworking: number
    spellcraft: number
  }
  craftingExperience: {
    metalworking: number
    magicworking: number
    spellcraft: number
  }
  equipment: {
    head?: string
    chest?: string
    legs?: string
    feet?: string
    hands?: string
    rings: string[]
    weapon?: string
    offhand?: string
    neck?: string
  }
}

interface CharacterSheetProps {
  character: CharacterStats
  onConsumeMagicPotion: () => void
  onUpdateCharacter: (updatedCharacter: CharacterStats) => void
  manaPotionCount?: number
  inventory: Array<{ id: string; quantity: number }>
  gameItems: Record<string, Item>
  onEquipItem: (itemId: string, slot: EquipmentSlot) => void
  onUnequipItem: (slot: EquipmentSlot, ringIndex?: number) => void
}

export default function CharacterSheet({ 
  character, 
  onConsumeMagicPotion, 
  onUpdateCharacter,
  manaPotionCount = 0,
  inventory,
  gameItems,
  onEquipItem,
  onUnequipItem
}: CharacterSheetProps) {
  const [activeTab, setActiveTab] = useState("stats")
  const [showStatsOverlay, setShowStatsOverlay] = useState(false)
  const [selectedEquipSlot, setSelectedEquipSlot] = useState<EquipmentSlot | null>(null)
  const [selectedRingIndex, setSelectedRingIndex] = useState<number | null>(null)
  const [inventoryFilter, setInventoryFilter] = useState<ItemType | "all">("all")
  const [rarityFilter, setRarityFilter] = useState<ItemRarity | "all">("all")
  const [showEquippableOnly, setShowEquippableOnly] = useState(false)
  
  // Constants for inventory display
  const INVENTORY_SLOTS_PER_ROW = 7;
  const INVENTORY_MIN_ROWS = 5;

  const getExperiencePercentage = (current: number, max: number) => {
    return Math.min(Math.round((current / max) * 100), 100)
  }

  const getCraftingLevelProgress = (stat: keyof typeof character.craftingExperience) => {
    const level = character.craftingStats[stat]
    const experience = character.craftingExperience[stat]
    const requiredExp = level * 100
    return Math.min(Math.round((experience / requiredExp) * 100), 100)
  }

  // Check if character has a cursed energy ring equipped
  const hasCursedRing = character.equipment.rings.includes("cursed_energy_ring")

  // Get equippable items from inventory for a specific slot
  const getEquippableItems = (slot: EquipmentSlot) => {
    return inventory
      .filter(item => {
        const gameItem = gameItems[item.id];
        // Check if gameItem exists before accessing its properties
        return gameItem && gameItem.equippable && gameItem.slot === slot;
      })
      .map(item => ({
        ...item,
        ...gameItems[item.id]
      }));
  }

  // Filter inventory items based on current filters
  const getFilteredInventory = () => {
    return inventory
      .filter(item => {
        const gameItem = gameItems[item.id]
        
        // Type filter
        if (inventoryFilter !== "all" && gameItem?.type !== inventoryFilter) {
          return false
        }
        
        // Equippable filter
        if (showEquippableOnly && (!gameItem || !gameItem.equippable)) {
          return false
        }
        
        return true
      })
      .map(item => ({
        ...item,
        gameItem: gameItems[item.id]
      }))
  }

  // Handle selecting an equipment slot
  const handleSelectEquipSlot = (slot: EquipmentSlot, ringIndex?: number) => {
    setSelectedEquipSlot(slot)
    if (slot === "rings") {
      setSelectedRingIndex(ringIndex || 0)
    } else {
      setSelectedRingIndex(null)
    }
  }

  // Handle equipping an item
  const handleEquipItem = (itemId: string) => {
    if (selectedEquipSlot) {
      if (selectedEquipSlot === "rings" && selectedRingIndex !== null) {
        onEquipItem(itemId, selectedEquipSlot)
      } else {
        onEquipItem(itemId, selectedEquipSlot)
      }
      setSelectedEquipSlot(null)
      setSelectedRingIndex(null)
    }
  }

  // Handle unequipping an item
  const handleUnequipItem = () => {
    if (selectedEquipSlot) {
      if (selectedEquipSlot === "rings" && selectedRingIndex !== null) {
        onUnequipItem(selectedEquipSlot, selectedRingIndex)
      } else {
        onUnequipItem(selectedEquipSlot)
      }
      setSelectedEquipSlot(null)
      setSelectedRingIndex(null)
    }
  }

  // Render an equipment slot
  const renderEquipmentSlot = (slot: EquipmentSlot, label: string, itemId?: string, ringIndex?: number) => {
    const isSelected = selectedEquipSlot === slot && 
      (slot !== "rings" || (slot === "rings" && selectedRingIndex === ringIndex))
    
    return (
      <div 
        className={`relative border ${isSelected ? 'border-amber-500' : 'border-gray-700'} rounded-lg p-1 cursor-pointer`}
        onClick={() => handleSelectEquipSlot(slot, ringIndex)}
      >
        <div className="text-xs text-gray-500 mb-1 text-center">{label}</div>
        <div className="w-12 h-12 mx-auto bg-gray-800 rounded flex items-center justify-center">
          {itemId ? (
            <ItemSlot 
              item={gameItems[itemId]} 
              onDragStart={() => {}} 
              isEquipped={true}
              showBadge={false}
            />
          ) : (
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render the inventory tab content
  const renderInventoryTab = () => {
    const filteredItems = getFilteredInventory();
    const itemCount = filteredItems.length;
    
    // Calculate how many rows we need (minimum of INVENTORY_MIN_ROWS)
    const rowsNeeded = Math.max(INVENTORY_MIN_ROWS, Math.ceil(itemCount / INVENTORY_SLOTS_PER_ROW));
    const totalSlots = rowsNeeded * INVENTORY_SLOTS_PER_ROW;
    
    return (
      <div className="space-y-4">
        {/* Inventory Filters */}
        <div className="flex flex-wrap gap-2 pb-3 border-b border-amber-900/50 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">FILTERS:</span>
          </div>
          
          <Select value={inventoryFilter} onValueChange={(value) => setInventoryFilter(value as ItemType | "all")}>
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
        
        {/* Inventory Container with Glow Effect */}
        <div className="relative">
          {/* Background glow effect - increased z-index to ensure visibility */}
          <div className="absolute inset-0 bg-amber-900/10 rounded-lg blur-xl z-0"></div>
          
          {/* Inventory Grid */}
          <div className="relative bg-gray-900/80 border border-amber-900/30 rounded-lg p-4 shadow-lg backdrop-blur-sm z-10">
            <div className="grid grid-cols-7 gap-2 max-h-[400px] overflow-y-auto p-1">
              {/* Create a fixed grid of identical empty slots */}
              {Array.from({ length: totalSlots }).map((_, index) => {
                const inventoryItem = filteredItems[index];
                
                return (
                  <div 
                    key={index} 
                    className="aspect-square rounded-md border border-gray-700/30 bg-gray-800/40 flex items-center justify-center"
                  >
                    {inventoryItem && (
                      <div className="w-full h-full flex items-center justify-center">
                        <ItemSlot
                          item={inventoryItem.gameItem}
                          onDragStart={() => {}}
                          quantity={inventoryItem.quantity}
                          onClick={() => {
                            if (inventoryItem.gameItem && 
                                inventoryItem.gameItem.equippable && 
                                inventoryItem.gameItem.slot) {
                              handleSelectEquipSlot(inventoryItem.gameItem.slot)
                              handleEquipItem(inventoryItem.id)
                            }
                          }}
                          size="small"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {filteredItems.length === 0 && (
              <div className="text-center text-amber-400/70 py-12 italic">
                No items match the selected filters
              </div>
            )}
            
            {/* Item count display */}
            <div className="mt-3 text-right text-sm text-amber-400/70">
              {filteredItems.length} / {inventory.length} items
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Character Overview */}
      <div className="lg:col-span-1">
        <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative w-20 h-20 rounded-full bg-gray-800 border-2 border-amber-500 flex items-center justify-center overflow-hidden">
              {character.image ? (
                <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{character.name}</h2>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="bg-amber-900/50 text-amber-400 border-amber-900">
                  Level {character.level}
                </Badge>
                <div className="ml-2 text-sm text-gray-400">
                  {character.experience}/{character.experienceToNextLevel} XP
                </div>
              </div>
              <Progress 
                value={getExperiencePercentage(character.experience, character.experienceToNextLevel)} 
                className="h-2 mt-2 bg-gray-800" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex items-center text-red-400 mb-1">
                <Heart className="w-4 h-4 mr-2" />
                <span className="font-medium">Health</span>
              </div>
              <div className="text-xl font-bold text-white">{character.health}/{character.maxHealth}</div>
              <Progress 
                value={(character.health / character.maxHealth) * 100} 
                className="h-2 mt-1 bg-gray-900" 
                indicatorClassName="bg-red-500"
              />
            </div>
            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex items-center text-blue-400 mb-1">
                <Zap className="w-4 h-4 mr-2" />
                <span className="font-medium">Magic</span>
              </div>
              <div className="text-xl font-bold text-white">{character.magicPoints}/{character.maxMagicPoints}</div>
              <Progress 
                value={(character.magicPoints / character.maxMagicPoints) * 100} 
                className="h-2 mt-1 bg-gray-900" 
                indicatorClassName="bg-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex items-center text-amber-400 mb-1">
                <Coins className="w-4 h-4 mr-2" />
                <span className="font-medium">Gold</span>
              </div>
              <div className="text-xl font-bold text-white">{character.gold}</div>
            </div>
            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex items-center text-cyan-400 mb-1">
                <Diamond className="w-4 h-4 mr-2" />
                <span className="font-medium">Gems</span>
              </div>
              <div className="text-xl font-bold text-white">{character.gems}</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white mb-2">Crafting Skills</h3>
            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center text-orange-400">
                  <Hammer className="w-4 h-4 mr-2" />
                  <span className="font-medium">Metalworking</span>
                </div>
                <span className="text-white font-bold">Level {character.craftingStats.metalworking}</span>
              </div>
              <Progress 
                value={getCraftingLevelProgress("metalworking")} 
                className="h-2 bg-gray-900" 
                indicatorClassName="bg-orange-500"
              />
            </div>
            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center text-purple-400">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="font-medium">Magicworking</span>
                </div>
                <span className="text-white font-bold">Level {character.craftingStats.magicworking}</span>
              </div>
              <Progress 
                value={getCraftingLevelProgress("magicworking")} 
                className="h-2 bg-gray-900" 
                indicatorClassName="bg-purple-500"
              />
            </div>
            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center text-blue-400">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="font-medium">Spellcraft</span>
                </div>
                <span className="text-white font-bold">Level {character.craftingStats.spellcraft}</span>
              </div>
              <Progress 
                value={getCraftingLevelProgress("spellcraft")} 
                className="h-2 bg-gray-900" 
                indicatorClassName="bg-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full bg-blue-900/30 text-blue-400 border-blue-900 hover:bg-blue-900/50"
              onClick={onConsumeMagicPotion}
              disabled={manaPotionCount <= 0}
            >
              <Zap className="mr-2 h-4 w-4" />
              Consume Magic Potion ({manaPotionCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-2">
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-gray-800 p-0 rounded-t-lg">
              <TabsTrigger 
                value="stats" 
                className="flex-1 py-3 rounded-none data-[state=active]:bg-gray-900 data-[state=active]:text-amber-400"
              >
                <Shield className="mr-2 h-4 w-4" />
                Combat Stats
              </TabsTrigger>
              <TabsTrigger 
                value="equipment" 
                className="flex-1 py-3 rounded-none data-[state=active]:bg-gray-900 data-[state=active]:text-amber-400"
              >
                <User className="mr-2 h-4 w-4" />
                Equipment
              </TabsTrigger>
              <TabsTrigger 
                value="inventory" 
                className="flex-1 py-3 rounded-none data-[state=active]:bg-gray-900 data-[state=active]:text-amber-400"
              >
                <Coins className="mr-2 h-4 w-4" />
                Inventory
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span className="text-sm">Strength:</span>
                      <span className="text-sm font-bold">{character.strength}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-sm">Speed:</span>
                      <span className="text-sm font-bold">{character.speed}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Health:</span>
                      <span className="text-sm font-bold">{character.health}/{character.maxHealth}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Magic:</span>
                      <span className="text-sm font-bold">{character.magicPoints}/{character.maxMagicPoints}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="p-4">
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
                        {renderEquipmentSlot("rings", `${index + 1}`, character.equipment.rings[index], index)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Center Equipment */}
                  <div className="col-span-3 grid grid-rows-4 gap-1">
                    {/* Head */}
                    <div className="flex justify-center">
                      {renderEquipmentSlot("head", "Head", character.equipment.head)}
                    </div>
                    
                    {/* Weapon, Chest, Offhand */}
                    <div className="flex justify-between">
                      <div className="scale-95">
                        {renderEquipmentSlot("weapon", "Weapon", character.equipment.weapon)}
                      </div>
                      <div className="scale-95">
                        {renderEquipmentSlot("chest", "Chest", character.equipment.chest)}
                      </div>
                      <div className="scale-95">
                        {renderEquipmentSlot("offhand", "Off", character.equipment.offhand)}
                      </div>
                    </div>
                    
                    {/* Legs */}
                    <div className="flex justify-center">
                      {renderEquipmentSlot("legs", "Legs", character.equipment.legs)}
                    </div>
                    
                    {/* Hands, Feet */}
                    <div className="flex justify-around">
                      <div className="scale-95">
                        {renderEquipmentSlot("hands", "Hands", character.equipment.hands)}
                      </div>
                      <div className="scale-95">
                        {renderEquipmentSlot("feet", "Feet", character.equipment.feet)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Rings (5-9) */}
                  <div className="flex flex-col gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={`right-ring-${index}`} className="scale-90">
                        {renderEquipmentSlot("rings", `${index + 6}`, character.equipment.rings[index + 5], index + 5)}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Equipment Selection */}
                {selectedEquipSlot && (
                  <div className="mt-4 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-amber-400">
                        Select {selectedEquipSlot.charAt(0).toUpperCase() + selectedEquipSlot.slice(1)}
                        {selectedEquipSlot === "rings" && selectedRingIndex !== null && ` (Slot ${selectedRingIndex + 1})`}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-7 border-red-900 bg-red-950/30 hover:bg-red-900/50 text-red-400"
                        onClick={() => {
                          setSelectedEquipSlot(null)
                          setSelectedRingIndex(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    
                    {/* Unequip option */}
                    {((selectedEquipSlot === "rings" && selectedRingIndex !== null && character.equipment.rings[selectedRingIndex]) ||
                      (selectedEquipSlot !== "rings" && character.equipment[selectedEquipSlot])) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-7 mb-2 border-amber-900 bg-amber-950/30 hover:bg-amber-900/50 text-amber-400"
                        onClick={handleUnequipItem}
                      >
                        Unequip Current Item
                      </Button>
                    )}
                    
                    {/* Equippable items */}
                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                      {getEquippableItems(selectedEquipSlot).map((item) => (
                        <div key={item.id} onClick={() => handleEquipItem(item.id)}>
                          <ItemSlot
                            item={item}
                            onDragStart={() => {}}
                            quantity={item.quantity}
                          />
                        </div>
                      ))}
                      
                      {getEquippableItems(selectedEquipSlot).length === 0 && (
                        <div className="col-span-4 text-center text-gray-500 py-4">
                          No equippable items found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="p-4">
              {renderInventoryTab()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

