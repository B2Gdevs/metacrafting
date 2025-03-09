"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InventoryItem } from "@/hooks/use-crafting"
import { gameItems } from "@/lib/items"

interface DebugInventoryProps {
  inventory: InventoryItem[]
  onUpdateInventory: (updatedInventory: InventoryItem[]) => void
}

export default function DebugInventory({ inventory, onUpdateInventory }: DebugInventoryProps) {
  const [expanded, setExpanded] = useState(false)
  
  // Function to reset inventory
  const resetInventory = () => {
    if (confirm("Are you sure you want to reset the inventory? This will remove all items.")) {
      onUpdateInventory([])
    }
  }
  
  // Function to add test items
  const addTestItems = () => {
    // Create a set of basic crafting materials
    const testInventory: InventoryItem[] = [
      { id: "wood", quantity: 20 },
      { id: "stone", quantity: 20 },
      { id: "iron_ore", quantity: 15 },
      { id: "leather", quantity: 10 },
      { id: "cloth", quantity: 10 },
      { id: "magic_essence", quantity: 5 },
      { id: "mana_crystal", quantity: 3 },
      { id: "mana_potion", quantity: 5 }
    ]
    
    // Merge with existing inventory
    const updatedInventory = [...inventory]
    
    testInventory.forEach(testItem => {
      const existingItem = updatedInventory.find(item => item.id === testItem.id)
      if (existingItem) {
        existingItem.quantity += testItem.quantity
      } else {
        updatedInventory.push(testItem)
      }
    })
    
    onUpdateInventory(updatedInventory)
  }
  
  // Function to add all available items
  const addAllItems = () => {
    const allItems: InventoryItem[] = Object.keys(gameItems)
      .filter(id => {
        const item = gameItems[id];
        return item.type === "ingredient" || item.type === "potion";
      })
      .map(id => ({ id, quantity: 5 }))
    
    onUpdateInventory([...inventory, ...allItems])
  }
  
  if (!expanded) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setExpanded(true)}
        className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white"
      >
        Debug Inventory
      </Button>
    )
  }
  
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-900 border border-gray-700 rounded-lg p-4 w-80 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Debug Inventory</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(false)}
          className="text-gray-400 hover:text-white"
        >
          Close
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm text-gray-400">
          Current inventory: {inventory.length} unique items, {inventory.reduce((sum, item) => sum + item.quantity, 0)} total
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={resetInventory}
          >
            Reset Inventory
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addTestItems}
          >
            Add Test Materials
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addAllItems}
          >
            Add All Items
          </Button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Use these controls to manage inventory during testing. Changes take effect immediately.
        </div>
      </div>
    </div>
  )
} 