"use client"

import { FilterState } from "@/lib/store"
import { CurrencyType } from "@/lib/marketplace-types"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface DebugFilterProps {
  filterState: FilterState
  resetFilters: () => void
}

export default function DebugFilter({ filterState, resetFilters }: DebugFilterProps) {
  const [expanded, setExpanded] = useState(false)
  
  if (!expanded) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setExpanded(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white"
      >
        Debug Filters
      </Button>
    )
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 border border-gray-700 rounded-lg p-4 w-80 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Filter State Debug</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(false)}
        >
          Close
        </Button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Type:</strong> {filterState.type}
        </div>
        <div>
          <strong>Rarity:</strong> {filterState.rarity}
        </div>
        <div>
          <strong>Currencies:</strong>
          <ul className="ml-4">
            <li>Gold: {filterState.currencies[CurrencyType.GOLD] ? 'Yes' : 'No'}</li>
            <li>Gems: {filterState.currencies[CurrencyType.GEMS] ? 'Yes' : 'No'}</li>
          </ul>
        </div>
        <div>
          <strong>Price Range:</strong>
          <ul className="ml-4">
            <li>Gold: {filterState.minPrice} - {filterState.maxPrice}</li>
            <li>Gems: {filterState.minGemsPrice} - {filterState.maxGemsPrice}</li>
          </ul>
        </div>
        <div>
          <strong>Show Equippable Only:</strong> {filterState.showEquippableOnly ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Show With Stats Only:</strong> {filterState.showWithStatsOnly ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Stats:</strong>
          <ul className="ml-4">
            {Object.entries(filterState.stats).map(([stat, [min, max]]) => (
              <li key={stat}>{stat}: {min} - {max}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={resetFilters}
        className="mt-4 w-full"
      >
        Reset Filters
      </Button>
    </div>
  )
} 