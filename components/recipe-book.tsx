"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Search, Hammer, Shield, Sparkles, Sword, Droplet, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Item } from "./item-slot"

export type RecipeCategory = "all" | "items" | "weapons" | "armor" | "spellcraft" | "potions"

export type Recipe = {
  id: string
  inputs: string[]
  output: string
  description: string
  category: RecipeCategory
  difficulty: number
  requiredStats: {
    metalworking?: number
    magicworking?: number
    spellcraft?: number
    woodworking?: number
  }
  temperature?: number // Legacy field, will be replaced by craftingControls
  craftingControls?: {
    essence?: number
    precision?: number
    stability?: number
    resonance?: number
  }
  magicCost?: number
  experienceGain: {
    metalworking?: number
    magicworking?: number
    spellcraft?: number
    woodworking?: number
  }
  isSecret?: boolean
}

interface RecipeBookProps {
  recipes: Recipe[]
  gameItems: Record<string, Item>
  characterStats: {
    craftingStats: {
      metalworking: number
      magicworking: number
      spellcraft: number
    }
  }
  inventory: Array<{ id: string; quantity: number }>
  onQuickCraft: (recipeId: string) => void
}

export default function RecipeBook({ recipes, gameItems, characterStats, inventory, onQuickCraft }: RecipeBookProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [activeCategory, setActiveCategory] = useState<RecipeCategory>("all")
  const [discoveredSecretRecipes, setDiscoveredSecretRecipes] = useState<string[]>([])

  // Load discovered secret recipes from localStorage
  useEffect(() => {
    const storedRecipes = localStorage.getItem('discoveredRecipes')
    if (storedRecipes) {
      setDiscoveredSecretRecipes(JSON.parse(storedRecipes))
    }
  }, [])

  const filteredRecipes = recipes.filter(
    (recipe) =>
      // Only show non-secret recipes or secret recipes that have been discovered
      (!recipe.isSecret || (recipe.isSecret && discoveredSecretRecipes.includes(recipe.id))) &&
      (activeCategory === "all" || recipe.category === activeCategory) &&
      (gameItems[recipe.output].name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const calculateSuccessChance = (recipe: Recipe) => {
    if (!recipe.requiredStats) return 100

    let totalRequiredSkill = 0
    let totalCharacterSkill = 0

    if (recipe.requiredStats.metalworking) {
      totalRequiredSkill += recipe.requiredStats.metalworking
      totalCharacterSkill += Math.min(characterStats.craftingStats.metalworking, recipe.requiredStats.metalworking)
    }

    if (recipe.requiredStats.magicworking) {
      totalRequiredSkill += recipe.requiredStats.magicworking
      totalCharacterSkill += Math.min(characterStats.craftingStats.magicworking, recipe.requiredStats.magicworking)
    }

    if (recipe.requiredStats.spellcraft) {
      totalRequiredSkill += recipe.requiredStats.spellcraft
      totalCharacterSkill += Math.min(characterStats.craftingStats.spellcraft, recipe.requiredStats.spellcraft)
    }

    if (totalRequiredSkill === 0) return 100

    // Base chance is 50% if skills match exactly
    const baseChance = 50
    // Add 5% per skill level above required, cap at 95%
    const skillBonus = Math.min(45, Math.max(0, totalCharacterSkill - totalRequiredSkill) * 5)
    // Penalty for being under-skilled is more severe
    const skillPenalty = Math.max(0, totalRequiredSkill - totalCharacterSkill) * 10

    return Math.min(95, Math.max(5, baseChance + skillBonus - skillPenalty))
  }

  const getCategoryIcon = (category: RecipeCategory) => {
    switch (category) {
      case "weapons":
        return <Sword className="w-4 h-4" />
      case "armor":
        return <Shield className="w-4 h-4" />
      case "spellcraft":
        return <Sparkles className="w-4 h-4" />
      case "potions":
        return <Droplet className="w-4 h-4 text-blue-400" />
      case "items":
        return <Hammer className="w-4 h-4" />
      default:
        return null
    }
  }

  // Check if player has enough resources for a recipe
  const hasResourcesForRecipe = (recipe: Recipe) => {
    const requiredItems: Record<string, number> = {};
    
    // Count required items
    recipe.inputs.forEach(itemId => {
      requiredItems[itemId] = (requiredItems[itemId] || 0) + 1;
    });
    
    // Check if inventory has all required items in sufficient quantities
    return Object.entries(requiredItems).every(([itemId, requiredCount]) => {
      const inventoryItem = inventory.find(item => item.id === itemId);
      return inventoryItem && inventoryItem.quantity >= requiredCount;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search recipes..."
            className="pl-8 bg-gray-800 border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" onValueChange={(value) => setActiveCategory(value as RecipeCategory)} className="mb-4">
          <TabsList className="w-full grid grid-cols-6 h-9 bg-gray-800">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="items" className="text-xs">
              Items
            </TabsTrigger>
            <TabsTrigger value="weapons" className="text-xs">
              Weapons
            </TabsTrigger>
            <TabsTrigger value="armor" className="text-xs">
              Armor
            </TabsTrigger>
            <TabsTrigger value="potions" className="text-xs">
              Potions
            </TabsTrigger>
            <TabsTrigger value="spellcraft" className="text-xs">
              Spells
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No recipes found</div>
          ) : (
            filteredRecipes.map((recipe) => {
              const successChance = calculateSuccessChance(recipe)
              const canQuickCraft = hasResourcesForRecipe(recipe)
              
              return (
                <motion.div
                  key={recipe.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRecipe?.id === recipe.id
                      ? "bg-amber-900/30 border border-amber-700"
                      : "bg-gray-800 border border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedRecipe(recipe)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(recipe.category)}
                        <h3 className="font-medium text-amber-400">{gameItems[recipe.output].name}</h3>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">{recipe.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="bg-gray-700">
                        {successChance}% Success
                      </Badge>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 px-2 text-xs"
                                disabled={!canQuickCraft}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickCraft(recipe.id);
                                }}
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Quick Craft
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[200px]">
                            <p className="text-xs">
                              Quick crafting uses basic settings and won't apply special effects from crafting controls.
                              {recipe.temperature && " Temperature effects won't be applied."}
                              {recipe.magicCost && " Magic enhancements won't be applied."}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {selectedRecipe ? (
          <div className="h-full flex flex-col">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-amber-400">{gameItems[selectedRecipe.output].name}</h2>
              <p className="text-sm text-gray-400">{selectedRecipe.description}</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
                {selectedRecipe.inputs.slice(0, 9).map((itemId, index) => (
                  <div
                    key={`recipe-${index}`}
                    className="aspect-square bg-gray-800 rounded border border-gray-700 flex items-center justify-center"
                  >
                    <img
                      src={gameItems[itemId].image || "/placeholder.svg"}
                      alt={gameItems[itemId].name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                ))}
                {Array(Math.max(0, 9 - selectedRecipe.inputs.length))
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={`empty-recipe-${index}`}
                      className="aspect-square bg-gray-800 rounded border border-gray-700"
                    />
                  ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-amber-500 border-b-[10px] border-b-transparent" />
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-amber-500 border-b-[10px] border-b-transparent" />
              </div>

              <div className="w-20 h-20 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    repeatDelay: 2,
                  }}
                >
                  <img
                    src={gameItems[selectedRecipe.output].image || "/placeholder.svg"}
                    alt={gameItems[selectedRecipe.output].name}
                    className="w-12 h-12 object-contain"
                  />
                </motion.div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <h3 className="font-medium text-gray-300 mb-2">Required Ingredients:</h3>
                <div className="flex flex-wrap gap-2">
                  {/* Count occurrences of each ingredient */}
                  {Array.from(new Set(selectedRecipe.inputs)).map((itemId) => {
                    const count = selectedRecipe.inputs.filter((id) => id === itemId).length
                    return (
                      <div key={itemId} className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
                        <img
                          src={gameItems[itemId].image || "/placeholder.svg"}
                          alt={gameItems[itemId].name}
                          className="w-5 h-5 object-contain"
                        />
                        <span className="text-xs">
                          {gameItems[itemId].name} x{count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedRecipe.temperature && (
                  <div className="bg-gray-800 p-2 rounded border border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Sword className="w-3 h-3 text-red-400" />
                      <span>Temperature</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm font-medium">{selectedRecipe.temperature}°</span>
                    </div>
                  </div>
                )}

                {selectedRecipe.magicCost && (
                  <div className="bg-gray-800 p-2 rounded border border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      <span>Magic Cost</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm font-medium">{selectedRecipe.magicCost} MP</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-300 mb-2">Required Skills:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedRecipe.requiredStats.metalworking && (
                    <div className="bg-gray-800 p-2 rounded border border-gray-700">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Hammer className="w-3 h-3" />
                        <span>Metalworking</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-medium">Level {selectedRecipe.requiredStats.metalworking}</span>
                        <span
                          className={`text-xs ${characterStats.craftingStats.metalworking >= selectedRecipe.requiredStats.metalworking ? "text-green-400" : "text-red-400"}`}
                        >
                          ({characterStats.craftingStats.metalworking})
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedRecipe.requiredStats.magicworking && (
                    <div className="bg-gray-800 p-2 rounded border border-gray-700">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Sparkles className="w-3 h-3" />
                        <span>Magicworking</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-medium">Level {selectedRecipe.requiredStats.magicworking}</span>
                        <span
                          className={`text-xs ${characterStats.craftingStats.magicworking >= selectedRecipe.requiredStats.magicworking ? "text-green-400" : "text-red-400"}`}
                        >
                          ({characterStats.craftingStats.magicworking})
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedRecipe.requiredStats.spellcraft && (
                    <div className="bg-gray-800 p-2 rounded border border-gray-700">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Sparkles className="w-3 h-3" />
                        <span>Spellcraft</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-medium">Level {selectedRecipe.requiredStats.spellcraft}</span>
                        <span
                          className={`text-xs ${characterStats.craftingStats.spellcraft >= selectedRecipe.requiredStats.spellcraft ? "text-green-400" : "text-red-400"}`}
                        >
                          ({characterStats.craftingStats.spellcraft})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-300 mb-2">Experience Gain:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.experienceGain.metalworking && (
                    <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
                      <Hammer className="w-3 h-3 text-gray-400" />
                      <span className="text-xs">+{selectedRecipe.experienceGain.metalworking} XP</span>
                    </div>
                  )}
                  {selectedRecipe.experienceGain.magicworking && (
                    <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      <span className="text-xs">+{selectedRecipe.experienceGain.magicworking} XP</span>
                    </div>
                  )}
                  {selectedRecipe.experienceGain.spellcraft && (
                    <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span className="text-xs">+{selectedRecipe.experienceGain.spellcraft} XP</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>Select a recipe to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}

