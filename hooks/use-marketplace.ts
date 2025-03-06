"use client"

import { useState, useCallback } from "react";
import { CharacterStats } from "@/components/character-sheet";
import { Item } from "@/components/item-slot";
import { npcShopItems as marketplaceNpcItems } from "@/lib/marketplace-data";

// Define types
export interface PlayerMarketItem {
  id: string;
  price: number;
  currency: "gold" | "gems";
  seller: string;
  quantity: number;
  dualCurrency?: {
    gold: number;
    gems: number;
  };
  requireBothCurrencies?: boolean;
  originalItem?: Item;
}

export interface FilterState {
  type: string;
  rarity: string;
  currencies: {
    gold: boolean;
    gems: boolean;
  };
  minPrice: number;
  maxPrice: number;
  minGemsPrice: number;
  maxGemsPrice: number;
  showEquippableOnly: boolean;
  showWithStatsOnly: boolean;
  stats: Record<string, [number, number]>;
}

export interface Notification {
  message: string;
  type: "success" | "error";
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
  itemToList: string | null;
  listingPrice: number;
  listingCurrency: "gold" | "gems";
  listingQuantity: number;
  useDualCurrency: boolean;
  dualCurrencyValues: { gold: number; gems: number };
  requireBothCurrencies: boolean;
  filterState: FilterState;
  searchTerm: string;
  
  // Handlers
  setSelectedTab: (tab: "npc" | "player") => void;
  setSelectedAction: (action: "buy" | "sell") => void;
  handleBuyItem: (itemId: string, price: number, currency: "gold" | "gems", dualCurrency?: { gold: number; gems: number }, requireBothCurrencies?: boolean, seller?: string) => void;
  handleSellItem: (itemId: string) => void;
  handleOpenListingDialog: (itemId: string) => void;
  handleListItem: () => void;
  setListingPrice: (price: number) => void;
  setListingCurrency: (currency: "gold" | "gems") => void;
  setListingQuantity: (quantity: number) => void;
  setUseDualCurrency: (use: boolean) => void;
  setDualCurrencyValues: (values: { gold: number; gems: number }) => void;
  setRequireBothCurrencies: (require: boolean) => void;
  setItemToList: (itemId: string | null) => void;
  updateFilterState: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSearchTerm: (term: string) => void;
  
  // Computed values
  filteredNpcItems: NpcItem[];
  filteredPlayerItems: PlayerMarketItem[];
  inventoryWithPrices: Array<{ id: string; quantity: number; price: number }>;
}

// Define NPC item type
export type NpcItem = {
  id: string;
  price: number;
  currency: "gold" | "gems";
  stock: number;
  dualCurrency?: { gold: number; gems: number };
  requireBothCurrencies?: boolean;
};

// Default filter state
export const defaultFilterState: FilterState = {
  type: "all",
  rarity: "all",
  currencies: {
    gold: true,
    gems: true,
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
  // Debug: Log the marketplace data
  console.log("Initial marketplaceNpcItems:", marketplaceNpcItems);

  // State
  const [npcItems, setNpcItems] = useState<NpcItem[]>(marketplaceNpcItems);
  const [selectedTab, setSelectedTab] = useState<"npc" | "player">("npc");
  const [selectedAction, setSelectedAction] = useState<"buy" | "sell">("buy");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [playerMarketItems, setPlayerMarketItems] = useState<PlayerMarketItem[]>([]);
  const [itemToList, setItemToList] = useState<string | null>(null);
  const [listingPrice, setListingPrice] = useState<number>(0);
  const [listingCurrency, setListingCurrency] = useState<"gold" | "gems">("gold");
  const [listingQuantity, setListingQuantity] = useState<number>(1);
  const [useDualCurrency, setUseDualCurrency] = useState<boolean>(false);
  const [dualCurrencyValues, setDualCurrencyValues] = useState<{ gold: number; gems: number }>({ gold: 0, gems: 0 });
  const [requireBothCurrencies, setRequireBothCurrencies] = useState<boolean>(false);
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Add notification
  const addNotification = useCallback((message: string, type: "success" | "error") => {
    const newNotification = { message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== newNotification));
    }, 3000);
  }, []);

  // Update filter state
  const updateFilterState = useCallback((updates: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilterState(defaultFilterState);
    setSearchTerm("");
  }, []);

  // Handle buying an item
  const handleBuyItem = useCallback((
    itemId: string, 
    price: number, 
    currency: "gold" | "gems", 
    dualCurrency?: { gold: number; gems: number },
    requireBothCurrencies?: boolean,
    seller?: string
  ) => {
    console.log("handleBuyItem called with:", {
      itemId,
      price,
      currency,
      dualCurrency,
      requireBothCurrencies,
      seller
    });

    // Check if this is a player listing
    const isPlayerListing = !!seller;
    let playerListing: PlayerMarketItem | undefined;
    
    if (isPlayerListing) {
      playerListing = playerMarketItems.find(item => 
        item.id === itemId && item.seller === seller
      );
      
      if (!playerListing) {
        addNotification("Listing not found", "error");
        return;
      }
      
      console.log("Found player listing:", playerListing);
    }

    // Check if player has enough currency
    if (dualCurrency && requireBothCurrencies) {
      // Both currencies are required
      if (character.gold < dualCurrency.gold || character.gems < dualCurrency.gems) {
        addNotification("Not enough currency to purchase this item", "error");
        return;
      }
    } else if (dualCurrency) {
      // Either currency is acceptable
      if ((currency === "gold" && character.gold < dualCurrency.gold) || 
          (currency === "gems" && character.gems < dualCurrency.gems)) {
        addNotification(`Not enough ${currency} to purchase this item`, "error");
        return;
      }
    } else if (currency === "gold") {
      if (character.gold < price) {
        addNotification("Not enough gold to purchase this item", "error");
        return;
      }
    } else if (currency === "gems") {
      if (character.gems < price) {
        addNotification("Not enough gems to purchase this item", "error");
        return;
      }
    }
    
    // Update character's currency
    const updatedCharacter = { ...character };
    if (dualCurrency && requireBothCurrencies) {
      // Deduct both currencies
      updatedCharacter.gold -= dualCurrency.gold;
      updatedCharacter.gems -= dualCurrency.gems;
    } else if (dualCurrency) {
      // Deduct only the selected currency
      if (currency === "gold") {
        updatedCharacter.gold -= dualCurrency.gold;
      } else {
        updatedCharacter.gems -= dualCurrency.gems;
      }
    } else if (currency === "gold") {
      updatedCharacter.gold -= price;
    } else if (currency === "gems") {
      updatedCharacter.gems -= price;
    }
    
    // Update inventory
    const updatedInventory = [...inventory];
    const existingItem = updatedInventory.find(item => item.id === itemId);
    
    if (existingItem) {
      existingItem.quantity += 1; // Default to 1 if not specified
    } else {
      updatedInventory.push({ id: itemId, quantity: 1 });
    }
    
    // If this is a player listing, update the player market items
    if (isPlayerListing && playerListing) {
      // Decrease the quantity of the listing
      const updatedPlayerMarketItems = playerMarketItems.map(item => {
        if (item.id === itemId && item.seller === seller) {
          return {
            ...item,
            quantity: item.quantity - 1
          };
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove listings with 0 quantity
      
      setPlayerMarketItems(updatedPlayerMarketItems);
    } else {
      // For NPC items, we don't need to update the stock as it's handled separately
    }
    
    // Update state
    onUpdateCharacter(updatedCharacter);
    onUpdateInventory(updatedInventory);
    
    // Show success notification
    const itemName = gameItems[itemId]?.name || itemId;
    addNotification(`Successfully purchased ${itemName}`, "success");
  }, [character, inventory, playerMarketItems, gameItems, onUpdateCharacter, onUpdateInventory, addNotification]);

  // Handle selling an item
  const handleSellItem = useCallback((itemId: string) => {
    // Find item in inventory
    const inventoryItem = inventory.find(item => item.id === itemId);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      addNotification("Item not found in inventory", "error");
      return;
    }
    
    // Calculate sell price (50% of buy price)
    const item = gameItems[itemId];
    if (!item || !item.value) {
      addNotification("Item has no value", "error");
      return;
    }
    
    const sellPrice = Math.floor(item.value * 0.5);
    
    // Update character's gold
    const updatedCharacter = { ...character, gold: character.gold + sellPrice };
    
    // Update inventory
    const updatedInventory = inventory.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    // Update state
    onUpdateCharacter(updatedCharacter);
    onUpdateInventory(updatedInventory);
    
    // Show success notification
    addNotification(`Successfully sold ${item.name} for ${sellPrice} gold`, "success");
  }, [character, inventory, gameItems, onUpdateCharacter, onUpdateInventory, addNotification]);

  // Handle opening listing dialog
  const handleOpenListingDialog = useCallback((itemId: string) => {
    setItemToList(itemId);
    
    // Set default price based on item value
    const item = gameItems[itemId];
    if (item && item.value) {
      setListingPrice(item.value);
    } else {
      setListingPrice(50); // Default price
    }
    
    // Reset other listing state
    setListingCurrency("gold");
    setListingQuantity(1);
    setUseDualCurrency(false);
    setDualCurrencyValues({ gold: 0, gems: 0 });
    setRequireBothCurrencies(false);
  }, [gameItems]);

  // Handle listing an item
  const handleListItem = useCallback(() => {
    console.log("handleListItem called with:", {
      itemToList,
      listingPrice,
      listingCurrency,
      listingQuantity,
      useDualCurrency,
      dualCurrencyValues,
      requireBothCurrencies
    });

    if (!itemToList) return;
    
    // Find item in inventory
    const inventoryItem = inventory.find(item => item.id === itemToList);
    if (!inventoryItem || inventoryItem.quantity < listingQuantity) {
      addNotification("Not enough items in inventory", "error");
      return;
    }
    
    // Get the original game item for reference
    const gameItem = gameItems[itemToList];
    if (!gameItem) {
      addNotification("Item not found", "error");
      return;
    }
    
    // Create listing with all necessary attributes
    const newListing: PlayerMarketItem = {
      id: itemToList,
      price: listingPrice,
      currency: listingCurrency,
      seller: character.name,
      quantity: listingQuantity,
      // Store a reference to the original item for custom attributes
      originalItem: { ...gameItem }
    };
    
    // IMPORTANT: Always add dual currency if values are set, regardless of useDualCurrency flag
    if (dualCurrencyValues.gold > 0 && dualCurrencyValues.gems > 0) {
      newListing.dualCurrency = { ...dualCurrencyValues };
      newListing.requireBothCurrencies = requireBothCurrencies;
      
      console.log("Saving listing with dual currency:", {
        itemId: itemToList,
        dualCurrency: newListing.dualCurrency,
        requireBothCurrencies: newListing.requireBothCurrencies,
        quantity: listingQuantity
      });
    } else if (useDualCurrency) {
      // If dual currency is enabled but values are invalid, show a warning
      console.warn("Dual currency enabled but values are invalid:", dualCurrencyValues);
      addNotification("Dual currency values must be greater than 0", "error");
      return;
    }
    
    // Update player market items
    setPlayerMarketItems(prev => {
      const updated = [...prev, newListing];
      console.log("Updated player market items:", updated);
      return updated;
    });
    
    // Update inventory
    const updatedInventory = inventory.map(item => {
      if (item.id === itemToList) {
        return { ...item, quantity: item.quantity - listingQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    // Update state
    onUpdateInventory(updatedInventory);
    
    // Reset listing state
    setItemToList(null);
    setListingPrice(0);
    setListingCurrency("gold");
    setListingQuantity(1);
    setUseDualCurrency(false);
    setDualCurrencyValues({ gold: 0, gems: 0 });
    setRequireBothCurrencies(false);
    
    // Show success notification
    addNotification(`Successfully listed ${gameItem.name || itemToList} for sale`, "success");
  }, [itemToList, inventory, listingPrice, listingCurrency, listingQuantity, useDualCurrency, dualCurrencyValues, character.name, gameItems, onUpdateInventory, addNotification, requireBothCurrencies]);

  // Filter items based on filter state and search term
  const filterItems = useCallback(<T extends { id: string; price: number; currency: "gold" | "gems"; stock?: number; quantity?: number; dualCurrency?: { gold: number; gems: number } }>(
    items: T[],
    isNpc: boolean
  ): T[] => {
    // If all filters are at default values and no search term, return all items
    const isDefaultFilter = 
      filterState.type === "all" && 
      filterState.rarity === "all" && 
      filterState.currencies.gold && 
      filterState.currencies.gems && 
      filterState.minPrice === defaultFilterState.minPrice && 
      filterState.maxPrice === defaultFilterState.maxPrice && 
      filterState.minGemsPrice === defaultFilterState.minGemsPrice && 
      filterState.maxGemsPrice === defaultFilterState.maxGemsPrice && 
      !filterState.showEquippableOnly && 
      !filterState.showWithStatsOnly && 
      !searchTerm;
    
    if (isDefaultFilter) {
      return items.filter(item => {
        // Only filter out items with no stock/quantity
        if (isNpc && item.stock !== undefined && item.stock <= 0) {
          return false;
        }
        if (!isNpc && item.quantity !== undefined && item.quantity <= 0) {
          return false;
        }
        return true;
      });
    }

    return items.filter(item => {
      const gameItem = gameItems[item.id];
      if (!gameItem) return false;
      
      // Filter by search term
      if (searchTerm && !gameItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !gameItem.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
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
      if (!filterState.currencies.gold && (item.currency === "gold" || (item.dualCurrency && !filterState.currencies.gems))) {
        return false;
      }
      if (!filterState.currencies.gems && (item.currency === "gems" || (item.dualCurrency && !filterState.currencies.gold))) {
        return false;
      }
      
      // Filter by price
      if (item.currency === "gold" && (item.price < filterState.minPrice || item.price > filterState.maxPrice)) {
        return false;
      }
      if (item.currency === "gems" && (item.price < filterState.minGemsPrice || item.price > filterState.maxGemsPrice)) {
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
          if (gameItem.stats[stat] !== undefined && (gameItem.stats[stat] < min || gameItem.stats[stat] > max)) {
            return false;
          }
        }
      }
      
      // Filter by stock/quantity
      if (isNpc && item.stock !== undefined && item.stock <= 0) {
        return false;
      }
      if (!isNpc && item.quantity !== undefined && item.quantity <= 0) {
        return false;
      }
      
      return true;
    });
  }, [filterState, searchTerm, gameItems, defaultFilterState]);

  // Compute filtered NPC items
  const filteredNpcItems = filterItems(npcItems, true) as NpcItem[];
  
  // Compute filtered player market items
  const filteredPlayerItems = filterItems(playerMarketItems, false) as PlayerMarketItem[];
  
  // Compute inventory with prices
  const inventoryWithPrices = inventory.map(item => {
    const gameItem = gameItems[item.id];
    const price = gameItem?.value || 0;
    return { ...item, price };
  });

  return {
    // State
    npcItems,
    playerMarketItems,
    selectedTab,
    selectedAction,
    notifications,
    itemToList,
    listingPrice,
    listingCurrency,
    listingQuantity,
    useDualCurrency,
    dualCurrencyValues,
    requireBothCurrencies,
    filterState,
    searchTerm,
    
    // Handlers
    setSelectedTab,
    setSelectedAction,
    handleBuyItem,
    handleSellItem,
    handleOpenListingDialog,
    handleListItem,
    setListingPrice,
    setListingCurrency,
    setListingQuantity,
    setUseDualCurrency,
    setDualCurrencyValues,
    setRequireBothCurrencies,
    setItemToList,
    updateFilterState,
    resetFilters,
    setSearchTerm,
    
    // Computed values
    filteredNpcItems,
    filteredPlayerItems,
    inventoryWithPrices
  };
}; 