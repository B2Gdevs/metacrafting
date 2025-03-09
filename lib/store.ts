import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CharacterStats } from '@/components/character-sheet'
import { Item } from '@/components/item-slot'
import { 
  CurrencyType, 
  CurrencyValues, 
  MarketplaceItem, 
  PlayerMarketItem, 
  NpcItem,
  Notification
} from '@/lib/marketplace-types'
import { gameItems } from '@/lib/items'
import { npcShopItems as initialNpcItems } from '@/lib/marketplace-data'

// Define the filter state interface
export interface FilterState {
  type: string
  rarity: string
  currencies: {
    [CurrencyType.GOLD]: boolean
    [CurrencyType.GEMS]: boolean
  }
  minPrice: number
  maxPrice: number
  minGemsPrice: number
  maxGemsPrice: number
  showEquippableOnly: boolean
  showWithStatsOnly: boolean
  stats: Record<string, [number, number]>
}

// Default filter state
export const defaultFilterState: FilterState = {
  type: "all",
  rarity: "all",
  currencies: {
    [CurrencyType.GOLD]: true,
    [CurrencyType.GEMS]: true,
  },
  minPrice: 0,
  maxPrice: 1000,
  minGemsPrice: 0,
  maxGemsPrice: 100,
  showEquippableOnly: false,
  showWithStatsOnly: false,
  stats: {
    attack: [0, 100],
    defense: [0, 100],
    magicAttack: [0, 100],
    magicDefense: [0, 100],
    speed: [0, 100],
  },
}

// Define the inventory item interface
export interface InventoryItem {
  id: string;
  quantity: number;
  craftingPattern?: string;
  itemHash?: string;
}

// Define the game state interface
export interface GameState {
  character: CharacterStats
  inventory: InventoryItem[]
  npcItems: NpcItem[]
  playerMarketItems: PlayerMarketItem[]
  selectedTab: "npc" | "player"
  selectedAction: "buy" | "sell"
  notifications: Notification[]
  draftListing: PlayerMarketItem | null
  filterState: FilterState
  searchTerm: string
  
  // Actions
  updateCharacter: (updates: Partial<CharacterStats>) => void
  updateInventory: (inventory: InventoryItem[]) => void
  addToInventory: (itemId: string, quantity: number, craftingPattern?: string, itemHash?: string) => void
  removeFromInventory: (itemId: string, quantity: number) => void
  resetState: () => void
  
  // Marketplace actions
  setSelectedTab: (tab: "npc" | "player") => void
  setSelectedAction: (action: "buy" | "sell") => void
  addNotification: (notification: Notification) => void
  clearNotifications: () => void
  setDraftListing: (listing: PlayerMarketItem | null) => void
  addPlayerMarketItem: (item: PlayerMarketItem) => void
  removePlayerMarketItem: (itemId: string) => void
  updateFilterState: (updates: Partial<FilterState>) => void
  resetFilters: () => void
  setSearchTerm: (term: string) => void
  
  // Getters
  getFilteredNpcItems: () => NpcItem[]
  getFilteredPlayerItems: () => PlayerMarketItem[]
  getInventoryWithPrices: () => Array<{ id: string; quantity: number; price: number; craftingPattern?: string; itemHash?: string }>
}

// Helper functions for filtering
// Each filter returns true if the item passes the filter, false otherwise

// Filter by search term
const filterBySearchTerm = (item: NpcItem | PlayerMarketItem, gameItem: Item, searchTerm: string): boolean => {
  if (!searchTerm || searchTerm.trim() === '') return true;
  
  const searchLower = searchTerm.toLowerCase().trim();
  return gameItem.name.toLowerCase().includes(searchLower) || 
         gameItem.description.toLowerCase().includes(searchLower);
};

// Filter by type
const filterByType = (gameItem: Item, type: string): boolean => {
  return type === 'all' || gameItem.type === type;
};

// Filter by rarity
const filterByRarity = (gameItem: Item, rarity: string): boolean => {
  return rarity === 'all' || gameItem.rarity === rarity;
};

// Filter by currency selection
const filterByCurrencySelection = (
  item: NpcItem | PlayerMarketItem, 
  currencies: { [key: string]: number }, 
  goldChecked: boolean, 
  gemsChecked: boolean
): boolean => {
  const hasGold = currencies[CurrencyType.GOLD] > 0;
  const hasGems = currencies[CurrencyType.GEMS] > 0;
  
  // If both currency filters are unchecked, show no items
  if (!goldChecked && !gemsChecked) return false;
  
  // For items that require both currencies (AND logic), both currencies must be checked
  if (item.requireAllCurrencies && (!goldChecked || !gemsChecked)) return false;
  
  // For items with only gold price, gold must be checked
  if (hasGold && !hasGems && !goldChecked) return false;
  
  // For items with only gems price, gems must be checked
  if (hasGems && !hasGold && !gemsChecked) return false;
  
  return true;
};

// Filter by price range
const filterByPriceRange = (
  currencies: { [key: string]: number }, 
  goldChecked: boolean, 
  gemsChecked: boolean,
  minPrice: number,
  maxPrice: number,
  minGemsPrice: number,
  maxGemsPrice: number
): boolean => {
  const hasGold = currencies[CurrencyType.GOLD] > 0;
  const hasGems = currencies[CurrencyType.GEMS] > 0;
  
  // If gold is checked and the item has gold price, it MUST be within the gold price range
  if (goldChecked && hasGold) {
    if (currencies[CurrencyType.GOLD] < minPrice || currencies[CurrencyType.GOLD] > maxPrice) {
      return false;
    }
  }
  
  // If gems is checked and the item has gems price, it MUST be within the gems price range
  if (gemsChecked && hasGems) {
    if (currencies[CurrencyType.GEMS] < minGemsPrice || currencies[CurrencyType.GEMS] > maxGemsPrice) {
      return false;
    }
  }
  
  return true;
};

// Filter by equippable
const filterByEquippable = (gameItem: Item, showEquippableOnly: boolean): boolean => {
  return !showEquippableOnly || (gameItem.equippable === true);
};

// Filter by stats
const filterByStats = (gameItem: Item, showWithStatsOnly: boolean): boolean => {
  return !showWithStatsOnly || (gameItem.stats !== undefined && Object.keys(gameItem.stats).length > 0);
};

// Filter by stat ranges
const filterByStatRanges = (gameItem: Item, statRanges: Record<string, [number, number]>): boolean => {
  if (!gameItem.stats) return true;
  
  for (const [stat, [min, max]] of Object.entries(statRanges)) {
    // If min is greater than 0, the item should have this stat
    if (min > 0 && (gameItem.stats[stat] === undefined || gameItem.stats[stat] === null)) {
      return false;
    }
    
    // If the item has the stat, check if it's within range
    if (gameItem.stats[stat] !== undefined) {
      const statValue = gameItem.stats[stat];
      if (statValue < min || statValue > max) {
        return false;
      }
    }
  }
  
  return true;
};

// Main filter function that applies all filters
const applyFilters = (
  items: (NpcItem | PlayerMarketItem)[], 
  filterState: FilterState, 
  searchTerm: string
): (NpcItem | PlayerMarketItem)[] => {
  return items.filter(item => {
    const gameItem = gameItems[item.id];
    if (!gameItem) return false;
    
    // Ensure currencies object exists with default values
    const currencies = {
      [CurrencyType.GOLD]: item.currencies?.[CurrencyType.GOLD] || 0,
      [CurrencyType.GEMS]: item.currencies?.[CurrencyType.GEMS] || 0
    };
    
    const goldChecked = filterState.currencies[CurrencyType.GOLD];
    const gemsChecked = filterState.currencies[CurrencyType.GEMS];
    
    // Apply all filters in sequence
    return filterBySearchTerm(item, gameItem, searchTerm) &&
           filterByType(gameItem, filterState.type) &&
           filterByRarity(gameItem, filterState.rarity) &&
           filterByCurrencySelection(item, currencies, goldChecked, gemsChecked) &&
           filterByPriceRange(
             currencies, 
             goldChecked, 
             gemsChecked, 
             filterState.minPrice, 
             filterState.maxPrice, 
             filterState.minGemsPrice, 
             filterState.maxGemsPrice
           ) &&
           filterByEquippable(gameItem, filterState.showEquippableOnly) &&
           filterByStats(gameItem, filterState.showWithStatsOnly) &&
           filterByStatRanges(gameItem, filterState.stats);
  });
};

// Create the store
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial character state
      character: {
        name: "Adventurer",
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        strength: 10,
        speed: 10,
        health: 100,
        maxHealth: 100,
        magicPoints: 50,
        maxMagicPoints: 50,
        gold: 500,
        gems: 10,
        craftingStats: {
          metalworking: 1,
          magicworking: 1,
          spellcraft: 1,
        },
        craftingExperience: {
          metalworking: 0,
          magicworking: 0,
          spellcraft: 0,
        },
        equipment: {
          head: undefined,
          chest: undefined,
          legs: undefined,
          feet: undefined,
          hands: undefined,
          rings: [],
          weapon: undefined,
          offhand: undefined,
          neck: undefined,
        },
      },
      
      // Initial inventory
      inventory: [
        { id: "wood", quantity: 10 },
        { id: "stone", quantity: 5 },
        { id: "iron_ore", quantity: 3 },
        { id: "leather", quantity: 2 },
      ],
      
      // Initial marketplace state
      npcItems: initialNpcItems.map(item => ({
        id: item.id,
        currencies: {
          [CurrencyType.GOLD]: item.currency === "gold" ? item.price : (item.dualCurrency?.gold || 0),
          [CurrencyType.GEMS]: item.currency === "gems" ? item.price : (item.dualCurrency?.gems || 0)
        },
        requireAllCurrencies: item.requireBothCurrencies || false,
        quantity: item.stock || 0,
        originalItem: gameItems[item.id]
      })).filter((item, index, self) => 
        // Ensure each item ID appears only once
        index === self.findIndex(i => i.id === item.id)
      ),
      playerMarketItems: [],
      selectedTab: "npc" as const,
      selectedAction: "buy" as const,
      notifications: [],
      draftListing: null,
      filterState: defaultFilterState,
      searchTerm: "",
      
      // Character actions
      updateCharacter: (updates) => set((state) => ({
        character: { ...state.character, ...updates }
      })),
      
      updateInventory: (inventory) => set({ inventory }),
      
      addToInventory: (itemId, quantity, craftingPattern, itemHash) => set((state) => {
        const updatedInventory = [...state.inventory];
        
        // If we have a hash, look for an item with the same hash
        if (itemHash) {
          const existingItemIndex = updatedInventory.findIndex(item => 
            item.id === itemId && item.itemHash === itemHash
          );
          
          if (existingItemIndex !== -1) {
            // Increment quantity if item with same hash already exists
            updatedInventory[existingItemIndex].quantity += quantity;
          } else {
            // Add new item to inventory with hash
            updatedInventory.push({ 
              id: itemId, 
              quantity, 
              craftingPattern, 
              itemHash 
            });
          }
        } else {
          // No hash provided, use traditional lookup by ID only
          const existingItemIndex = updatedInventory.findIndex(item => 
            item.id === itemId && !item.itemHash
          );
          
          if (existingItemIndex !== -1) {
            // Increment quantity if item already exists
            updatedInventory[existingItemIndex].quantity += quantity;
          } else {
            // Add new item to inventory
            updatedInventory.push({ 
              id: itemId, 
              quantity, 
              craftingPattern 
            });
          }
        }
        
        return { inventory: updatedInventory };
      }),
      
      removeFromInventory: (itemId, quantity) => set((state) => {
        const updatedInventory = [...state.inventory]
        const existingItemIndex = updatedInventory.findIndex(item => item.id === itemId)
        
        if (existingItemIndex !== -1) {
          // Decrement quantity
          updatedInventory[existingItemIndex].quantity -= quantity
          
          // Remove item if quantity is 0 or less
          if (updatedInventory[existingItemIndex].quantity <= 0) {
            updatedInventory.splice(existingItemIndex, 1)
          }
        }
        
        return { inventory: updatedInventory }
      }),
      
      // Reset state function
      resetState: () => set({
        character: {
          name: "Adventurer",
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
          strength: 10,
          speed: 10,
          health: 100,
          maxHealth: 100,
          magicPoints: 50,
          maxMagicPoints: 50,
          gold: 500,
          gems: 10,
          craftingStats: {
            metalworking: 1,
            magicworking: 1,
            spellcraft: 1,
          },
          craftingExperience: {
            metalworking: 0,
            magicworking: 0,
            spellcraft: 0,
          },
          equipment: {
            head: undefined,
            chest: undefined,
            legs: undefined,
            feet: undefined,
            hands: undefined,
            rings: [],
            weapon: undefined,
            offhand: undefined,
            neck: undefined,
          },
        },
        inventory: [
          { id: "wood", quantity: 10 },
          { id: "stone", quantity: 5 },
          { id: "iron_ore", quantity: 3 },
          { id: "leather", quantity: 2 },
        ],
        playerMarketItems: [],
        selectedTab: "npc" as const,
        selectedAction: "buy" as const,
        notifications: [],
        draftListing: null,
        filterState: defaultFilterState,
        searchTerm: "",
      }),
      
      // Marketplace actions
      setSelectedTab: (tab) => set({ selectedTab: tab }),
      
      setSelectedAction: (action) => set({ selectedAction: action }),
      
      addNotification: (notification) => set((state) => {
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.message !== notification.message)
          }))
        }, 5000)
        
        return { notifications: [...state.notifications, notification] }
      }),
      
      clearNotifications: () => set({ notifications: [] }),
      
      // Draft listing actions
      setDraftListing: (listing) => set({ draftListing: listing }),
      
      // Player market actions
      addPlayerMarketItem: (item) => set((state) => ({
        playerMarketItems: [...state.playerMarketItems, item]
      })),
      
      removePlayerMarketItem: (itemId) => set((state) => ({
        playerMarketItems: state.playerMarketItems.filter(item => item.id !== itemId)
      })),
      
      // Item listing actions
      buyItem: (itemId: string, currencies: Partial<CurrencyValues>, requireAllCurrencies: boolean, seller?: string) => {
        const state = get()
        const { character, npcItems, playerMarketItems } = state
        
        // Get the item details
        const gameItem = gameItems[itemId]
        if (!gameItem) {
          state.addNotification({ message: `Item ${itemId} not found`, type: "error" })
          return
        }
        
        // Check if player has enough currency
        if (requireAllCurrencies) {
          // All currencies are required
          if ((currencies[CurrencyType.GOLD] && character.gold < currencies[CurrencyType.GOLD]) || 
              (currencies[CurrencyType.GEMS] && character.gems < currencies[CurrencyType.GEMS])) {
            state.addNotification({ message: "Not enough currency to purchase this item", type: "error" })
            return
          }
        } else {
          // Check each currency
          if (currencies[CurrencyType.GOLD] && character.gold < currencies[CurrencyType.GOLD]) {
            state.addNotification({ message: "Not enough gold to purchase this item", type: "error" })
            return
          }
          if (currencies[CurrencyType.GEMS] && character.gems < currencies[CurrencyType.GEMS]) {
            state.addNotification({ message: "Not enough gems to purchase this item", type: "error" })
            return
          }
        }
        
        // Update character's currency
        const updatedCharacter = { ...character }
        if (requireAllCurrencies) {
          // Deduct all currencies
          if (currencies[CurrencyType.GOLD]) {
            updatedCharacter.gold -= currencies[CurrencyType.GOLD]
          }
          if (currencies[CurrencyType.GEMS]) {
            updatedCharacter.gems -= currencies[CurrencyType.GEMS]
          }
        } else {
          // Deduct only one currency (prioritize gold)
          if (currencies[CurrencyType.GOLD]) {
            updatedCharacter.gold -= currencies[CurrencyType.GOLD]
          } else if (currencies[CurrencyType.GEMS]) {
            updatedCharacter.gems -= currencies[CurrencyType.GEMS]
          }
        }
        
        // Add item to inventory
        state.addToInventory(itemId, 1)
        
        // Update character
        set({ character: updatedCharacter })
        
        // Update marketplace items
        if (seller) {
          // Find the item in the player market
          const playerItem = playerMarketItems.find(
            item => item.id === itemId && item.seller === seller
          )
          
          if (!playerItem) {
            state.addNotification({ message: "Item not found in player marketplace", type: "error" })
            return
          }
          
          // Update player market items
          const updatedPlayerMarketItems = [...playerMarketItems]
          const itemIndex = updatedPlayerMarketItems.findIndex(
            item => item.id === itemId && item.seller === seller
          )
          
          if (itemIndex !== -1) {
            if (updatedPlayerMarketItems[itemIndex].quantity <= 1) {
              // Remove the listing if it's the last one
              updatedPlayerMarketItems.splice(itemIndex, 1)
            } else {
              // Update the listing quantity
              updatedPlayerMarketItems[itemIndex] = {
                ...updatedPlayerMarketItems[itemIndex],
                quantity: updatedPlayerMarketItems[itemIndex].quantity - 1
              }
            }
            
            set({ playerMarketItems: updatedPlayerMarketItems })
          }
        } else {
          // Update NPC items
          const updatedNpcItems = [...npcItems]
          const itemIndex = updatedNpcItems.findIndex(item => item.id === itemId)
          
          if (itemIndex !== -1 && updatedNpcItems[itemIndex].quantity > 0) {
            updatedNpcItems[itemIndex] = {
              ...updatedNpcItems[itemIndex],
              quantity: updatedNpcItems[itemIndex].quantity - 1
            }
            
            set({ npcItems: updatedNpcItems })
          }
        }
        
        // Add success notification
        state.addNotification({ message: `Successfully purchased ${gameItem.name}`, type: "success" })
      },
      
      sellItem: (itemId: string) => {
        const state = get()
        const { character, inventory } = state
        
        // Get the item details
        const gameItem = gameItems[itemId]
        if (!gameItem) {
          state.addNotification({ message: `Item ${itemId} not found`, type: "error" })
          return
        }
        
        // Check if player has the item
        const inventoryItem = inventory.find(item => item.id === itemId)
        if (!inventoryItem || inventoryItem.quantity <= 0) {
          state.addNotification({ message: `You don't have any ${gameItem.name} to sell`, type: "error" })
          return
        }
        
        // Calculate sell price (50% of buy price)
        const sellPrice = gameItem.price ? Math.floor(gameItem.price * 0.5) : 0
        
        // Update character's gold
        const updatedCharacter = { ...character, gold: character.gold + sellPrice }
        
        // Remove item from inventory
        state.removeFromInventory(itemId, 1)
        
        // Update character
        set({ character: updatedCharacter })
        
        // Add success notification
        state.addNotification({ message: `Successfully sold ${gameItem.name} for ${sellPrice} gold`, type: "success" })
      },
      
      openListingDialog: (itemId: string) => {
        const state = get()
        const { character } = state
        
        // Get the item details
        const gameItem = gameItems[itemId]
        if (!gameItem) {
          state.addNotification({ message: `Item ${itemId} not found`, type: "error" })
          return
        }
        
        // Create a draft listing
        const draftListing: PlayerMarketItem = {
          id: itemId,
          seller: character.name,
          currencies: {
            [CurrencyType.GOLD]: gameItem.price || 0,
            [CurrencyType.GEMS]: 0
          },
          requireAllCurrencies: false,
          quantity: 1,
          originalItem: gameItem
        }
        
        set({ draftListing })
      },
      
      listItem: () => {
        const state = get()
        const { draftListing, inventory, playerMarketItems } = state
        
        if (!draftListing) {
          state.addNotification({ message: "No item selected for listing", type: "error" })
          return
        }
        
        // Check if player has the item
        const inventoryItem = inventory.find(item => item.id === draftListing.id)
        if (!inventoryItem || inventoryItem.quantity < draftListing.quantity) {
          state.addNotification({ message: `You don't have enough ${draftListing.originalItem?.name || draftListing.id} to list`, type: "error" })
          return
        }
        
        // Validate currencies
        const goldPrice = draftListing.currencies[CurrencyType.GOLD] || 0
        const gemsPrice = draftListing.currencies[CurrencyType.GEMS] || 0
        
        if (goldPrice <= 0 && gemsPrice <= 0) {
          state.addNotification({ message: "You must set a price for your listing", type: "error" })
          return
        }
        
        // Remove items from inventory
        state.removeFromInventory(draftListing.id, draftListing.quantity)
        
        // Add listing to player market
        const updatedPlayerMarketItems = [...playerMarketItems, draftListing]
        
        // Update state
        set({ 
          playerMarketItems: updatedPlayerMarketItems,
          draftListing: null
        })
        
        // Add success notification
        state.addNotification({ message: `Successfully listed ${draftListing.quantity}x ${draftListing.originalItem?.name || draftListing.id}`, type: "success" })
      },
      
      updateDraftListing: (updates: Partial<PlayerMarketItem>) => set((state) => {
        if (!state.draftListing) return state
        
        // Create a new currencies object with the updates
        const updatedCurrencies = {
          ...state.draftListing.currencies
        }
        
        // Apply currency updates if provided
        if (updates.currencies) {
          if (updates.currencies[CurrencyType.GOLD] !== undefined) {
            updatedCurrencies[CurrencyType.GOLD] = updates.currencies[CurrencyType.GOLD]
          }
          if (updates.currencies[CurrencyType.GEMS] !== undefined) {
            updatedCurrencies[CurrencyType.GEMS] = updates.currencies[CurrencyType.GEMS]
          }
        }
        
        return {
          draftListing: {
            ...state.draftListing,
            ...updates,
            currencies: updatedCurrencies
          }
        }
      }),
      
      clearDraftListing: () => set({ draftListing: null }),
      
      // Filter actions
      updateFilterState: (updates) => set((state) => {
        // Handle nested objects like currencies and stats
        const newFilterState = { ...state.filterState };
        
        // Handle each update property
        Object.entries(updates).forEach(([key, value]) => {
          if (key === 'currencies' && typeof value === 'object') {
            // Merge currencies
            newFilterState.currencies = {
              ...newFilterState.currencies,
              ...(value as typeof newFilterState.currencies)
            };
          } else if (key === 'stats' && typeof value === 'object') {
            // Merge stats
            newFilterState.stats = {
              ...newFilterState.stats,
              ...(value as typeof newFilterState.stats)
            };
          } else {
            // Handle regular properties
            (newFilterState as any)[key] = value;
          }
        });
        
        return { filterState: newFilterState };
      }),
      
      resetFilters: () => set({ filterState: defaultFilterState }),
      
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      // Computed values
      getFilteredNpcItems: () => {
        const { npcItems, filterState, searchTerm } = get()
        return applyFilters(npcItems, filterState, searchTerm) as NpcItem[]
      },
      
      getFilteredPlayerItems: () => {
        const { playerMarketItems, filterState, searchTerm } = get()
        return applyFilters(playerMarketItems, filterState, searchTerm) as PlayerMarketItem[]
      },
      
      getInventoryWithPrices: () => {
        const { inventory } = get()
        
        return inventory.map(item => {
          const gameItem = gameItems[item.id]
          const price = gameItem && gameItem.price ? Math.floor(gameItem.price * 0.5) : 0
          
          return {
            id: item.id,
            quantity: item.quantity,
            price,
            craftingPattern: item.craftingPattern,
            itemHash: item.itemHash
          }
        })
      }
    }),
    {
      name: 'game-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        character: state.character,
        inventory: state.inventory,
        npcItems: state.npcItems,
        playerMarketItems: state.playerMarketItems,
      }),
    }
  )
) 