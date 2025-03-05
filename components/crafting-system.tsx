"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Book, HelpCircle, Sparkles, Filter, ArrowDownUp, Flame, X, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ItemSlot, { type Item, type ItemType, type ItemRarity } from "./item-slot"
import RecipeBook, { type Recipe, type RecipeCategory } from "./recipe-book"
import CharacterSheet, { type CharacterStats } from "./character-sheet"
import CraftingControls from "@/components/crafting-controls"
import { gameItems } from "@/lib/items"
import { recipes, CraftingControlType } from "@/lib/recipes"
import { EquipmentSlot } from "@/lib/items"
import { Slider } from "@/components/ui/slider"

type InventoryItem = {
  id: string
  quantity: number
}

// Add this new component for simplified character stats
function CraftingCharacterStats({ 
  character, 
  onConsumeMagicPotion,
  manaPotionCount
}: { 
  character: CharacterStats; 
  onConsumeMagicPotion: () => void;
  manaPotionCount: number;
}) {
  return (
    <div className="game-card">
      <div className="game-card-header">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-amber-400">Crafter Profile</h3>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-400">Level {character.level}</div>
            <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500" 
                style={{ width: `${Math.min((character.experience / character.experienceToNextLevel) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="game-card-content">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-medium">{character.name}</div>
          <div className="flex space-x-3">
            <div className="flex items-center">
              <span className="text-amber-400 text-sm mr-1">Gold:</span>
              <span className="text-amber-400 font-medium">{character.gold}</span>
            </div>
            <div className="flex items-center">
              <span className="text-cyan-400 text-sm mr-1">Gems:</span>
              <span className="text-cyan-400 font-medium">{character.gems}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Magic Points */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium">Magic Points</div>
              <div className="text-sm text-gray-400">{character.magicPoints}/{character.maxMagicPoints}</div>
            </div>
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${(character.magicPoints / character.maxMagicPoints) * 100}%` }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onConsumeMagicPotion}
                disabled={manaPotionCount <= 0}
                className="h-7 text-xs"
              >
                Use Magic Potion ({manaPotionCount})
              </Button>
            </div>
          </div>
          
          {/* Crafting Skills */}
          <div className="space-y-2">
            <div className="text-sm font-medium mb-1">Crafting Skills</div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs">Metalworking</div>
                <div className="text-xs text-gray-400">Level {character.craftingStats.metalworking}</div>
              </div>
              <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600" 
                  style={{ 
                    width: `${Math.min((character.craftingExperience.metalworking / (character.craftingStats.metalworking * 100)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs">Magicworking</div>
                <div className="text-xs text-gray-400">Level {character.craftingStats.magicworking}</div>
              </div>
              <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600" 
                  style={{ 
                    width: `${Math.min((character.craftingExperience.magicworking / (character.craftingStats.magicworking * 100)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs">Spellcraft</div>
                <div className="text-xs text-gray-400">Level {character.craftingStats.spellcraft}</div>
              </div>
              <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-600" 
                  style={{ 
                    width: `${Math.min((character.craftingExperience.spellcraft / (character.craftingStats.spellcraft * 100)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Crafting Equipment Effects */}
          <div>
            <div className="text-sm font-medium mb-1">Equipment Effects</div>
            <div className="text-xs text-gray-400">
              {Object.entries(character.equipment).some(([slot, item]) => {
                if (slot === "rings" && Array.isArray(item)) {
                  return item.some(ringId => {
                    const ring = gameItems[ringId];
                    return ring && ring.stats && (
                      ring.stats.magicworking || 
                      ring.stats.metalworking || 
                      ring.stats.spellcraft
                    );
                  });
                } else if (typeof item === 'string') {
                  const equip = gameItems[item];
                  return equip && equip.stats && (
                    equip.stats.magicworking || 
                    equip.stats.metalworking || 
                    equip.stats.spellcraft
                  );
                }
                return false;
              }) ? (
                <ul className="space-y-1">
                  {Object.entries(character.equipment).map(([slot, item]) => {
                    if (slot === "rings" && Array.isArray(item)) {
                      return item.map((ringId, index) => {
                        const ring = gameItems[ringId];
                        if (ring && ring.stats && (
                          ring.stats.magicworking || 
                          ring.stats.metalworking || 
                          ring.stats.spellcraft
                        )) {
                          return (
                            <li key={`ring-${index}`} className="flex items-center">
                              <span className="text-gray-300">{ring.name}:</span>
                              {ring.stats.metalworking && (
                                <span className="ml-1 text-amber-400">+{ring.stats.metalworking} Metalworking</span>
                              )}
                              {ring.stats.magicworking && (
                                <span className="ml-1 text-purple-400">+{ring.stats.magicworking} Magicworking</span>
                              )}
                              {ring.stats.spellcraft && (
                                <span className="ml-1 text-cyan-400">+{ring.stats.spellcraft} Spellcraft</span>
                              )}
                            </li>
                          );
                        }
                        return null;
                      });
                    } else if (typeof item === 'string') {
                      const equip = gameItems[item];
                      if (equip && equip.stats && (
                        equip.stats.magicworking || 
                        equip.stats.metalworking || 
                        equip.stats.spellcraft
                      )) {
                        return (
                          <li key={slot} className="flex items-center">
                            <span className="text-gray-300">{equip.name}:</span>
                            {equip.stats.metalworking && (
                              <span className="ml-1 text-amber-400">+{equip.stats.metalworking} Metalworking</span>
                            )}
                            {equip.stats.magicworking && (
                              <span className="ml-1 text-purple-400">+{equip.stats.magicworking} Magicworking</span>
                            )}
                            {equip.stats.spellcraft && (
                              <span className="ml-1 text-cyan-400">+{equip.stats.spellcraft} Spellcraft</span>
                            )}
                          </li>
                        );
                      }
                    }
                    return null;
                  })}
                </ul>
              ) : (
                <span>No crafting bonuses from equipment</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CraftingSystem() {
  // Character state
  const [character, setCharacter] = useState<CharacterStats>({
    name: "Craftmaster",
    level: 5,
    experience: 240,
    experienceToNextLevel: 500,
    strength: 8,
    speed: 6,
    health: 100,
    maxHealth: 100,
    magicPoints: 50,
    maxMagicPoints: 50,
    image: "/placeholder-user.jpg",
    gold: 500,
    gems: 10,
    craftingStats: {
      metalworking: 3,
      magicworking: 2,
      spellcraft: 2,
    },
    craftingExperience: {
      metalworking: 150,
      magicworking: 80,
      spellcraft: 120,
    },
    equipment: {
      rings: [],
    }
  })

  // Inventory state with quantities
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: "wood", quantity: 5 },
    { id: "stone", quantity: 3 },
    { id: "iron", quantity: 2 },
    { id: "leather", quantity: 3 },
    { id: "herb", quantity: 4 },
    { id: "crystal", quantity: 2 },
    { id: "steel", quantity: 1 },
    { id: "cloth", quantity: 2 },
    { id: "silver", quantity: 1 },
    { id: "ancient_rune", quantity: 1 },
    { id: "dragon_scale", quantity: 1 },
    { id: "potion", quantity: 1 },
  ])

  const [craftingGrid, setCraftingGrid] = useState<(string | null)[]>(Array(9).fill(null))
  const [result, setResult] = useState<string | null>(null)
  const [showRecipeBook, setShowRecipeBook] = useState(false)
  const [craftingAnimation, setCraftingAnimation] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragSource, setDragSource] = useState<"inventory" | "grid" | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [activeControl, setActiveControl] = useState<CraftingControlType>("magic")
  const [controlValues, setControlValues] = useState<Record<CraftingControlType, number>>({
    magic: 50,
    stability: 50,
    curse: 50
  })
  const [temperature, setTemperature] = useState(25)
  const [inventoryFilter, setInventoryFilter] = useState<ItemType | "all">("all")
  const [rarityFilter, setRarityFilter] = useState<ItemRarity | "all">("all")
  const [inventorySort, setInventorySort] = useState<"name" | "type" | "quantity" | "rarity">("name")
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [craftingResult, setCraftingResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  
  // Ref for recipe book modal
  const recipeBookRef = useRef<HTMLDivElement>(null)
  
  // Handle click outside recipe book
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (recipeBookRef.current && !recipeBookRef.current.contains(event.target as Node)) {
        setShowRecipeBook(false)
      }
    }
    
    if (showRecipeBook) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showRecipeBook])

  // Check if current grid matches any recipe
  useEffect(() => {
    const filledSlots = craftingGrid.filter((item) => item !== null) as string[]

    if (filledSlots.length === 0) {
      setResult(null)
      setCurrentRecipe(null)
      return
    }

    // Simple recipe matching (order doesn't matter in this implementation)
    for (const recipe of recipes) {
      const recipeInputs = [...recipe.inputs]
      const currentInputs = [...filledSlots]

      if (recipeInputs.length !== currentInputs.length) continue

      let match = true
      for (const item of currentInputs) {
        const index = recipeInputs.indexOf(item)
        if (index === -1) {
          match = false
          break
        }
        recipeInputs.splice(index, 1)
      }

      if (match) {
        setResult(recipe.output)
        setCurrentRecipe(recipe)
        
        // If this is a secret recipe that was successfully crafted, add it to discovered recipes
        if (recipe.isSecret) {
          const discoveredRecipeIds = localStorage.getItem('discoveredRecipes') 
            ? JSON.parse(localStorage.getItem('discoveredRecipes') || '[]') 
            : [];
          
          if (!discoveredRecipeIds.includes(recipe.id)) {
            discoveredRecipeIds.push(recipe.id);
            localStorage.setItem('discoveredRecipes', JSON.stringify(discoveredRecipeIds));
          }
        }
        
        return
      }
    }

    setResult(null)
    setCurrentRecipe(null)
  }, [craftingGrid])

  // Filter and sort inventory
  const filteredInventory = inventory
    .filter((item) => {
      const gameItem = gameItems[item.id]
      if (!gameItem) return false
      
      // Type filter
      if (inventoryFilter !== "all" && gameItem.type !== inventoryFilter) {
        return false
      }
      
      // Rarity filter
      if (rarityFilter !== "all" && gameItem.rarity !== rarityFilter) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      const itemA = gameItems[a.id]
      const itemB = gameItems[b.id]
      
      if (!itemA || !itemB) return 0
      
      if (inventorySort === "name") {
        return itemA.name.localeCompare(itemB.name)
      } else if (inventorySort === "type") {
        return itemA.type.localeCompare(itemB.type)
      } else if (inventorySort === "rarity") {
        const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
        return (rarityOrder[itemB.rarity as keyof typeof rarityOrder] || 0) - 
               (rarityOrder[itemA.rarity as keyof typeof rarityOrder] || 0)
      } else {
        return b.quantity - a.quantity // Sort by quantity (descending)
      }
    })

  // Handle drag start
  const handleDragStart = (item: string, source: "inventory" | "grid", index: number) => {
    setDraggedItem(item)
    setDragSource(source)
    setDragIndex(index)
  }

  // Handle drop on crafting grid
  const handleDropOnGrid = (index: number) => {
    if (!draggedItem) return;

    // If dragging from inventory, check if we have enough quantity
    if (dragSource === "inventory") {
      const inventoryItem = inventory.find((item) => item.id === draggedItem);
      if (!inventoryItem || inventoryItem.quantity <= 0) return;

      // Update the grid
      const newGrid = [...craftingGrid];
      newGrid[index] = draggedItem;
      setCraftingGrid(newGrid);

      // No need to update inventory when just placing items
    }
    // If dragging from another grid position
    else if (dragSource === "grid" && dragIndex !== null) {
      const newGrid = [...craftingGrid];
      newGrid[dragIndex] = null;
      newGrid[index] = draggedItem;
      setCraftingGrid(newGrid);
    }

    // Reset drag state
    setDraggedItem(null);
    setDragSource(null);
    setDragIndex(null);
  };

  // Handle drop on inventory
  const handleDropOnInventory = () => {
    if (!draggedItem || dragSource !== "grid" || dragIndex === null) return

    // Add item back to inventory
    const existingItem = inventory.find((item) => item.id === draggedItem)

    if (existingItem) {
      const newInventory = inventory.map((item) =>
        item.id === draggedItem ? { ...item, quantity: item.quantity + 1 } : item,
      )
      setInventory(newInventory)
    } else {
      setInventory([...inventory, { id: draggedItem, quantity: 1 }])
    }

    // Remove from grid
    const newGrid = [...craftingGrid]
    newGrid[dragIndex] = null
    setCraftingGrid(newGrid)

    // Reset drag state
    setDraggedItem(null)
    setDragSource(null)
    setDragIndex(null)
  }

  // Calculate success chance for crafting
  const calculateSuccessChance = () => {
    if (!currentRecipe) return 100

    let totalRequiredSkill = 0
    let totalCharacterSkill = 0

    if (currentRecipe.requiredStats.metalworking) {
      totalRequiredSkill += currentRecipe.requiredStats.metalworking
      totalCharacterSkill += Math.min(character.craftingStats.metalworking, currentRecipe.requiredStats.metalworking)
    }

    if (currentRecipe.requiredStats.magicworking) {
      totalRequiredSkill += currentRecipe.requiredStats.magicworking
      totalCharacterSkill += Math.min(character.craftingStats.magicworking, currentRecipe.requiredStats.magicworking)
    }

    if (currentRecipe.requiredStats.spellcraft) {
      totalRequiredSkill += currentRecipe.requiredStats.spellcraft
      totalCharacterSkill += Math.min(character.craftingStats.spellcraft, currentRecipe.requiredStats.spellcraft)
    }

    if (totalRequiredSkill === 0) return 100

    // Base chance is 50% if skills match exactly
    const baseChance = 50
    // Add 5% per skill level above required, cap at 95%
    const skillBonus = Math.min(45, Math.max(0, totalCharacterSkill - totalRequiredSkill) * 5)
    // Penalty for being under-skilled is more severe
    const skillPenalty = Math.max(0, totalRequiredSkill - totalCharacterSkill) * 10

    // Temperature affects success chance
    let tempBonus = 0
    if (currentRecipe.temperature) {
      const tempDiff = Math.abs(temperature - currentRecipe.temperature)
      if (tempDiff <= 50) {
        tempBonus = 10 // Perfect temperature
      } else if (tempDiff <= 100) {
        tempBonus = 5 // Close temperature
      } else if (tempDiff >= 300) {
        tempBonus = -20 // Very wrong temperature
      } else {
        tempBonus = -10 // Wrong temperature
      }
    }

    return Math.min(95, Math.max(5, baseChance + skillBonus - skillPenalty + tempBonus))
  }

  // Handle crafting
  const handleCraft = () => {
    if (!currentRecipe) {
      setCraftingResult({
        success: false,
        message: "No valid recipe found for these materials.",
      });
      return;
    }

    // Check if player has enough magic points
    if (controlValues.magic > character.magicPoints) {
      setCraftingResult({
        success: false,
        message: "Not enough magic points for this craft.",
      });
      return;
    }

    // Start crafting animation
    setCraftingAnimation(true);
    
    // Simulate crafting time
    setTimeout(() => {
      // Calculate success chance
      const successChance = calculateSuccessChance();
      
      // Determine if crafting is successful
      const isSuccess = Math.random() * 100 <= successChance;
      
      // Consume ingredients from inventory
      const newInventory = [...inventory];
      
      // Remove items from grid
      craftingGrid.forEach((itemId) => {
        if (itemId) {
          const inventoryItem = newInventory.find((item) => item.id === itemId);
          if (inventoryItem) {
            inventoryItem.quantity -= 1;
            
            // Remove item if quantity is 0
            if (inventoryItem.quantity <= 0) {
              const index = newInventory.indexOf(inventoryItem);
              newInventory.splice(index, 1);
            }
          }
        }
      });
      
      // Clear grid
      setCraftingGrid(Array(9).fill(null));
      
      if (isSuccess) {
        // Add crafted item to inventory
        const existingItem = newInventory.find((item) => item.id === currentRecipe.output);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          newInventory.push({ id: currentRecipe.output, quantity: 1 });
        }
        
        // Update character stats
        const newCharacter = { ...character };
        
        // Deduct magic points based on the magic power control value
        newCharacter.magicPoints = Math.max(0, newCharacter.magicPoints - controlValues.magic);
        
        // Add experience based on recipe
        if (currentRecipe.experienceGain.metalworking) {
          newCharacter.craftingExperience.metalworking += currentRecipe.experienceGain.metalworking;
          // Check for level up
          if (newCharacter.craftingExperience.metalworking >= newCharacter.craftingStats.metalworking * 100) {
            newCharacter.craftingExperience.metalworking -= newCharacter.craftingStats.metalworking * 100;
            newCharacter.craftingStats.metalworking += 1;
          }
        }
        
        if (currentRecipe.experienceGain.magicworking) {
          newCharacter.craftingExperience.magicworking += currentRecipe.experienceGain.magicworking;
          // Check for level up
          if (newCharacter.craftingExperience.magicworking >= newCharacter.craftingStats.magicworking * 100) {
            newCharacter.craftingExperience.magicworking -= newCharacter.craftingStats.magicworking * 100;
            newCharacter.craftingStats.magicworking += 1;
          }
        }
        
        if (currentRecipe.experienceGain.spellcraft) {
          newCharacter.craftingExperience.spellcraft += currentRecipe.experienceGain.spellcraft;
          // Check for level up
          if (newCharacter.craftingExperience.spellcraft >= newCharacter.craftingStats.spellcraft * 100) {
            newCharacter.craftingExperience.spellcraft -= newCharacter.craftingStats.spellcraft * 100;
            newCharacter.craftingStats.spellcraft += 1;
          }
        }
        
        setCharacter(newCharacter);
        setInventory(newInventory);
        
        setCraftingResult({
          success: true,
          message: `Successfully crafted ${gameItems[currentRecipe.output].name}!`,
        });
        
        // If this is a secret recipe that was successfully crafted, add it to discovered recipes
        if (currentRecipe.isSecret) {
          const discoveredRecipeIds = localStorage.getItem('discoveredRecipes') 
            ? JSON.parse(localStorage.getItem('discoveredRecipes') || '[]') 
            : [];
          
          if (!discoveredRecipeIds.includes(currentRecipe.id)) {
            discoveredRecipeIds.push(currentRecipe.id);
            localStorage.setItem('discoveredRecipes', JSON.stringify(discoveredRecipeIds));
          }
        }
      } else {
        // Crafting failed but still consume ingredients
        setInventory(newInventory);
        
        // Deduct half the magic points on failure
        const magicCost = Math.floor(controlValues.magic / 2);
        setCharacter({
          ...character,
          magicPoints: Math.max(0, character.magicPoints - magicCost),
        });
        
        setCraftingResult({
          success: false,
          message: "Crafting failed! Materials were lost in the process.",
        });
      }
      
      // End animation
      setCraftingAnimation(false);
    }, 1000);
  };

  // Handle quick craft from recipe book
  const handleQuickCraft = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // Check if we have all ingredients
    const ingredients: Record<string, number> = {};
    recipe.inputs.forEach(input => {
      ingredients[input] = (ingredients[input] || 0) + 1;
    });
    
    // Check if we have all required ingredients
    let canCraft = true;
    const missingIngredients: string[] = [];
    
    Object.entries(ingredients).forEach(([itemId, count]) => {
      const inventoryItem = inventory.find(item => item.id === itemId);
      if (!inventoryItem || inventoryItem.quantity < count) {
        canCraft = false;
        missingIngredients.push(gameItems[itemId].name);
      }
    });
    
    if (!canCraft) {
      setCraftingResult({
        success: false,
        message: `Missing ingredients: ${missingIngredients.join(', ')}`,
      });
      return;
    }
    
    // Check if enough magic points
    if (recipe.magicCost && character.magicPoints < recipe.magicCost) {
      setCraftingResult({
        success: false,
        message: "Not enough magic points to craft this item!",
      });
      return;
    }
    
    // Remove ingredients from inventory
    const newInventory = [...inventory];
    Object.entries(ingredients).forEach(([itemId, count]) => {
      const itemIndex = newInventory.findIndex(item => item.id === itemId);
      if (newInventory[itemIndex].quantity > count) {
        newInventory[itemIndex].quantity -= count;
      } else {
        newInventory.splice(itemIndex, 1);
      }
    });
    
    // Calculate success chance based on recipe requirements
    let successChance = 80; // Base chance
    
    // Apply crafting control modifiers
    if (recipe.craftingControls) {
      Object.entries(recipe.craftingControls).forEach(([control, optimalValue]) => {
        const controlType = control as CraftingControlType;
        if (optimalValue !== undefined) {
          const difference = Math.abs(controlValues[controlType] - optimalValue);
          if (difference <= 10) successChance += 10;
          else if (difference <= 20) successChance += 5;
          else if (difference >= 40) successChance -= 15;
          else if (difference >= 30) successChance -= 10;
        }
      });
    }
    
    // Apply character stats modifiers
    if (recipe.requiredStats) {
      Object.entries(recipe.requiredStats).forEach(([stat, level]) => {
        if (stat === 'metalworking' && character.craftingStats.metalworking >= level) {
          successChance += 5;
        }
        if (stat === 'magicworking' && character.craftingStats.magicworking >= level) {
          successChance += 5;
        }
        if (stat === 'spellcraft' && character.craftingStats.spellcraft >= level) {
          successChance += 5;
        }
      });
    }
    
    // Ensure chance is within bounds
    successChance = Math.min(95, Math.max(5, successChance));
    
    // Roll for success
    const roll = Math.random() * 100;
    const success = roll <= successChance;
    
    // Play crafting animation
    setCraftingAnimation(true);
    
    setTimeout(() => {
      if (success) {
        // Add crafted item to inventory
        const existingItem = newInventory.find((item) => item.id === recipe.output);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          newInventory.push({ id: recipe.output, quantity: 1 });
        }
        
        // Award experience
        const newCharacter = { ...character };
        
        if (recipe.experienceGain.metalworking) {
          newCharacter.craftingExperience.metalworking += recipe.experienceGain.metalworking;
          // Check for level up
          if (newCharacter.craftingExperience.metalworking >= newCharacter.craftingStats.metalworking * 100) {
            newCharacter.craftingExperience.metalworking -= newCharacter.craftingStats.metalworking * 100;
            newCharacter.craftingStats.metalworking += 1;
          }
        }
        
        if (recipe.experienceGain.magicworking) {
          newCharacter.craftingExperience.magicworking += recipe.experienceGain.magicworking;
          // Check for level up
          if (newCharacter.craftingExperience.magicworking >= newCharacter.craftingStats.magicworking * 100) {
            newCharacter.craftingExperience.magicworking -= newCharacter.craftingStats.magicworking * 100;
            newCharacter.craftingStats.magicworking += 1;
          }
        }
        
        if (recipe.experienceGain.spellcraft) {
          newCharacter.craftingExperience.spellcraft += recipe.experienceGain.spellcraft;
          // Check for level up
          if (newCharacter.craftingExperience.spellcraft >= newCharacter.craftingStats.spellcraft * 100) {
            newCharacter.craftingExperience.spellcraft -= newCharacter.craftingStats.spellcraft * 100;
            newCharacter.craftingStats.spellcraft += 1;
          }
        }
        
        // Deduct magic points if required
        if (recipe.magicCost) {
          newCharacter.magicPoints = Math.max(0, newCharacter.magicPoints - recipe.magicCost);
        }
        
        setCharacter(newCharacter);
        setInventory(newInventory);
        
        setCraftingResult({
          success: true,
          message: `Successfully crafted ${gameItems[recipe.output].name}!`,
        });
        
        // If this is a secret recipe that was successfully crafted, add it to discovered recipes
        if (recipe.isSecret) {
          const discoveredRecipeIds = localStorage.getItem('discoveredRecipes') 
            ? JSON.parse(localStorage.getItem('discoveredRecipes') || '[]') 
            : [];
          
          if (!discoveredRecipeIds.includes(recipe.id)) {
            discoveredRecipeIds.push(recipe.id);
            localStorage.setItem('discoveredRecipes', JSON.stringify(discoveredRecipeIds));
          }
        }
      } else {
        // Crafting failed but still consume ingredients
        setInventory(newInventory);
        
        setCraftingResult({
          success: false,
          message: "Crafting failed! Materials were lost in the process.",
        });
        
        // Still deduct magic points if required
        if (recipe.magicCost) {
          setCharacter({
            ...character,
            magicPoints: Math.max(0, character.magicPoints - recipe.magicCost),
          });
        }
      }
      
      // End animation
      setCraftingAnimation(false);
    }, 1000);
  };

  // Handle crafting control change
  const handleControlChange = (control: CraftingControlType, value: number) => {
    setControlValues({
      ...controlValues,
      [control]: value
    });
    
    // Update temperature for backward compatibility
    if (control === "magic") {
      // Map magic (0-100) to temperature (0-500)
      setTemperature(Math.round(value * 5));
    }
  };

  // Clear crafting grid
  const clearGrid = () => {
    // Return all items to inventory
    const itemsToReturn = craftingGrid.filter((item) => item !== null) as string[]

    const newInventory = [...inventory]

    itemsToReturn.forEach((itemId) => {
      const existingItem = newInventory.find((item) => item.id === itemId)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        newInventory.push({ id: itemId, quantity: 1 })
      }
    })

    setInventory(newInventory)

    // Clear grid
    setCraftingGrid(Array(9).fill(null))
  }

  // Handle consuming a magic potion
  const handleConsumeMagicPotion = () => {
    const potionIndex = inventory.findIndex((item) => item.id === "mana_potion")

    if (potionIndex === -1) {
      setCraftingResult({
        success: false,
        message: "You don't have any mana potions!",
      })
      return
    }

    // Remove one potion from inventory
    const newInventory = [...inventory]
    if (newInventory[potionIndex].quantity > 1) {
      newInventory[potionIndex].quantity -= 1
    } else {
      newInventory.splice(potionIndex, 1)
    }

    // Restore magic points
    const mpRestore = gameItems["mana_potion"].stats?.["MP Restore"] || 15
    const newCharacter = { ...character }
    newCharacter.magicPoints = Math.min(newCharacter.maxMagicPoints, newCharacter.magicPoints + mpRestore)

    setInventory(newInventory)
    setCharacter(newCharacter)

    setCraftingResult({
      success: true,
      message: `Consumed a mana potion and restored ${mpRestore} MP!`,
    })
  }

  // Get mana potion count from inventory
  const getManaPotionCount = () => {
    const manaPotionItem = inventory.find(item => item.id === "mana_potion");
    return manaPotionItem ? manaPotionItem.quantity : 0;
  }

  // Check if character has a cursed energy ring equipped
  const hasCursedRing = character.equipment.rings.includes("cursed_energy_ring")

  // Handle equipping an item
  const handleEquipItem = (itemId: string, slot: EquipmentSlot) => {
    const newCharacter = { ...character }
    
    // Handle rings separately since they can have multiple slots
    if (slot === "rings") {
      // Find the first empty ring slot or add to the end
      const emptyIndex = newCharacter.equipment.rings.findIndex(ring => !ring)
      if (emptyIndex !== -1) {
        newCharacter.equipment.rings[emptyIndex] = itemId
      } else {
        newCharacter.equipment.rings.push(itemId)
      }
    } else {
      // For other slots, just assign the item
      if (slot === "head") newCharacter.equipment.head = itemId;
      else if (slot === "chest") newCharacter.equipment.chest = itemId;
      else if (slot === "legs") newCharacter.equipment.legs = itemId;
      else if (slot === "feet") newCharacter.equipment.feet = itemId;
      else if (slot === "hands") newCharacter.equipment.hands = itemId;
      else if (slot === "weapon") newCharacter.equipment.weapon = itemId;
      else if (slot === "offhand") newCharacter.equipment.offhand = itemId;
    }
    
    // Remove the item from inventory
    const newInventory = [...inventory]
    const itemIndex = newInventory.findIndex(item => item.id === itemId)
    
    if (itemIndex !== -1) {
      if (newInventory[itemIndex].quantity > 1) {
        newInventory[itemIndex].quantity -= 1
      } else {
        newInventory.splice(itemIndex, 1)
      }
    }
    
    setCharacter(newCharacter)
    setInventory(newInventory)
  }
  
  // Handle unequipping an item
  const handleUnequipItem = (slot: EquipmentSlot, ringIndex?: number) => {
    const newCharacter = { ...character }
    let itemId: string | undefined
    
    // Handle rings separately
    if (slot === "rings" && ringIndex !== undefined) {
      itemId = newCharacter.equipment.rings[ringIndex]
      if (itemId) {
        // Remove the ring from the specific slot
        const newRings = [...newCharacter.equipment.rings];
        newRings[ringIndex] = "";
        newCharacter.equipment.rings = newRings;
      }
    } else {
      // For other slots
      if (slot === "head") {
        itemId = newCharacter.equipment.head;
        newCharacter.equipment.head = undefined;
      } else if (slot === "chest") {
        itemId = newCharacter.equipment.chest;
        newCharacter.equipment.chest = undefined;
      } else if (slot === "legs") {
        itemId = newCharacter.equipment.legs;
        newCharacter.equipment.legs = undefined;
      } else if (slot === "feet") {
        itemId = newCharacter.equipment.feet;
        newCharacter.equipment.feet = undefined;
      } else if (slot === "hands") {
        itemId = newCharacter.equipment.hands;
        newCharacter.equipment.hands = undefined;
      } else if (slot === "weapon") {
        itemId = newCharacter.equipment.weapon;
        newCharacter.equipment.weapon = undefined;
      } else if (slot === "offhand") {
        itemId = newCharacter.equipment.offhand;
        newCharacter.equipment.offhand = undefined;
      }
    }
    
    // Add the item back to inventory if it was equipped
    if (itemId) {
      const newInventory = [...inventory]
      const existingItem = newInventory.find(item => item.id === itemId)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        newInventory.push({ id: itemId, quantity: 1 })
      }
      
      setInventory(newInventory)
    }
    
    setCharacter(newCharacter)
  }

  // Handle inventory item click (adds to first empty grid slot)
  const handleInventoryItemClick = (itemId: string) => {
    const inventoryItem = inventory.find((item) => item.id === itemId);
    if (!inventoryItem || inventoryItem.quantity <= 0) return;

    // Find first empty slot
    const emptyIndex = craftingGrid.findIndex((item) => item === null);
    if (emptyIndex === -1) return; // No empty slots

    // Update grid
    const newGrid = [...craftingGrid];
    newGrid[emptyIndex] = itemId;
    setCraftingGrid(newGrid);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-400">Crafting Workshop</h2>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setShowRecipeBook(!showRecipeBook)}
                  className="game-button-secondary"
                >
                  <Book className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Recipe Book</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Crafting Controls at the top */}
      <div className="game-card">
        <div className="game-card-header">
          <h3 className="text-lg font-medium text-amber-400">Crafting Controls</h3>
        </div>
        <div className="game-card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Magic Power
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max={character.magicPoints}
                    value={controlValues.magic}
                    onChange={(e) => {
                      const value = Math.min(parseInt(e.target.value) || 0, character.magicPoints);
                      handleControlChange("magic", value);
                    }}
                    className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                  />
                  <div className="flex-1">
                    <Slider
                      value={[controlValues.magic]}
                      min={0}
                      max={character.magicPoints}
                      step={1}
                      onValueChange={(value) => handleControlChange("magic", value[0])}
                    />
                  </div>
                  <span className="text-xs text-blue-400">{character.magicPoints} MP</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Spend magic points to enhance your crafting. Higher values increase success chance and item quality.
                </p>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stability
                </label>
                <Slider
                  value={[controlValues.stability]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleControlChange("stability", value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Controls how stable the magical energies are during crafting.
                </p>
              </div>
              
              {/* Show curse control only if character has a cursed ring */}
              {character.equipment.rings.includes("cursed_energy_ring") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-purple-400 mb-2 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Curse Energy
                  </label>
                  <Slider
                    value={[controlValues.curse]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleControlChange("curse", value[0])}
                    className="bg-purple-900/20"
                  />
                  <p className="text-xs text-purple-400 mt-1">
                    Infuses dark energies that can provide powerful but dangerous effects.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Crafting Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="game-card">
            <div className="game-card-header">
              <h3 className="text-lg font-medium text-amber-400">Crafting Grid</h3>
            </div>
            <div className="game-card-content">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {craftingGrid.map((item, index) => (
                  <div
                    key={index}
                    className={`game-grid-cell aspect-square flex items-center justify-center ${
                      item ? "border-gray-600" : "border-dashed"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add("border-amber-500")
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("border-amber-500")
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove("border-amber-500")
                      handleDropOnGrid(index)
                    }}
                  >
                    {item && (
                      <div className="relative w-full h-full">
                        <div
                          draggable
                          onDragStart={(e) => {
                            setDraggedItem(item)
                            setDragSource("grid")
                            setDragIndex(index)
                          }}
                          className="w-full h-full flex items-center justify-center cursor-grab"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <img
                                  src={gameItems[item]?.image || "/placeholder.png"}
                                  alt={gameItems[item]?.name || item}
                                  className="max-w-full max-h-full p-1"
                                />
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <div className="space-y-1">
                                  <p className="font-medium">{gameItems[item]?.name}</p>
                                  <p className="text-xs text-gray-400">{gameItems[item]?.description}</p>
                                  <p className="text-xs text-gray-400">{gameItems[item]?.type}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <button 
                          className="absolute -top-2 -right-2 bg-red-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                          onClick={() => {
                            const newGrid = [...craftingGrid];
                            newGrid[index] = null;
                            setCraftingGrid(newGrid);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={clearGrid}
                  className="bg-red-800 hover:bg-red-700 text-white"
                >
                  Clear Grid
                </Button>
                
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleCraft}
                  disabled={!result}
                  className="game-button-primary"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Craft Item
                </Button>
              </div>
              
              {craftingResult && (
                <Alert className={craftingResult.success ? "bg-green-900 border-green-700" : "bg-red-900 border-red-700"}>
                  <AlertDescription>
                    {craftingResult.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {currentRecipe && (
                <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-amber-400 font-medium">{gameItems[currentRecipe.output]?.name || currentRecipe.output}</h4>
                      <p className="text-sm text-gray-400">{currentRecipe.description}</p>
                    </div>
                    {result && (
                      <img 
                        src={gameItems[result]?.image || "/placeholder.png"} 
                        alt={gameItems[result]?.name || result}
                        className="w-12 h-12 bg-gray-900 p-1 rounded-md border border-gray-700"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Character Stats and Inventory */}
        <div className="space-y-4">
          <CraftingCharacterStats 
            character={character} 
            onConsumeMagicPotion={handleConsumeMagicPotion}
            manaPotionCount={getManaPotionCount()}
          />
          
          <div className="game-card">
            <div className="game-card-header flex justify-between items-center">
              <h3 className="text-lg font-medium text-amber-400">Inventory</h3>
              <div className="flex space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="game-button-secondary h-8 w-8"
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Filter Inventory</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="game-button-secondary h-8 w-8"
                      >
                        <ArrowDownUp className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sort Inventory</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="game-card-content">
              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Filter by Type</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge 
                          variant={inventoryFilter === "all" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInventoryFilter("all")}
                        >
                          All
                        </Badge>
                        <Badge 
                          variant={inventoryFilter === "ingredient" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInventoryFilter("ingredient" as ItemType)}
                        >
                          Materials
                        </Badge>
                        <Badge 
                          variant={inventoryFilter === "weapon" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInventoryFilter("weapon" as ItemType)}
                        >
                          Weapons
                        </Badge>
                        <Badge 
                          variant={inventoryFilter === "armor" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInventoryFilter("armor" as ItemType)}
                        >
                          Armor
                        </Badge>
                        <Badge 
                          variant={inventoryFilter === "potion" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInventoryFilter("potion" as ItemType)}
                        >
                          Potions
                        </Badge>
                        <Badge 
                          variant={inventoryFilter === "accessory" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInventoryFilter("accessory" as ItemType)}
                        >
                          Accessories
                        </Badge>
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Filter by Rarity</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant={rarityFilter === "all" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setRarityFilter("all")}
                        >
                          All
                        </Badge>
                        <Badge 
                          variant={rarityFilter === "common" ? "outline" : "outline"}
                          className={`cursor-pointer ${rarityFilter === "common" ? "bg-gray-700" : ""}`}
                          onClick={() => setRarityFilter("common" as ItemRarity)}
                        >
                          Common
                        </Badge>
                        <Badge 
                          variant={rarityFilter === "uncommon" ? "secondary" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setRarityFilter("uncommon" as ItemRarity)}
                        >
                          Uncommon
                        </Badge>
                        <Badge 
                          variant={rarityFilter === "rare" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setRarityFilter("rare" as ItemRarity)}
                        >
                          Rare
                        </Badge>
                        <Badge 
                          variant={rarityFilter === "epic" ? "destructive" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setRarityFilter("epic" as ItemRarity)}
                        >
                          Epic
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Sort by</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant={inventorySort === "name" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInventorySort("name")}
                        >
                          Name
                        </Badge>
                        <Badge 
                          variant={inventorySort === "type" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInventorySort("type")}
                        >
                          Type
                        </Badge>
                        <Badge 
                          variant={inventorySort === "quantity" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInventorySort("quantity")}
                        >
                          Quantity
                        </Badge>
                        <Badge 
                          variant={inventorySort === "rarity" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInventorySort("rarity")}
                        >
                          Rarity
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredInventory.map((item) => {
                  const gameItem = gameItems[item.id]
                  if (!gameItem) return null
                  return (
                    <TooltipProvider key={item.id} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`relative p-2 bg-gray-800 rounded border ${
                              draggedItem === item.id ? "border-amber-400" : "border-gray-700"
                            } cursor-grab flex flex-col items-center justify-center text-center`}
                            draggable
                            onDragStart={(e) => handleDragStart(item.id, "inventory", 0)}
                            onDragEnd={handleDropOnInventory}
                          >
                            <div className="w-10 h-10 mb-1 relative">
                              <img 
                                src={gameItem.image || "/placeholder.png"} 
                                alt={gameItem.name}
                                className="w-full h-full object-contain"
                              />
                              {gameItem.rarity && gameItem.rarity !== "common" && (
                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                                  gameItem.rarity === "uncommon" ? "bg-green-500" :
                                  gameItem.rarity === "rare" ? "bg-blue-500" :
                                  gameItem.rarity === "epic" ? "bg-purple-500" :
                                  gameItem.rarity === "legendary" ? "bg-amber-500" : ""
                                }`} />
                              )}
                            </div>
                            <div className="text-xs font-medium truncate w-full">{gameItem.name}</div>
                            <div className="text-xs text-gray-400">x{item.quantity}</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="w-64 p-0 bg-gray-900 border-gray-700">
                          <div className="p-3">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-white">{gameItem.name}</h3>
                              <Badge className={`
                                ${gameItem.rarity === "common" ? "bg-gray-600" : ""}
                                ${gameItem.rarity === "uncommon" ? "bg-green-600" : ""}
                                ${gameItem.rarity === "rare" ? "bg-blue-600" : ""}
                                ${gameItem.rarity === "epic" ? "bg-purple-600" : ""}
                                ${gameItem.rarity === "legendary" ? "bg-amber-600" : ""}
                              `}>
                                {gameItem.rarity ? gameItem.rarity.charAt(0).toUpperCase() + gameItem.rarity.slice(1) : "Common"}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mb-2 text-xs text-gray-400">
                              <span>{gameItem.type.charAt(0).toUpperCase() + gameItem.type.slice(1)}</span>
                              {gameItem.slot && (
                                <>
                                  <span>•</span>
                                  <span>{gameItem.slot.charAt(0).toUpperCase() + gameItem.slot.slice(1)}</span>
                                </>
                              )}
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{gameItem.description}</p>
                            
                            {gameItem.stats && Object.keys(gameItem.stats).length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-700">
                                <h4 className="text-xs font-semibold text-gray-400 mb-1">STATS</h4>
                                <ul className="text-sm space-y-1">
                                  {Object.entries(gameItem.stats).map(([stat, value]) => (
                                    <li key={stat} className="flex justify-between">
                                      <span className="text-gray-300">{stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
                                      <span className={value > 0 ? "text-green-400" : "text-red-400"}>
                                        {value > 0 ? "+" : ""}{value}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {gameItem.requiredLevel && gameItem.requiredLevel > 1 && (
                              <div className="mt-2 text-sm">
                                <span className={character.level >= gameItem.requiredLevel 
                                  ? "text-green-400" 
                                  : "text-red-400"
                                }>
                                  Requires Level {gameItem.requiredLevel}
                                </span>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showRecipeBook && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowRecipeBook(false)}>
          <div ref={recipeBookRef} className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-amber-400">Recipe Book</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowRecipeBook(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-4rem)]">
              <RecipeBook 
                recipes={recipes} 
                gameItems={gameItems} 
                characterStats={character} 
                inventory={inventory}
                onQuickCraft={handleQuickCraft}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

