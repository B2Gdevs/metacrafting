import { useState, useCallback, useMemo } from "react";
import { CraftingControlType } from "@/lib/recipes";
import { EquipmentSlot } from "@/lib/items";
import { CharacterStats } from "@/components/character-sheet";
import { Item } from "@/components/item-slot";
import { Recipe } from "@/components/recipe-book";

export interface UseCraftingProps {
  character: CharacterStats;
  inventory: Array<{ id: string; quantity: number }>;
  gameItems: Record<string, Item>;
  recipes: Recipe[];
  onUpdateCharacter: (updatedCharacter: CharacterStats, updatedInventory?: Array<{ id: string; quantity: number }>) => void;
}

export interface UseCraftingReturn {
  // Grid state
  grid: (string | null)[];
  isDraggingOver: boolean;
  highlightedCells: number[];
  
  // Control state
  controlValues: Record<CraftingControlType, number>;
  
  // Recipe state
  selectedRecipe: Recipe | null;
  
  // Handlers
  handleDragStart: (item: string, source: "inventory" | "grid", index: number) => void;
  handleDropOnGrid: (index: number) => void;
  handleDropOnInventory: () => void;
  handleControlChange: (control: CraftingControlType, value: number) => void;
  handleCraft: () => void;
  handleQuickCraft: (recipeId: string) => void;
  clearGrid: () => void;
  handleConsumeMagicPotion: () => void;
  handleEquipItem: (itemId: string, slot: EquipmentSlot) => void;
  handleUnequipItem: (slot: EquipmentSlot, ringIndex?: number) => void;
  handleInventoryItemClick: (itemId: string) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  
  // Computed values
  successChance: number;
  hasCursedRing: boolean;
  manaPotionCount: number;
  magicCost: number;
}

export const useCrafting = ({
  character,
  inventory,
  gameItems,
  recipes,
  onUpdateCharacter
}: UseCraftingProps): UseCraftingReturn => {
  // Grid state
  const [grid, setGrid] = useState<(string | null)[]>(Array(9).fill(null));
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);
  
  // Drag state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<"inventory" | "grid" | null>(null);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  
  // Control state
  const [controlValues, setControlValues] = useState<Record<CraftingControlType, number>>({
    magic: 0,
    stability: 50,
    curse: 0
  });
  
  // Recipe state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Check if character has a cursed energy ring equipped
  const hasCursedRing = useMemo(() => {
    return character.equipment.rings.includes("cursed_energy_ring");
  }, [character.equipment.rings]);
  
  // Calculate magic cost based on magic power level
  const magicCost = useMemo(() => {
    const baseCost = 10; // Base magic cost
    const magicLevel = Math.floor(controlValues.magic / 20); // 0-5 scale
    return baseCost * (magicLevel + 1);
  }, [controlValues.magic]);
  
  // Get mana potion count from inventory
  const manaPotionCount = useMemo(() => {
    const potion = inventory.find(item => item.id === "mana_potion");
    return potion ? potion.quantity : 0;
  }, [inventory]);
  
  // Calculate success chance for crafting
  const calculateSuccessChance = useCallback(() => {
    if (!selectedRecipe) return 50;
    
    // Base chance calculation
    let baseChance = 50;
    
    // Skill check
    if (selectedRecipe.requiredStats) {
      let totalRequiredSkill = 0;
      let totalCharacterSkill = 0;
      
      if (selectedRecipe.requiredStats.metalworking) {
        totalRequiredSkill += selectedRecipe.requiredStats.metalworking;
        totalCharacterSkill += Math.min(
          character.craftingStats.metalworking, 
          selectedRecipe.requiredStats.metalworking
        );
      }
      
      if (selectedRecipe.requiredStats.magicworking) {
        totalRequiredSkill += selectedRecipe.requiredStats.magicworking;
        totalCharacterSkill += Math.min(
          character.craftingStats.magicworking, 
          selectedRecipe.requiredStats.magicworking
        );
      }
      
      if (selectedRecipe.requiredStats.spellcraft) {
        totalRequiredSkill += selectedRecipe.requiredStats.spellcraft;
        totalCharacterSkill += Math.min(
          character.craftingStats.spellcraft, 
          selectedRecipe.requiredStats.spellcraft
        );
      }
      
      if (totalRequiredSkill > 0) {
        // Add 5% per skill level above required, cap at 95%
        const skillBonus = Math.min(45, Math.max(0, totalCharacterSkill - totalRequiredSkill) * 5);
        // Penalty for being under-skilled is more severe
        const skillPenalty = Math.max(0, totalRequiredSkill - totalCharacterSkill) * 10;
        
        baseChance = Math.min(95, Math.max(5, baseChance + skillBonus - skillPenalty));
      }
    }
    
    // Stability affects success chance
    const stabilityEffect = (controlValues.stability - 50) / 2;
    
    // Curse energy reduces success chance
    const curseEffect = controlValues.curse > 0 ? -(controlValues.curse / 10) : 0;
    
    // Calculate final chance
    let finalChance = baseChance + stabilityEffect + curseEffect;
    
    // Cap between 5% and 95%
    return Math.min(95, Math.max(5, finalChance));
  }, [selectedRecipe, character.craftingStats, controlValues]);
  
  // Memoized success chance
  const successChance = useMemo(() => {
    return calculateSuccessChance();
  }, [calculateSuccessChance]);
  
  // Handlers
  const handleDragStart = useCallback((item: string, source: "inventory" | "grid", index: number) => {
    setDraggedItem(item);
    setDragSource(source);
    setDragSourceIndex(index);
  }, []);
  
  const handleDropOnGrid = useCallback((index: number) => {
    if (!draggedItem) return;
    
    // Create a new grid with the dragged item
    const newGrid = [...grid];
    
    // If dragging from grid, clear the source cell
    if (dragSource === "grid" && dragSourceIndex !== null) {
      newGrid[dragSourceIndex] = null;
    }
    
    // Place the item in the target cell
    newGrid[index] = draggedItem;
    
    // Update the grid
    setGrid(newGrid);
    
    // Reset drag state
    setDraggedItem(null);
    setDragSource(null);
    setDragSourceIndex(null);
    
    // If dragging from inventory, update inventory
    if (dragSource === "inventory") {
      const updatedInventory = [...inventory];
      const itemIndex = updatedInventory.findIndex(item => item.id === draggedItem);
      
      if (itemIndex !== -1) {
        updatedInventory[itemIndex].quantity -= 1;
        
        // Remove item if quantity is 0
        if (updatedInventory[itemIndex].quantity <= 0) {
          updatedInventory.splice(itemIndex, 1);
        }
        
        // Update character with new inventory
        onUpdateCharacter(
          character,
          updatedInventory
        );
      }
    }
  }, [draggedItem, dragSource, dragSourceIndex, grid, inventory, character, onUpdateCharacter]);
  
  const handleDropOnInventory = useCallback(() => {
    if (!draggedItem || dragSource !== "grid" || dragSourceIndex === null) return;
    
    // Create a new grid with the dragged item removed
    const newGrid = [...grid];
    newGrid[dragSourceIndex] = null;
    
    // Update the grid
    setGrid(newGrid);
    
    // Add the item back to inventory
    const updatedInventory = [...inventory];
    const existingItem = updatedInventory.find(item => item.id === draggedItem);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedInventory.push({ id: draggedItem, quantity: 1 });
    }
    
    // Update character with new inventory
    onUpdateCharacter(
      character,
      updatedInventory
    );
    
    // Reset drag state
    setDraggedItem(null);
    setDragSource(null);
    setDragSourceIndex(null);
  }, [draggedItem, dragSource, dragSourceIndex, grid, inventory, character, onUpdateCharacter]);
  
  const handleControlChange = useCallback((control: CraftingControlType, value: number) => {
    setControlValues(prev => ({
      ...prev,
      [control]: value
    }));
  }, []);
  
  const handleCraft = useCallback(() => {
    if (!selectedRecipe) return;
    
    // Check if player has enough magic points
    if (character.magicPoints < magicCost) {
      // Handle insufficient magic points
      return;
    }
    
    // Check if crafting succeeds based on success chance
    const roll = Math.random() * 100;
    const craftingSucceeds = roll <= successChance;
    
    if (craftingSucceeds) {
      // Add crafted item to inventory
      const updatedInventory = [...inventory];
      const existingItem = updatedInventory.find(item => item.id === selectedRecipe.output);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        updatedInventory.push({ id: selectedRecipe.output, quantity: 1 });
      }
      
      // Calculate experience gain
      const expGain = selectedRecipe.experienceGain || {};
      
      // Update character stats
      const updatedCharacter = {
        ...character,
        inventory: updatedInventory,
        magicPoints: Math.max(0, character.magicPoints - magicCost),
        craftingExperience: {
          metalworking: character.craftingExperience.metalworking + (expGain.metalworking || 0),
          magicworking: character.craftingExperience.magicworking + (expGain.magicworking || 0),
          spellcraft: character.craftingExperience.spellcraft + (expGain.spellcraft || 0)
        }
      };
      
      // Check for level ups
      const checkLevelUp = (skill: keyof typeof character.craftingStats) => {
        const currentLevel = character.craftingStats[skill];
        const currentExp = updatedCharacter.craftingExperience[skill];
        const requiredExp = currentLevel * 100;
        
        if (currentExp >= requiredExp) {
          updatedCharacter.craftingStats[skill] += 1;
          updatedCharacter.craftingExperience[skill] -= requiredExp;
        }
      };
      
      checkLevelUp("metalworking");
      checkLevelUp("magicworking");
      checkLevelUp("spellcraft");
      
      // Update character
      onUpdateCharacter(updatedCharacter);
      
      // Clear the grid
      clearGrid();
    } else {
      // Crafting failed
      // Consume magic points anyway
      onUpdateCharacter({
        ...character,
        magicPoints: Math.max(0, character.magicPoints - magicCost)
      });
    }
  }, [selectedRecipe, character, inventory, magicCost, successChance, onUpdateCharacter]);
  
  const handleQuickCraft = useCallback((recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // Check if player has all required ingredients
    const requiredItems: Record<string, number> = {};
    recipe.inputs.forEach(itemId => {
      requiredItems[itemId] = (requiredItems[itemId] || 0) + 1;
    });
    
    const hasAllIngredients = Object.entries(requiredItems).every(([itemId, count]) => {
      const inventoryItem = inventory.find(item => item.id === itemId);
      return inventoryItem && inventoryItem.quantity >= count;
    });
    
    if (!hasAllIngredients) return;
    
    // Remove ingredients from inventory
    const updatedInventory = [...inventory];
    Object.entries(requiredItems).forEach(([itemId, count]) => {
      const itemIndex = updatedInventory.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        updatedInventory[itemIndex].quantity -= count;
        if (updatedInventory[itemIndex].quantity <= 0) {
          updatedInventory.splice(itemIndex, 1);
        }
      }
    });
    
    // Add crafted item to inventory
    const existingItem = updatedInventory.find(item => item.id === recipe.output);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedInventory.push({ id: recipe.output, quantity: 1 });
    }
    
    // Calculate experience gain
    const expGain = recipe.experienceGain || {};
    
    // Update character stats
    const updatedCharacter = {
      ...character,
      inventory: updatedInventory,
      craftingExperience: {
        metalworking: character.craftingExperience.metalworking + (expGain.metalworking || 0),
        magicworking: character.craftingExperience.magicworking + (expGain.magicworking || 0),
        spellcraft: character.craftingExperience.spellcraft + (expGain.spellcraft || 0)
      }
    };
    
    // Check for level ups
    const checkLevelUp = (skill: keyof typeof character.craftingStats) => {
      const currentLevel = character.craftingStats[skill];
      const currentExp = updatedCharacter.craftingExperience[skill];
      const requiredExp = currentLevel * 100;
      
      if (currentExp >= requiredExp) {
        updatedCharacter.craftingStats[skill] += 1;
        updatedCharacter.craftingExperience[skill] -= requiredExp;
      }
    };
    
    checkLevelUp("metalworking");
    checkLevelUp("magicworking");
    checkLevelUp("spellcraft");
    
    // Update character
    onUpdateCharacter(updatedCharacter);
  }, [recipes, inventory, character, onUpdateCharacter]);
  
  const clearGrid = useCallback(() => {
    setGrid(Array(9).fill(null));
  }, []);
  
  const handleConsumeMagicPotion = useCallback(() => {
    const potionIndex = inventory.findIndex(item => item.id === "mana_potion");
    if (potionIndex === -1 || inventory[potionIndex].quantity <= 0) return;
    
    // Remove one potion from inventory
    const updatedInventory = [...inventory];
    updatedInventory[potionIndex].quantity -= 1;
    
    if (updatedInventory[potionIndex].quantity <= 0) {
      updatedInventory.splice(potionIndex, 1);
    }
    
    // Restore magic points
    const restoredAmount = 25; // Amount restored by a potion
    const newMagicPoints = Math.min(character.maxMagicPoints, character.magicPoints + restoredAmount);
    
    // Update character
    onUpdateCharacter(
      {
        ...character,
        magicPoints: newMagicPoints
      },
      updatedInventory
    );
  }, [inventory, character, onUpdateCharacter]);
  
  const handleEquipItem = useCallback((itemId: string, slot: EquipmentSlot) => {
    // Find the item in inventory
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    // Remove item from inventory
    const updatedInventory = [...inventory];
    updatedInventory[itemIndex].quantity -= 1;
    
    if (updatedInventory[itemIndex].quantity <= 0) {
      updatedInventory.splice(itemIndex, 1);
    }
    
    // Update equipment
    const updatedEquipment = { ...character.equipment };
    
    // If there's an item already equipped, add it back to inventory
    if (slot === "rings") {
      // For rings, find the first empty slot
      const emptyIndex = updatedEquipment.rings.findIndex(ring => !ring);
      
      if (emptyIndex !== -1) {
        updatedEquipment.rings[emptyIndex] = itemId;
      } else {
        // If no empty slot, replace the first ring and add it to inventory
        const oldRing = updatedEquipment.rings[0];
        
        if (oldRing) {
          const existingItem = updatedInventory.find(item => item.id === oldRing);
          
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            updatedInventory.push({ id: oldRing, quantity: 1 });
          }
        }
        
        updatedEquipment.rings[0] = itemId;
      }
    } else {
      const oldItem = updatedEquipment[slot];
      
      if (oldItem) {
        const existingItem = updatedInventory.find(item => item.id === oldItem);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          updatedInventory.push({ id: oldItem, quantity: 1 });
        }
      }
      
      updatedEquipment[slot] = itemId;
    }
    
    // Update character
    onUpdateCharacter(
      {
        ...character,
        equipment: updatedEquipment
      },
      updatedInventory
    );
  }, [inventory, character, onUpdateCharacter]);
  
  const handleUnequipItem = useCallback((slot: EquipmentSlot, ringIndex?: number) => {
    // Get the item to unequip
    let itemId: string | undefined;
    
    if (slot === "rings" && ringIndex !== undefined) {
      itemId = character.equipment.rings[ringIndex];
    } else {
      itemId = character.equipment[slot as keyof Omit<typeof character.equipment, 'rings'>] as string | undefined;
    }
    
    if (!itemId) return;
    
    // Add item to inventory
    const updatedInventory = [...inventory];
    const existingItem = updatedInventory.find(item => item.id === itemId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedInventory.push({ id: itemId, quantity: 1 });
    }
    
    // Update equipment
    const updatedEquipment = { ...character.equipment };
    
    if (slot === "rings" && ringIndex !== undefined) {
      const newRings = [...updatedEquipment.rings];
      newRings[ringIndex] = "";
      updatedEquipment.rings = newRings;
    } else {
      (updatedEquipment[slot as keyof Omit<typeof updatedEquipment, 'rings'>] as string) = "";
    }
    
    // Update character
    onUpdateCharacter(
      {
        ...character,
        equipment: updatedEquipment
      },
      updatedInventory
    );
  }, [inventory, character, onUpdateCharacter]);
  
  const handleInventoryItemClick = useCallback((itemId: string) => {
    // Find the item in inventory
    const inventoryItem = inventory.find(item => item.id === itemId);
    if (!inventoryItem) return;
    
    // Get the game item
    const item = gameItems[itemId];
    if (!item) return;
    
    // If the item is equippable, equip it
    if (item.equippable && item.slot) {
      handleEquipItem(itemId, item.slot);
    }
  }, [inventory, gameItems, handleEquipItem]);
  
  return {
    // Grid state
    grid,
    isDraggingOver,
    highlightedCells,
    
    // Control state
    controlValues,
    
    // Recipe state
    selectedRecipe,
    
    // Handlers
    handleDragStart,
    handleDropOnGrid,
    handleDropOnInventory,
    handleControlChange,
    handleCraft,
    handleQuickCraft,
    clearGrid,
    handleConsumeMagicPotion,
    handleEquipItem,
    handleUnequipItem,
    handleInventoryItemClick,
    setSelectedRecipe,
    
    // Computed values
    successChance,
    hasCursedRing,
    manaPotionCount,
    magicCost
  };
}; 