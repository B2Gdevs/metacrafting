import { useState, useCallback, useMemo, useEffect } from "react";
import { CraftingControlType } from "@/lib/recipes";
import { EquipmentSlot } from "@/lib/items";
import { CharacterStats } from "@/components/character-sheet";
import { Item } from "@/components/item-slot";
import { Recipe } from "@/components/recipe-book";

export interface UseCraftingProps {
  character: CharacterStats;
  inventory: Array<{ id: string; quantity: number; craftingPattern?: string }>;
  gameItems: Record<string, Item>;
  recipes: Recipe[];
  onUpdateCharacter: (updatedCharacter: CharacterStats, updatedInventory?: Array<{ id: string; quantity: number; craftingPattern?: string }>) => void;
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
  
  // Notification state
  craftingNotification: {
    type: 'success' | 'error';
    message: string;
  } | null;
  
  // Handlers
  handleDragStart: (item: string, source: "inventory" | "grid", index: number) => void;
  handleDropOnGrid: (index: number) => void;
  handleDropOnInventory: () => void;
  handleControlChange: (control: CraftingControlType, value: number) => void;
  handleCraft: () => void;
  handleQuickCraft: (recipeId: string) => void;
  handleQuickAdd: (recipe: Recipe) => void;
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
  
  // Helper functions
  findMatchingRecipe: () => Recipe | null;
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
  
  // Add a new state for crafting notifications
  const [craftingNotification, setCraftingNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  // Check if character has a cursed energy ring equipped
  const hasCursedRing = useMemo(() => {
    return character.equipment.rings.includes("cursed_energy_ring");
  }, [character.equipment.rings]);
  
  // Function to find a matching recipe based on grid contents
  const findMatchingRecipe = useCallback(() => {
    // Skip if grid is empty
    if (!grid.some(item => item !== null)) {
      return null;
    }
    
    // Get non-null items from the grid
    const gridItems = grid.filter(item => item !== null) as string[];
    
    // Sort the grid items to match recipe inputs regardless of position
    const sortedGridItems = [...gridItems].sort();
    
    // Find a recipe that matches the grid items
    return recipes.find(recipe => {
      // Skip if recipe requires more items than we have
      if (recipe.inputs.length !== gridItems.length) {
        return false;
      }
      
      // Sort the recipe inputs to match grid items regardless of position
      const sortedRecipeInputs = [...recipe.inputs].sort();
      
      // Check if the sorted arrays match
      return sortedRecipeInputs.every((item, index) => item === sortedGridItems[index]);
    }) || null;
  }, [grid, recipes]);
  
  // Calculate magic cost based on control values and recipe
  const calculateMagicCost = useCallback(() => {
    // Try to find a matching recipe if none is selected
    const recipeToUse = selectedRecipe || findMatchingRecipe();
    if (!recipeToUse) return 0;
    
    // Base cost from recipe (if it's a magical item)
    const baseCost = recipeToUse.magicCost || 0;
    
    // Additional cost from magic power control
    // Magic power cost scales with the value: 0-20: 0 MP, 21-40: 5 MP, 41-60: 10 MP, 61-80: 15 MP, 81-100: 20 MP
    const magicPowerCost = Math.floor(controlValues.magic / 20) * 5;
    
    // Additional cost from curse energy (if using it)
    // Curse energy costs 1 MP per 10 points
    const curseCost = Math.floor(controlValues.curse / 10);
    
    // Calculate total cost
    return baseCost + magicPowerCost + curseCost;
  }, [selectedRecipe, findMatchingRecipe, controlValues]);
  
  // Memoized magic cost
  const magicCost = useMemo(() => {
    return calculateMagicCost();
  }, [calculateMagicCost]);
  
  // Get mana potion count from inventory
  const manaPotionCount = useMemo(() => {
    const potion = inventory.find(item => item.id === "mana_potion");
    return potion ? potion.quantity : 0;
  }, [inventory]);
  
  // Function to clear the crafting grid
  const clearGrid = useCallback(() => {
    // Create a new grid with all cells empty
    const newGrid = Array(9).fill(null);
    
    // Update the grid
    setGrid(newGrid);
  }, []);
  
  // Calculate success chance for crafting
  const calculateSuccessChance = useCallback(() => {
    // Base chance is high for all crafting
    let baseChance = 90; // 90% base chance for all items
    
    // If we have a recipe, we can adjust based on skills
    const recipeToUse = selectedRecipe || findMatchingRecipe();
    
    if (recipeToUse && recipeToUse.requiredStats) {
      let totalRequiredSkill = 0;
      let totalCharacterSkill = 0;
      
      if (recipeToUse.requiredStats.metalworking) {
        totalRequiredSkill += recipeToUse.requiredStats.metalworking;
        totalCharacterSkill += Math.min(
          character.craftingStats.metalworking, 
          recipeToUse.requiredStats.metalworking * 2 // Cap at twice the required skill
        );
      }
      
      if (recipeToUse.requiredStats.magicworking) {
        totalRequiredSkill += recipeToUse.requiredStats.magicworking;
        totalCharacterSkill += Math.min(
          character.craftingStats.magicworking, 
          recipeToUse.requiredStats.magicworking * 2 // Cap at twice the required skill
        );
      }
      
      if (recipeToUse.requiredStats.spellcraft) {
        totalRequiredSkill += recipeToUse.requiredStats.spellcraft;
        totalCharacterSkill += Math.min(
          character.craftingStats.spellcraft, 
          recipeToUse.requiredStats.spellcraft * 2 // Cap at twice the required skill
        );
      }
      
      if (totalRequiredSkill > 0) {
        // Add 5% per skill level above required, cap at 95%
        const skillBonus = Math.min(45, Math.max(0, totalCharacterSkill - totalRequiredSkill) * 5);
        // Penalty for being under-skilled is more severe
        const skillPenalty = Math.max(0, totalRequiredSkill - totalCharacterSkill) * 10;
        
        baseChance = Math.min(95, Math.max(5, baseChance + skillBonus - skillPenalty));
      }
      
      // Stability affects success chance only for magical items
      const stabilityEffect = recipeToUse.magicCost ? (controlValues.stability - 50) / 2 : 0;
      
      // Curse energy reduces success chance only for magical items
      const curseEffect = (recipeToUse.magicCost && controlValues.curse > 0) ? -(controlValues.curse / 10) : 0;
      
      // Apply effects
      baseChance += stabilityEffect + curseEffect;
    }
    
    // Cap between 5% and 95%
    return Math.min(95, Math.max(5, baseChance));
  }, [selectedRecipe, findMatchingRecipe, character.craftingStats, controlValues]);
  
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
    
    // If the target cell already has an item, return it to inventory
    if (newGrid[index] !== null) {
      const existingItem = newGrid[index];
      // Only return to inventory if we're moving within the grid
      if (dragSource === "grid" && existingItem) {
        const updatedInventory = [...inventory];
        const inventoryItem = updatedInventory.find(item => item.id === existingItem);
        
        if (inventoryItem) {
          inventoryItem.quantity += 1;
        } else {
          updatedInventory.push({ id: existingItem, quantity: 1 });
        }
        
        // Update character with new inventory
        onUpdateCharacter(
          character,
          updatedInventory
        );
      }
    }
    
    // Place the item in the target cell
    newGrid[index] = draggedItem;
    
    // Update the grid
    setGrid(newGrid);
    
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
    
    // Reset drag state
    setDraggedItem(null);
    setDragSource(null);
    setDragSourceIndex(null);
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
  
  // Pattern checking functions
  const checkLinearPattern = useCallback((grid: (string | null)[]) => {
    // Check horizontal lines
    for (let row = 0; row < 3; row++) {
      const startIdx = row * 3;
      if (grid[startIdx] && grid[startIdx + 1] && grid[startIdx + 2]) {
        return true;
      }
    }
    
    // Check vertical lines
    for (let col = 0; col < 3; col++) {
      if (grid[col] && grid[col + 3] && grid[col + 6]) {
        return true;
      }
    }
    
    return false;
  }, []);

  const checkDiagonalPattern = useCallback((grid: (string | null)[]) => {
    // Check main diagonal (top-left to bottom-right)
    if (grid[0] && grid[4] && grid[8]) {
      return true;
    }
    
    // Check other diagonal (top-right to bottom-left)
    if (grid[2] && grid[4] && grid[6]) {
      return true;
    }
    
    return false;
  }, []);

  const checkSquarePattern = useCallback((grid: (string | null)[]) => {
    // Check 2x2 squares
    const squares = [
      [0, 1, 3, 4], // Top-left
      [1, 2, 4, 5], // Top-right
      [3, 4, 6, 7], // Bottom-left
      [4, 5, 7, 8]  // Bottom-right
    ];
    
    return squares.some(square => 
      square.every(idx => grid[idx] !== null)
    );
  }, []);

  const checkCrossPattern = useCallback((grid: (string | null)[]) => {
    // Check for a cross pattern (center + adjacent cells)
    return grid[4] !== null && (
      (grid[1] !== null && grid[4] !== null && grid[7] !== null) || // Vertical
      (grid[3] !== null && grid[4] !== null && grid[5] !== null)    // Horizontal
    );
  }, []);

  const checkTrianglePattern = useCallback((grid: (string | null)[]) => {
    // Check for triangle patterns
    const triangles = [
      [0, 1, 3], // Top-left
      [1, 2, 5], // Top-right
      [3, 6, 7], // Bottom-left
      [5, 7, 8]  // Bottom-right
    ];
    
    return triangles.some(triangle => 
      triangle.every(idx => grid[idx] !== null)
    );
  }, []);

  const checkCirclePattern = useCallback((grid: (string | null)[]) => {
    // Check for a circle pattern (center empty, surrounding cells filled)
    return grid[4] === null && 
      grid[1] !== null && grid[3] !== null && 
      grid[5] !== null && grid[7] !== null;
  }, []);
  
  // New L-shape pattern check
  const checkLShapePattern = useCallback((grid: (string | null)[]) => {
    // Define the possible L shapes with their indices
    const lShapes = [
      // L shape pointing right-down
      [[0, 3, 6, 7]],
      // L shape pointing right-up
      [[6, 3, 0, 1]],
      // L shape pointing left-down
      [[2, 5, 8, 7]],
      // L shape pointing left-up
      [[8, 5, 2, 1]]
    ];
    
    // Check each L shape configuration
    for (const shapeGroup of lShapes) {
      for (const shape of shapeGroup) {
        // Check if all cells in this shape are filled
        const allFilled = shape.every(idx => grid[idx] !== null);
        if (allFilled) {
          return true;
        }
      }
    }
    
    return false;
  }, []);

  // Function to determine the pattern used in the grid
  const getGridPattern = useCallback((grid: (string | null)[]) => {
    
    // Check for all patterns and return all that match
    const patterns = [];
    
    if (checkLShapePattern(grid)) patterns.push("lShape");
    if (checkSquarePattern(grid)) patterns.push("square");
    if (checkCrossPattern(grid)) patterns.push("cross");
    if (checkTrianglePattern(grid)) patterns.push("triangle");
    if (checkDiagonalPattern(grid)) patterns.push("diagonal");
    if (checkLinearPattern(grid)) patterns.push("linear");
    if (checkCirclePattern(grid)) patterns.push("circle");
    
    // Return all detected patterns as a comma-separated string, or "none" if none detected
    return patterns.length > 0 ? patterns.join(",") : "none";
  }, [checkLShapePattern, checkSquarePattern, checkCrossPattern, checkTrianglePattern, checkDiagonalPattern, checkLinearPattern, checkCirclePattern]);
  
  // Helper function to get a human-readable pattern name
  const getPatternName = (pattern?: string): string => {
    if (!pattern || pattern === "none") return "no";
    
    // Handle multiple patterns
    if (pattern.includes(",")) {
      const patterns = pattern.split(",");
      // Format each pattern and join with "and"
      const formattedPatterns = patterns.map(p => 
        p.charAt(0).toUpperCase() + p.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()
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
      pattern.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase();
  };
  
  const handleCraft = useCallback(() => {
    // Try to find a matching recipe if none is selected
    const recipeToUse = selectedRecipe || findMatchingRecipe();
    
    if (!recipeToUse) {
      setCraftingNotification({
        type: 'error',
        message: 'No matching recipe found for the items in the grid.'
      });
      return;
    }
    
    // Verify the output item exists
    const craftedItemId = recipeToUse.output;
    const outputItem = gameItems[craftedItemId];
    
    if (!outputItem) {
      console.error(`Output item not found: ${craftedItemId} for recipe ${recipeToUse.id}`);
      setCraftingNotification({
        type: 'error',
        message: `Error: Output item "${craftedItemId}" not found. Please report this bug.`
      });
      return;
    }
    
    // Check if player has enough magic points (only if there's a magic cost)
    if (magicCost > 0 && character.magicPoints < magicCost) {
      setCraftingNotification({
        type: 'error',
        message: `Not enough magic points. Need ${magicCost} MP, but you only have ${character.magicPoints} MP.`
      });
      return;
    }
    
    // Get the pattern used in crafting BEFORE clearing the grid
    const patternUsed = getGridPattern(grid);
    
    // Create a copy of the inventory to work with
    const updatedInventory = [...inventory];
    
    // We don't need to remove items from inventory here because they were already
    // removed when they were placed on the grid. We just need to clear the grid.
    
    // Check if crafting succeeds based on success chance
    const roll = Math.random() * 100;
    const craftingSucceeds = roll <= successChance;
    
    if (craftingSucceeds) {
      // Add crafted item to inventory with pattern information
      const existingItem = updatedInventory.find(item => item.id === craftedItemId);
      
      if (existingItem) {
        existingItem.quantity += 1;
        // Make sure to update the pattern even for existing items
        existingItem.craftingPattern = patternUsed;
      } else {
        const newItem = { 
          id: craftedItemId, 
          quantity: 1,
          craftingPattern: patternUsed // Store the pattern used
        };
        updatedInventory.push(newItem);
      }
      
      // Calculate experience gain
      const expGain = recipeToUse.experienceGain || {};
      
      // Update character stats
      const updatedCharacter = {
        ...character,
        magicPoints: magicCost > 0 ? Math.max(0, character.magicPoints - magicCost) : character.magicPoints,
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
      
      // Update character and inventory
      onUpdateCharacter(updatedCharacter, updatedInventory);
      
      // Show success notification
      setCraftingNotification({
        type: 'success',
        message: `Successfully crafted ${outputItem.name} with ${getPatternName(patternUsed)} pattern!`
      });
      
      // Check if this was a secret recipe discovery
      if (recipeToUse.isSecret) {
        setCraftingNotification({
          type: 'success',
          message: `You discovered a secret recipe: ${outputItem.name}!`
        });
        // Here you would also update the discovered recipes in localStorage or state
      }
    } else {
      // Crafting failed
      // Consume magic points if there's a magic cost
      if (magicCost > 0) {
        const updatedCharacter = {
          ...character,
          magicPoints: Math.max(0, character.magicPoints - magicCost)
        };
        onUpdateCharacter(updatedCharacter, updatedInventory);
      } else {
        // Just update the inventory if no magic cost
        onUpdateCharacter(character, updatedInventory);
      }
      
      // Show failure notification
      setCraftingNotification({
        type: 'error',
        message: 'Crafting failed! Resources were consumed, but no item was created.'
      });
    }
    
    // Clear the grid regardless of success or failure
    clearGrid();
  }, [selectedRecipe, findMatchingRecipe, character, inventory, grid, magicCost, successChance, onUpdateCharacter, gameItems, clearGrid, getGridPattern]);
  
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
  
  // Move the handleQuickAdd function after the clearGrid function
  const handleQuickAdd = useCallback((recipe: Recipe) => {
    if (!recipe) return;
    
    // Check if we have all the required ingredients
    const requiredItems: Record<string, number> = {};
    recipe.inputs.forEach(itemId => {
      requiredItems[itemId] = (requiredItems[itemId] || 0) + 1;
    });
    
    const hasAllIngredients = Object.entries(requiredItems).every(([itemId, count]) => {
      const inventoryItem = inventory.find(item => item.id === itemId);
      return inventoryItem && inventoryItem.quantity >= count;
    });
    
    if (!hasAllIngredients) {
      setCraftingNotification({
        type: 'error',
        message: 'You don\'t have all the required ingredients for this recipe.'
      });
      return;
    }
    
    // Clear the grid first
    clearGrid();
    
    // Create a new grid with the recipe ingredients
    const newGrid = Array(9).fill(null);
    
    // Place items in the grid based on recipe inputs
    recipe.inputs.forEach((itemId, index) => {
      if (index < 9) {
        newGrid[index] = itemId;
      }
    });
    
    // Update the grid
    setGrid(newGrid);
    
    // Update the inventory
    const updatedInventory = [...inventory];
    
    // Remove used items from inventory
    recipe.inputs.forEach(itemId => {
      const itemIndex = updatedInventory.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        updatedInventory[itemIndex].quantity -= 1;
        
        // Remove item if quantity is 0
        if (updatedInventory[itemIndex].quantity <= 0) {
          updatedInventory.splice(itemIndex, 1);
        }
      }
    });
    
    // Update character with new inventory
    onUpdateCharacter(
      character,
      updatedInventory
    );
    
    // Set the selected recipe
    setSelectedRecipe(recipe);
    
    setCraftingNotification({
      type: 'success',
      message: `Ingredients for ${recipe.output} placed on the grid.`
    });
  }, [inventory, character, onUpdateCharacter, clearGrid]);
  
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
  
  // Clear notification after a delay
  useEffect(() => {
    if (craftingNotification) {
      const timer = setTimeout(() => {
        setCraftingNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [craftingNotification]);
  
  return {
    // Grid state
    grid,
    isDraggingOver,
    highlightedCells,
    
    // Control state
    controlValues,
    
    // Recipe state
    selectedRecipe,
    
    // Notification state
    craftingNotification,
    
    // Handlers
    handleDragStart,
    handleDropOnGrid,
    handleDropOnInventory,
    handleControlChange,
    handleCraft,
    handleQuickCraft,
    handleQuickAdd,
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
    magicCost,
    
    // Helper functions
    findMatchingRecipe
  };
}; 