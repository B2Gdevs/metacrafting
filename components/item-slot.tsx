"use client"

import type React from "react"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { EquipmentSlot } from "@/lib/items"

export type ItemType = "ingredient" | "crafted" | "weapon" | "armor" | "potion" | "tool" | "magical" | "accessory"
export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary"

export type Item = {
  id: string
  name: string
  image: string
  description: string
  type: ItemType
  subType?: string
  value?: number
  magicValue?: number
  requiredLevel?: number
  stats?: {
    [key: string]: number
  }
  equippable?: boolean
  slot?: EquipmentSlot
  rarity?: ItemRarity
  specialAbility?: string
}

interface ItemSlotProps {
  item: Item | string | null
  onDragStart?: () => void
  onClick?: () => void
  showBadge?: boolean
  quantity?: number
  isEquipped?: boolean
  onEquip?: () => void
  label?: string
  isOver?: boolean
  onRemove?: () => void
  size?: "normal" | "small"
}

export default function ItemSlot({ 
  item, 
  onDragStart = () => {}, 
  onClick, 
  showBadge = true, 
  quantity = 1,
  isEquipped = false,
  onEquip,
  label,
  isOver,
  onRemove,
  size = "normal"
}: ItemSlotProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // If item is a string ID or null, render a placeholder
  if (!item || typeof item === 'string') {
    return (
      <div 
        className={`
          relative 
          ${size === "small" ? "w-12 h-12" : "w-16 h-16"} 
          bg-gray-800/50 
          rounded 
          border 
          ${isOver ? 'border-green-500' : 'border-gray-700'} 
          flex 
          flex-col 
          items-center 
          justify-center
          ${onRemove ? 'cursor-pointer' : ''}
        `}
        onClick={onRemove}
      >
        {label && (
          <div className="text-xs text-gray-400">{label}</div>
        )}
        {isOver && (
          <div className="absolute inset-0 bg-green-500/20 rounded"></div>
        )}
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent) => {
    setShowTooltip(false)
    onDragStart()

    // Set a ghost image for dragging
    const img = new Image()
    img.src = item.image
    img.width = 50
    img.height = 50
    e.dataTransfer.setDragImage(img, 25, 25)
  }

  const handleDragEnd = () => {
    setShowTooltip(false)
  }

  const getTypeColor = (type: ItemType) => {
    switch (type) {
      case "weapon":
        return "bg-red-900/50 text-red-400 border-red-900"
      case "armor":
        return "bg-blue-900/50 text-blue-400 border-blue-900"
      case "potion":
        return "bg-green-900/50 text-green-400 border-green-900"
      case "tool":
        return "bg-yellow-900/50 text-yellow-400 border-yellow-900"
      case "magical":
        return "bg-purple-900/50 text-purple-400 border-purple-900"
      case "accessory":
        return "bg-amber-900/50 text-amber-400 border-amber-900"
      default:
        return "bg-gray-900/50 text-gray-400 border-gray-700"
    }
  }

  const getRarityColor = (rarity?: ItemRarity) => {
    switch (rarity) {
      case "uncommon":
        return "text-green-400"
      case "rare":
        return "text-blue-400"
      case "epic":
        return "text-purple-400"
      case "legendary":
        return "text-amber-400"
      default:
        return "text-gray-300"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip open={showTooltip}>
        <TooltipTrigger asChild>
          <div
            className={`relative w-full aspect-square bg-gray-800 rounded border ${isEquipped ? 'border-amber-500' : 'border-gray-700'} flex items-center justify-center cursor-grab hover:border-gray-500 transition-colors`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={onClick || onEquip}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <img src={item.image} alt={item.name} className="w-10 h-10 object-contain" />
            {showBadge && quantity > 1 && (
              <div className="absolute bottom-0 right-0 bg-gray-900 rounded-tl px-1 text-xs font-medium">
                {quantity}
              </div>
            )}
            {isEquipped && (
              <div className="absolute top-0 right-0 bg-amber-900 rounded-bl px-1 text-xs font-medium text-amber-300">
                E
              </div>
            )}
            {item.rarity && item.rarity !== "common" && (
              <div className={`absolute top-0 left-0 rounded-br px-1 text-xs font-medium ${getRarityColor(item.rarity)} bg-gray-900/80`}>
                {item.rarity.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="w-64 p-0 overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-800">
            <div className={`font-medium text-lg ${getRarityColor(item.rarity)}`}>{item.name}</div>
            <div className="text-sm text-gray-400 mt-1">{item.description}</div>
          </div>
          <div className="p-3 bg-gray-950">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className={getTypeColor(item.type)}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Badge>
              {item.subType && (
                <Badge variant="outline" className="bg-gray-900/50 text-gray-400 border-gray-800">
                  {item.subType.charAt(0).toUpperCase() + item.subType.slice(1)}
                </Badge>
              )}
              {item.equippable && (
                <Badge variant="outline" className="bg-amber-900/50 text-amber-400 border-amber-900">
                  Equippable
                </Badge>
              )}
              {item.slot && (
                <Badge variant="outline" className="bg-blue-900/50 text-blue-400 border-blue-900">
                  {item.slot.charAt(0).toUpperCase() + item.slot.slice(1)}
                </Badge>
              )}
              {item.rarity && (
                <Badge variant="outline" className={`bg-gray-900/50 ${getRarityColor(item.rarity)} border-gray-800`}>
                  {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                </Badge>
              )}
            </div>
            
            {item.stats && Object.keys(item.stats).length > 0 && (
              <div className="space-y-1 mb-2">
                {Object.entries(item.stats).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between text-sm">
                    <span className="text-gray-400">{stat}</span>
                    <span className={value > 0 ? "text-green-400" : "text-red-400"}>
                      {value > 0 ? "+" : ""}{value}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {item.specialAbility && (
              <div className="text-sm text-purple-400 mt-2">
                <span className="font-medium">Special:</span> {item.specialAbility}
              </div>
            )}
            
            {item.requiredLevel && (
              <div className="text-sm text-gray-400 mt-2">
                Requires Level {item.requiredLevel}
              </div>
            )}
            
            {item.value && (
              <div className="text-sm text-amber-400 mt-2">
                Value: {item.value} gold
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

