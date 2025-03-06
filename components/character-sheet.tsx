"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Coins, User } from "lucide-react"
import { EquipmentSlot } from "@/lib/items"
import { Item } from "./item-slot"

// Import new components
import CharacterOverview from "./character/character-overview"
import CharacterStatsComponent from "./character/character-stats"
import EquipmentGrid from "./equipment/equipment-grid"
import EquipmentSelection from "./equipment/equipment-selection"
import InventoryFilters from "./inventory/inventory-filters"
import InventoryGrid from "./inventory/inventory-grid"

// Import hooks
import { useInventoryFilter } from "@/hooks/use-inventory-filter"
import { useEquipment } from "@/hooks/use-equipment"

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

  // Use the inventory filter hook
  const {
    inventoryFilter,
    setInventoryFilter,
    rarityFilter,
    setRarityFilter,
    showEquippableOnly,
    setShowEquippableOnly,
    filteredInventory
  } = useInventoryFilter({ inventory, gameItems });

  // Use the equipment hook
  const {
    selectedEquipSlot,
    selectedRingIndex,
    handleSelectEquipSlot,
    handleEquipItem,
    handleUnequipItem,
    getEquippableItems,
    resetSelection
  } = useEquipment({
    character,
    inventory,
    gameItems,
    onEquipItem,
    onUnequipItem
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Character Overview */}
      <div className="lg:col-span-1">
        <CharacterOverview 
          character={character}
          manaPotionCount={manaPotionCount}
          onConsumeMagicPotion={onConsumeMagicPotion}
        />
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
              <CharacterStatsComponent character={character} />
            </TabsContent>

            <TabsContent value="equipment" className="p-4">
              <EquipmentGrid 
                character={character}
                gameItems={gameItems}
                selectedEquipSlot={selectedEquipSlot}
                selectedRingIndex={selectedRingIndex}
                onSelectEquipSlot={handleSelectEquipSlot}
              />
              
              {/* Equipment Selection */}
              {selectedEquipSlot && (
                <EquipmentSelection
                  selectedEquipSlot={selectedEquipSlot}
                  selectedRingIndex={selectedRingIndex}
                  character={character}
                  equippableItems={getEquippableItems(selectedEquipSlot)}
                  onCancel={resetSelection}
                  onUnequip={handleUnequipItem}
                  onEquip={handleEquipItem}
                />
              )}
            </TabsContent>

            <TabsContent value="inventory" className="p-4">
              <div className="space-y-4">
                <InventoryFilters
                  inventoryFilter={inventoryFilter}
                  setInventoryFilter={setInventoryFilter}
                  rarityFilter={rarityFilter}
                  setRarityFilter={setRarityFilter}
                  showEquippableOnly={showEquippableOnly}
                  setShowEquippableOnly={setShowEquippableOnly}
                />
                
                <InventoryGrid
                  items={filteredInventory}
                  onSelectEquipSlot={handleSelectEquipSlot}
                  onEquipItem={handleEquipItem}
                  emptyMessage="No items match the selected filters"
                  slotsPerRow={7}
                  minRows={5}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

