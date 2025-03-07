"use client"

import { useState, useCallback, useEffect } from "react";
import { CharacterStats } from "@/components/character-sheet";
import { Item } from "@/components/item-slot";
import { 
  npcShopItems as marketplaceNpcItems,
  playerMarketItems as initialPlayerMarketItems,
  addPlayerListing,
  removePlayerListing,
  getPlayerListings
} from "@/lib/marketplace-data";
import { 
  CurrencyType, 
  CurrencyValues, 
  MarketplaceItem, 
  PlayerMarketItem, 
  NpcItem,
  Notification
} from "@/lib/marketplace-types";
import { useMarketplaceStore } from "@/lib/marketplace-store";

// Define filter state interface
export interface FilterState {
  type: string;
  rarity: string;
  currencies: {
    [CurrencyType.GOLD]: boolean;
    [CurrencyType.GEMS]: boolean;
  };
  minPrice: number;
  maxPrice: number;
  minGemsPrice: number;
  maxGemsPrice: number;
  showEquippableOnly: boolean;
  showWithStatsOnly: boolean;
  stats: Record<string, [number, number]>;
}

export interface UseMarketplaceProps {
  character: CharacterStats;
  inventory: Array<{ id: string; quantity: number }>;
  gameItems: Record<string, Item>;
  onUpdateCharacter: (character: CharacterStats) => void;
  onUpdateInventory: (inventory: Array<{ id: string; quantity: number }>) => void;
}

export interface UseMarketplaceReturn {
  // State
  npcItems: NpcItem[];
  playerMarketItems: PlayerMarketItem[];
  selectedTab: "npc" | "player";
  selectedAction: "buy" | "sell";
  notifications: Notification[];

  draftListing: PlayerMarketItem | null;
  filterState: FilterState;
  searchTerm: string;
  
  // Handlers
  setSelectedTab: (tab: "npc" | "player") => void;
  setSelectedAction: (action: "buy" | "sell") => void;
  handleBuyItem: (itemId: string, currencies: Partial<CurrencyValues>, requireAllCurrencies: boolean, seller?: string) => void;
  handleSellItem: (itemId: string) => void;
  handleOpenListingDialog: (itemId: string) => void;
  handleListItem: () => void;
  updateDraftListing: (updates: Partial<PlayerMarketItem>) => void;
  clearDraftListing: () => void;
  updateFilterState: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSearchTerm: (term: string) => void;
  
  // Computed values
  filteredNpcItems: NpcItem[];
  filteredPlayerItems: PlayerMarketItem[];
  inventoryWithPrices: Array<{ id: string; quantity: number; price: number }>;
}

// Re-export the types from marketplace-types for convenience
export type { CurrencyType, CurrencyValues, MarketplaceItem, PlayerMarketItem, NpcItem, Notification };

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
};

export const useMarketplace = ({
  character,
  inventory,
  gameItems,
  onUpdateCharacter,
  onUpdateInventory
}: UseMarketplaceProps): UseMarketplaceReturn => {

  // Get the marketplace store
  const store = useMarketplaceStore();

  // State
  const [npcItems, setNpcItems] = useState<NpcItem[]>(
    marketplaceNpcItems.map(item => ({
      id: item.id,
      currencies: {
        [CurrencyType.GOLD]: item.currency === "gold" ? item.price : (item.dualCurrency?.gold || 0),
        [CurrencyType.GEMS]: item.currency === "gems" ? item.price : (item.dualCurrency?.gems || 0)
      },
      requireAllCurrencies: item.requireBothCurrencies || false,
      quantity: item.stock || 0,
      originalItem: gameItems[item.id]
    }))
  );
  const [selectedTab, setSelectedTab] = useState<"npc" | "player">("npc");
  const [selectedAction, setSelectedAction] = useState<"buy" | "sell">("buy");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Initialize player market items from the in-memory database
  useEffect(() => {
    const listings = getPlayerListings();
    console.log("Initializing player market items:", listings);
    store.setPlayerListings(listings);
  }, []);

  // Add notification
  const addNotification = useCallback((message: string, type: "success" | "error") => {
    setNotifications(prev => [...prev, { message, type }]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.message !== message));
    }, 5000);
  }, []);

  // Handle buying an item
  const handleBuyItem = useCallback((
    itemId: string, 
    currencies: Partial<CurrencyValues>,
    requireAllCurrencies: boolean,
    seller?: string
  ) => {
    // Get the item details
    const gameItem = gameItems[itemId];
    if (!gameItem) {
      addNotification(`Item ${itemId} not found`, "error");
      return;
    }

    // Check if player has enough currency
    if (requireAllCurrencies) {
      // All currencies are required
      if ((currencies[CurrencyType.GOLD] && character.gold < currencies[CurrencyType.GOLD]) || 
          (currencies[CurrencyType.GEMS] && character.gems < currencies[CurrencyType.GEMS])) {
        addNotification("Not enough currency to purchase this item", "error");
        return;
      }
    } else {
      // Check each currency
      if (currencies[CurrencyType.GOLD] && character.gold < currencies[CurrencyType.GOLD]) {
        addNotification("Not enough gold to purchase this item", "error");
        return;
      }
      if (currencies[CurrencyType.GEMS] && character.gems < currencies[CurrencyType.GEMS]) {
        addNotification("Not enough gems to purchase this item", "error");
        return;
      }
    }

    // Update character's currency
    const updatedCharacter = { ...character };
    if (requireAllCurrencies) {
      // Deduct all currencies
      if (currencies[CurrencyType.GOLD]) {
        updatedCharacter.gold -= currencies[CurrencyType.GOLD];
      }
      if (currencies[CurrencyType.GEMS]) {
        updatedCharacter.gems -= currencies[CurrencyType.GEMS];
      }
    } else {
      // Deduct only the required currencies
      if (currencies[CurrencyType.GOLD]) {
        updatedCharacter.gold -= currencies[CurrencyType.GOLD];
      }
      if (currencies[CurrencyType.GEMS]) {
        updatedCharacter.gems -= currencies[CurrencyType.GEMS];
      }
    }
    
    // Update inventory
    const updatedInventory = [...inventory];
    const existingItemIndex = updatedInventory.findIndex(item => item.id === itemId);
    
    if (existingItemIndex !== -1) {
      // Increment quantity if item already exists
      updatedInventory[existingItemIndex].quantity += 1;
    } else {
      // Add new item to inventory
      updatedInventory.push({ id: itemId, quantity: 1 });
    }
    
    // Update player market items if buying from another player
    if (seller) {
      // Find the item in the player market
      const playerItem = store.playerListings.find(
        item => item.id === itemId && item.seller === seller
      );

      if (!playerItem) {
        addNotification("Item not found in player marketplace", "error");
        return;
      }

      // Remove or update the listing
      if (playerItem.quantity <= 1) {
        // Remove the listing if it's the last one
        removePlayerListing(itemId, seller);
        store.setPlayerListings(getPlayerListings());
      } else {
        // Update the listing quantity
        const updatedItem = { ...playerItem, quantity: playerItem.quantity - 1 };
        removePlayerListing(itemId, seller);
        addPlayerListing(updatedItem);
        store.setPlayerListings(getPlayerListings());
      }
    } else {
      // Update NPC items
      setNpcItems(prev => {
        const updatedItems = [...prev];
        const itemIndex = updatedItems.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1 && updatedItems[itemIndex].quantity > 0) {
          updatedItems[itemIndex].quantity -= 1;
        }
        
        return updatedItems;
      });
    }
    
    // Update character and inventory
    onUpdateCharacter(updatedCharacter);
    onUpdateInventory(updatedInventory);
    
    // Show success notification
    addNotification(`Successfully purchased ${gameItem.name || itemId}`, "success");
  }, [character, inventory, store, gameItems, onUpdateCharacter, onUpdateInventory, addNotification]);

  // Handle selling an item back to the shop
  const handleSellItem = useCallback((itemId: string) => {
    // Get the item details
    const gameItem = gameItems[itemId];
    if (!gameItem) {
      addNotification(`Item ${itemId} not found`, "error");
      return;
    }
    
    // Check if player has the item
    const inventoryItem = inventory.find(item => item.id === itemId);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      addNotification(`You don't have ${gameItem.name || itemId} in your inventory`, "error");
      return;
    }
    
    // Calculate sell price (50% of buy price)
    // Use a default value of 100 if price is not available
    const basePrice = gameItem.price !== undefined ? gameItem.price : 100;
    const sellPrice = Math.floor(basePrice * 0.5);
    
    // Update character's gold
    const updatedCharacter = { ...character };
    updatedCharacter.gold += sellPrice;
    
    // Update inventory
    const updatedInventory = [...inventory];
    const itemIndex = updatedInventory.findIndex(item => item.id === itemId);
    
    if (updatedInventory[itemIndex].quantity > 1) {
      // Decrement quantity
      updatedInventory[itemIndex].quantity -= 1;
    } else {
      // Remove item from inventory
      updatedInventory.splice(itemIndex, 1);
    }
    
    // Update character and inventory
    onUpdateCharacter(updatedCharacter);
    onUpdateInventory(updatedInventory);
    
    // Show success notification
    addNotification(`Successfully sold ${gameItem.name || itemId} for ${sellPrice} gold`, "success");
  }, [character, inventory, gameItems, onUpdateCharacter, onUpdateInventory, addNotification]);

  // Handle opening the listing dialog
  const handleOpenListingDialog = useCallback((itemId: string) => {
    const gameItem = gameItems[itemId];
    if (!gameItem) {
      addNotification(`Item ${itemId} not found`, "error");
      return;
    }
    
    // Determine a default price based on the item's value or price property
    const defaultPrice = gameItem.price || gameItem.value || 50;
    
    // Create a new draft listing with default values
    const newDraftListing: PlayerMarketItem = {
      id: itemId,
      currencies: {
        [CurrencyType.GOLD]: defaultPrice
      },
      requireAllCurrencies: false,
      quantity: 1,
      originalItem: gameItem,
      seller: character.name
    };
    
    console.log("Created new draft listing:", newDraftListing);
    
    // Set the draft listing in the store
    store.setDraftListing(newDraftListing);
  }, [gameItems, character.name, addNotification, store]);

  // Update draft listing - now just a wrapper around the store method
  const updateDraftListing = useCallback((updates: Partial<PlayerMarketItem>) => {
    store.updateDraftListing(updates);
  }, [store]);

  // Clear draft listing - now just a wrapper around the store method
  const clearDraftListing = useCallback(() => {
    store.clearDraftListing();
  }, [store]);

  // Handle listing an item on the marketplace
  const handleListItem = useCallback(() => {
    // Try to get the complete listing from localStorage first
    const savedListingJson = localStorage.getItem('completeListing');
    let completeListing: PlayerMarketItem | null = null;
    
    if (savedListingJson) {
      try {
        completeListing = JSON.parse(savedListingJson);
        console.log("Using complete listing from localStorage:", completeListing);
      } catch (error) {
        console.error("Error parsing complete listing from localStorage:", error);
      }
      
      // Clear the localStorage item
      localStorage.removeItem('completeListing');
    }
    
    // If we don't have a complete listing, fall back to the store
    if (!completeListing) {
      // Get the current draft listing from the store
      const draftListing = store.draftListing;
      
      if (!draftListing) {
        addNotification("No item selected for listing", "error");
        return;
      }
      
      console.log("Using draft listing from store:", draftListing);
      completeListing = draftListing;
    }
    
    // Check if player has the item
    const inventoryItem = inventory.find(item => item.id === completeListing.id);
    if (!inventoryItem || inventoryItem.quantity < completeListing.quantity) {
      addNotification(`You don't have enough ${completeListing.originalItem?.name || completeListing.id} to list`, "error");
      return;
    }
    
    // Get the currency values directly from the complete listing
    const goldPrice = completeListing.currencies?.[CurrencyType.GOLD] || 0;
    const gemsPrice = completeListing.currencies?.[CurrencyType.GEMS] || 0;
    
    // Validate that at least one currency has a value
    if (goldPrice <= 0 && gemsPrice <= 0) {
      addNotification("You must set a price in either gold or gems", "error");
      return;
    }
    
    // Create a final listing object with all the necessary fields
    const finalListing: PlayerMarketItem = {
      id: completeListing.id,
      currencies: {
        ...(goldPrice > 0 ? { [CurrencyType.GOLD]: goldPrice } : {}),
        ...(gemsPrice > 0 ? { [CurrencyType.GEMS]: gemsPrice } : {})
      },
      requireAllCurrencies: completeListing.requireAllCurrencies,
      quantity: completeListing.quantity,
      originalItem: completeListing.originalItem,
      seller: character.name
    };
    
    console.log("Final listing to be added:", finalListing);
    
    try {
      // Add the listing to the store
      store.addListing(finalListing);
      
      // Update inventory
      const updatedInventory = [...inventory];
      const itemIndex = updatedInventory.findIndex(item => item.id === completeListing.id);
      
      if (updatedInventory[itemIndex].quantity > completeListing.quantity) {
        // Decrement quantity
        updatedInventory[itemIndex].quantity -= completeListing.quantity;
      } else {
        // Remove item from inventory
        updatedInventory.splice(itemIndex, 1);
      }
      
      // Update inventory
      onUpdateInventory(updatedInventory);
      
      // Clear draft listing
      store.clearDraftListing();
      
      // Show success notification
      addNotification(`Successfully listed ${completeListing.originalItem?.name || completeListing.id} for sale`, "success");
    } catch (error) {
      console.error("Error adding listing:", error);
      addNotification("Error adding listing", "error");
    }
  }, [inventory, onUpdateInventory, addNotification, character.name, store]);

  // Update filter state
  const updateFilterState = useCallback((updates: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilterState(defaultFilterState);
    setSearchTerm("");
  }, []);

  // Filter items based on filter state and search term
  const filterItems = useCallback((
    items: MarketplaceItem[],
    isNpcItems: boolean
  ): MarketplaceItem[] => {
    return items.filter(item => {
      const gameItem = item.originalItem || gameItems[item.id];
      if (!gameItem) return false;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = gameItem.name?.toLowerCase().includes(searchLower);
        const descMatch = gameItem.description?.toLowerCase().includes(searchLower);
        const typeMatch = gameItem.type?.toLowerCase().includes(searchLower);
        
        if (!nameMatch && !descMatch && !typeMatch) {
          return false;
        }
      }
      
      // Filter by type
      if (filterState.type !== "all" && gameItem.type !== filterState.type) {
        return false;
      }
      
      // Filter by rarity
      if (filterState.rarity !== "all" && gameItem.rarity !== filterState.rarity) {
        return false;
      }
      
      // Filter by currency
      if (!filterState.currencies[CurrencyType.GOLD] && item.currencies[CurrencyType.GOLD] && 
          (!item.currencies[CurrencyType.GEMS] || !filterState.currencies[CurrencyType.GEMS])) {
        return false;
      }
      
      if (!filterState.currencies[CurrencyType.GEMS] && item.currencies[CurrencyType.GEMS] && 
          (!item.currencies[CurrencyType.GOLD] || !filterState.currencies[CurrencyType.GOLD])) {
        return false;
      }
      
      // Filter by price range
      const goldPrice = item.currencies[CurrencyType.GOLD] || 0;
      const gemsPrice = item.currencies[CurrencyType.GEMS] || 0;
      
      if (goldPrice > 0 && (goldPrice < filterState.minPrice || goldPrice > filterState.maxPrice)) {
        return false;
      }
      
      if (gemsPrice > 0 && (gemsPrice < filterState.minGemsPrice || gemsPrice > filterState.maxGemsPrice)) {
        return false;
      }
      
      // Filter by equippable
      if (filterState.showEquippableOnly && !gameItem.equippable) {
        return false;
      }
      
      // Filter by stats
      if (filterState.showWithStatsOnly && (!gameItem.stats || Object.keys(gameItem.stats).length === 0)) {
        return false;
      }
      
      // Filter by specific stats
      if (gameItem.stats) {
        for (const [stat, [min, max]] of Object.entries(filterState.stats)) {
          const statValue = gameItem.stats[stat];
          if (statValue !== undefined && (statValue < min || statValue > max)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [filterState, searchTerm, gameItems]);

  // Compute filtered NPC items
  const filteredNpcItems = filterItems(npcItems, true) as NpcItem[];

  // Compute filtered player market items
  const filteredPlayerItems = filterItems(store.playerListings, false) as PlayerMarketItem[];
  
  // Compute inventory with prices
  const inventoryWithPrices = inventory.map(item => {
    const gameItem = gameItems[item.id];
    const price = gameItem?.value || 0;
    return { ...item, price };
  });

  return {
    // State
    npcItems,
    playerMarketItems: store.playerListings,
    selectedTab,
    selectedAction,
    notifications,
    draftListing: store.draftListing,
    filterState,
    searchTerm,
    
    // Handlers
    setSelectedTab,
    setSelectedAction,
    handleBuyItem,
    handleSellItem,
    handleOpenListingDialog,
    handleListItem,
    updateDraftListing,
    clearDraftListing,
    updateFilterState,
    resetFilters,
    setSearchTerm,
    
    // Computed values
    filteredNpcItems,
    filteredPlayerItems,
    inventoryWithPrices
  };
}; 