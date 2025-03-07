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

// Define the store state interface
interface GameState {
  // Character state
  character: CharacterStats
  inventory: Array<{ id: string; quantity: number }>
  
  // Marketplace state
  npcItems: NpcItem[]
  playerMarketItems: PlayerMarketItem[]
  selectedTab: "npc" | "player"
  selectedAction: "buy" | "sell"
  notifications: Notification[]
  draftListing: PlayerMarketItem | null
  filterState: FilterState
  searchTerm: string
  
  // Actions
  // Character actions
  updateCharacter: (character: Partial<CharacterStats>) => void
  updateInventory: (inventory: Array<{ id: string; quantity: number }>) => void
  addToInventory: (itemId: string, quantity: number) => void
  removeFromInventory: (itemId: string, quantity: number) => void
  
  // Marketplace actions
  setSelectedTab: (tab: "npc" | "player") => void
  setSelectedAction: (action: "buy" | "sell") => void
  addNotification: (message: string, type: "success" | "error") => void
  clearNotifications: () => void
  
  // Item listing actions
  buyItem: (itemId: string, currencies: Partial<CurrencyValues>, requireAllCurrencies: boolean, seller?: string) => void
  sellItem: (itemId: string) => void
  openListingDialog: (itemId: string) => void
  listItem: () => void
  updateDraftListing: (updates: Partial<PlayerMarketItem>) => void
  clearDraftListing: () => void
  
  // Filter actions
  updateFilterState: (updates: Partial<FilterState>) => void
  resetFilters: () => void
  setSearchTerm: (term: string) => void
  
  // Computed values
  getFilteredNpcItems: () => NpcItem[]
  getFilteredPlayerItems: () => PlayerMarketItem[]
  getInventoryWithPrices: () => Array<{ id: string; quantity: number; price: number }>
}

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
      })),
      playerMarketItems: [],
      selectedTab: "npc",
      selectedAction: "buy",
      notifications: [],
      draftListing: null,
      filterState: defaultFilterState,
      searchTerm: "",
      
      // Character actions
      updateCharacter: (updates) => set((state) => ({
        character: { ...state.character, ...updates }
      })),
      
      updateInventory: (inventory) => set({ inventory }),
      
      addToInventory: (itemId, quantity) => set((state) => {
        const updatedInventory = [...state.inventory]
        const existingItemIndex = updatedInventory.findIndex(item => item.id === itemId)
        
        if (existingItemIndex !== -1) {
          // Increment quantity if item already exists
          updatedInventory[existingItemIndex].quantity += quantity
        } else {
          // Add new item to inventory
          updatedInventory.push({ id: itemId, quantity })
        }
        
        return { inventory: updatedInventory }
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
      
      // Marketplace actions
      setSelectedTab: (tab) => set({ selectedTab: tab }),
      
      setSelectedAction: (action) => set({ selectedAction: action }),
      
      addNotification: (message, type) => set((state) => {
        const newNotification = { message, type }
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.message !== message)
          }))
        }, 5000)
        
        return { notifications: [...state.notifications, newNotification] }
      }),
      
      clearNotifications: () => set({ notifications: [] }),
      
      // Item listing actions
      buyItem: (itemId, currencies, requireAllCurrencies, seller) => {
        const state = get()
        const { character, npcItems, playerMarketItems } = state
        
        // Get the item details
        const gameItem = gameItems[itemId]
        if (!gameItem) {
          state.addNotification(`Item ${itemId} not found`, "error")
          return
        }
        
        // Check if player has enough currency
        if (requireAllCurrencies) {
          // All currencies are required
          if ((currencies[CurrencyType.GOLD] && character.gold < currencies[CurrencyType.GOLD]) || 
              (currencies[CurrencyType.GEMS] && character.gems < currencies[CurrencyType.GEMS])) {
            state.addNotification("Not enough currency to purchase this item", "error")
            return
          }
        } else {
          // Check each currency
          if (currencies[CurrencyType.GOLD] && character.gold < currencies[CurrencyType.GOLD]) {
            state.addNotification("Not enough gold to purchase this item", "error")
            return
          }
          if (currencies[CurrencyType.GEMS] && character.gems < currencies[CurrencyType.GEMS]) {
            state.addNotification("Not enough gems to purchase this item", "error")
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
            state.addNotification("Item not found in player marketplace", "error")
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
        state.addNotification(`Successfully purchased ${gameItem.name}`, "success")
      },
      
      sellItem: (itemId) => {
        const state = get()
        const { character, inventory } = state
        
        // Get the item details
        const gameItem = gameItems[itemId]
        if (!gameItem) {
          state.addNotification(`Item ${itemId} not found`, "error")
          return
        }
        
        // Check if player has the item
        const inventoryItem = inventory.find(item => item.id === itemId)
        if (!inventoryItem || inventoryItem.quantity <= 0) {
          state.addNotification(`You don't have any ${gameItem.name} to sell`, "error")
          return
        }
        
        // Calculate sell price (50% of buy price)
        const sellPrice = gameItem.price ? Math.floor(gameItem.price * 0.5) : 0
        
        // Update character's gold
        const updatedCharacter = { ...character, gold: character.gold + sellPrice }
        
        // Remove item from inventory
        state.removeFromInventory(itemId, 1)
        
        // Update character
        state.updateCharacter(updatedCharacter)
        
        // Add success notification
        state.addNotification(`Successfully sold ${gameItem.name} for ${sellPrice} gold`, "success")
      },
      
      openListingDialog: (itemId) => {
        const state = get()
        const { character } = state
        
        // Get the item details
        const gameItem = gameItems[itemId]
        if (!gameItem) {
          state.addNotification(`Item ${itemId} not found`, "error")
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
          state.addNotification("No item selected for listing", "error")
          return
        }
        
        // Check if player has the item
        const inventoryItem = inventory.find(item => item.id === draftListing.id)
        if (!inventoryItem || inventoryItem.quantity < draftListing.quantity) {
          state.addNotification(`You don't have enough ${draftListing.originalItem?.name || draftListing.id} to list`, "error")
          return
        }
        
        // Validate currencies
        const goldPrice = draftListing.currencies[CurrencyType.GOLD] || 0
        const gemsPrice = draftListing.currencies[CurrencyType.GEMS] || 0
        
        if (goldPrice <= 0 && gemsPrice <= 0) {
          state.addNotification("You must set a price for your listing", "error")
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
        state.addNotification(`Successfully listed ${draftListing.quantity}x ${draftListing.originalItem?.name || draftListing.id}`, "success")
      },
      
      updateDraftListing: (updates) => set((state) => {
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
      updateFilterState: (updates) => set((state) => ({
        filterState: { ...state.filterState, ...updates }
      })),
      
      resetFilters: () => set({ filterState: defaultFilterState }),
      
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      // Computed values
      getFilteredNpcItems: () => {
        const { npcItems, filterState, searchTerm } = get()
        
        return npcItems.filter(item => {
          const gameItem = gameItems[item.id]
          if (!gameItem) return false
          
          // Search term filter
          if (searchTerm && !gameItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
              !gameItem.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false
          }
          
          // Type filter
          if (filterState.type !== "all" && gameItem.type !== filterState.type) {
            return false
          }
          
          // Rarity filter
          if (filterState.rarity !== "all" && gameItem.rarity !== filterState.rarity) {
            return false
          }
          
          // Ensure currencies object exists with default values
          const currencies = {
            [CurrencyType.GOLD]: item.currencies?.[CurrencyType.GOLD] || 0,
            [CurrencyType.GEMS]: item.currencies?.[CurrencyType.GEMS] || 0
          }
          
          // Currency filter
          const hasGold = currencies[CurrencyType.GOLD] > 0
          const hasGems = currencies[CurrencyType.GEMS] > 0
          
          if (!filterState.currencies[CurrencyType.GOLD] && hasGold) {
            return false
          }
          
          if (!filterState.currencies[CurrencyType.GEMS] && hasGems) {
            return false
          }
          
          // Price range filter
          if (hasGold && (currencies[CurrencyType.GOLD] < filterState.minPrice || 
                          currencies[CurrencyType.GOLD] > filterState.maxPrice)) {
            return false
          }
          
          if (hasGems && (currencies[CurrencyType.GEMS] < filterState.minGemsPrice || 
                          currencies[CurrencyType.GEMS] > filterState.maxGemsPrice)) {
            return false
          }
          
          // Equippable filter
          if (filterState.showEquippableOnly && !gameItem.equippable) {
            return false
          }
          
          // Stats filter
          if (filterState.showWithStatsOnly && (!gameItem.stats || Object.keys(gameItem.stats).length === 0)) {
            return false
          }
          
          return true
        })
      },
      
      getFilteredPlayerItems: () => {
        const { playerMarketItems, filterState, searchTerm } = get()
        
        return playerMarketItems.filter(item => {
          const gameItem = gameItems[item.id]
          if (!gameItem) return false
          
          // Search term filter
          if (searchTerm && !gameItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
              !gameItem.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false
          }
          
          // Type filter
          if (filterState.type !== "all" && gameItem.type !== filterState.type) {
            return false
          }
          
          // Rarity filter
          if (filterState.rarity !== "all" && gameItem.rarity !== filterState.rarity) {
            return false
          }
          
          // Ensure currencies object exists with default values
          const currencies = {
            [CurrencyType.GOLD]: item.currencies?.[CurrencyType.GOLD] || 0,
            [CurrencyType.GEMS]: item.currencies?.[CurrencyType.GEMS] || 0
          }
          
          // Currency filter
          const hasGold = currencies[CurrencyType.GOLD] > 0
          const hasGems = currencies[CurrencyType.GEMS] > 0
          
          if (!filterState.currencies[CurrencyType.GOLD] && hasGold) {
            return false
          }
          
          if (!filterState.currencies[CurrencyType.GEMS] && hasGems) {
            return false
          }
          
          // Price range filter
          if (hasGold && (currencies[CurrencyType.GOLD] < filterState.minPrice || 
                          currencies[CurrencyType.GOLD] > filterState.maxPrice)) {
            return false
          }
          
          if (hasGems && (currencies[CurrencyType.GEMS] < filterState.minGemsPrice || 
                          currencies[CurrencyType.GEMS] > filterState.maxGemsPrice)) {
            return false
          }
          
          // Equippable filter
          if (filterState.showEquippableOnly && !gameItem.equippable) {
            return false
          }
          
          // Stats filter
          if (filterState.showWithStatsOnly && (!gameItem.stats || Object.keys(gameItem.stats).length === 0)) {
            return false
          }
          
          return true
        })
      },
      
      getInventoryWithPrices: () => {
        const { inventory } = get()
        
        return inventory.map(item => {
          const gameItem = gameItems[item.id]
          const price = gameItem && gameItem.price ? Math.floor(gameItem.price * 0.5) : 0
          
          return {
            id: item.id,
            quantity: item.quantity,
            price
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