"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Package, Coins, Diamond, Filter, ArrowUpDown, Sparkles, Store, Users, ChevronDown, ChevronUp, Check } from "lucide-react";
import { gameItems } from "@/lib/items";
import { CharacterStats } from "@/components/character-sheet";
import { npcShopItems, npcDialogues, npcAvatar } from "@/lib/marketplace-data";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface MarketplaceProps {
  character: CharacterStats;
  inventory: Array<{ id: string; quantity: number }>;
  onUpdateCharacter: (character: CharacterStats) => void;
  onUpdateInventory: (inventory: Array<{ id: string; quantity: number }>) => void;
}

// Add interface for player market items
interface PlayerMarketItem {
  id: string;
  price: number;
  currency: "gold" | "gems";
  seller: string;
  quantity: number;
  dualCurrency?: {
    gold: number;
    gems: number;
  };
}

// Update the filter state type
interface FilterState {
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

// Helper function to get rarity class for styling
const getRarityClass = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'common':
      return 'text-gray-300';
    case 'uncommon':
      return 'text-green-400';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-400';
    case 'legendary':
      return 'text-amber-400';
    case 'mythic':
      return 'text-red-400';
    default:
      return 'text-gray-300';
  }
};

// Helper function to format stat names
const formatStatName = (stat: string): string => {
  // Convert camelCase to Title Case with spaces
  return stat
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

// Update the Item interface to include statusEffects
interface Item {
  id: string;
  name: string;
  description: string;
  type: string;
  subType?: string;
  rarity?: string;
  value?: number;
  stats?: Record<string, number>;
  equippable?: boolean;
  slot?: string;
  specialAbility?: string;
  statusEffects?: string[];
}

// Restore the rarity-based styling
const rarityStyles = {
  common: "border-gray-600 bg-gradient-to-b from-gray-800 to-gray-900",
  uncommon: "border-green-600 bg-gradient-to-b from-gray-800 to-green-900/30",
  rare: "border-blue-600 bg-gradient-to-b from-gray-800 to-blue-900/30",
  epic: "border-purple-600 bg-gradient-to-b from-gray-800 to-purple-900/30",
  legendary: "border-amber-500 bg-gradient-to-b from-gray-800 to-amber-900/30 shadow-lg shadow-amber-500/20",
  mythic: "border-red-500 bg-gradient-to-b from-gray-800 to-red-900/30 shadow-lg shadow-red-500/20",
};

const rarityButtonStyles = {
  common: "bg-gray-700 hover:bg-gray-600",
  uncommon: "bg-green-700 hover:bg-green-600",
  rare: "bg-blue-700 hover:bg-blue-600",
  epic: "bg-purple-700 hover:bg-purple-600",
  legendary: "bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-black",
  mythic: "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-black",
};

export default function Marketplace({ 
  character, 
  inventory, 
  onUpdateCharacter, 
  onUpdateInventory
}: MarketplaceProps) {
  const [npcItems, setNpcItems] = useState(npcShopItems);
  const [selectedTab, setSelectedTab] = useState<"npc" | "player">("npc");
  const [selectedAction, setSelectedAction] = useState<"buy" | "sell">("buy");
  const [notifications, setNotifications] = useState<Array<{ message: string; type: "success" | "error" }>>([]);
  const [playerMarketItems, setPlayerMarketItems] = useState<PlayerMarketItem[]>([]);
  const [itemToList, setItemToList] = useState<string | null>(null);
  const [listingPrice, setListingPrice] = useState<number>(0);
  const [listingCurrency, setListingCurrency] = useState<"gold" | "gems">("gold");
  const [showListingDialog, setShowListingDialog] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    type: "all",
    rarity: "",
    currencies: {
      gold: true,
      gems: true
    },
    minPrice: 0,
    maxPrice: 999999999,
    minGemsPrice: 0,
    maxGemsPrice: 999999999,
    showEquippableOnly: false,
    showWithStatsOnly: false,
    stats: {
      attack: [0, 999999999],
      defense: [0, 999999999],
      magicPower: [0, 999999999],
      magicDefense: [0, 999999999],
      health: [0, 999999999],
      mana: [0, 999999999],
      speed: [0, 999999999]
    }
  });
  const [sortKey, setSortKey] = useState<"price" | "name" | "type" | "rarity">("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showNpcDialog, setShowNpcDialog] = useState(false);
  const [currentNpcDialog, setCurrentNpcDialog] = useState("");
  const [listingGoldPrice, setListingGoldPrice] = useState<number>(0);
  const [listingGemsPrice, setListingGemsPrice] = useState<number>(0);
  const [useDualCurrency, setUseDualCurrency] = useState<boolean>(false);
  const [statsFilter, setStatsFilter] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [statusEffectFilters, setStatusEffectFilters] = useState<string[]>([]);
  const [listingQuantity, setListingQuantity] = useState<number>(1);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Add a notification
  const addNotification = (message: string, type: "success" | "error") => {
    const newNotification = { message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== newNotification));
    }, 3000);
  };

  // NPC dialogue effect
  useEffect(() => {
    // Set up a timer to show NPC dialogue periodically
    const dialogueInterval = setInterval(() => {
      // Only show dialogue if we're not already showing it
      if (!showNpcDialog) {
        const randomDialogue = npcDialogues[Math.floor(Math.random() * npcDialogues.length)];
        setCurrentNpcDialog(randomDialogue);
        setShowNpcDialog(true);
        
        // Hide the dialogue after 5 seconds
        setTimeout(() => {
          setShowNpcDialog(false);
        }, 5000);
      }
    }, 180000); // Every 3 minutes

    return () => clearInterval(dialogueInterval);
  }, [showNpcDialog]);

  // Buy an item from NPC
  const handleBuyItem = (itemId: string, price: number, currency: "gold" | "gems", dualCurrency?: { gold: number; gems: number }) => {
    // Check if this is a dual currency purchase
    const isDualCurrencyPurchase = dualCurrency && dualCurrency.gold > 0 && dualCurrency.gems > 0;
    
    // Check if player has enough currency
    if (isDualCurrencyPurchase) {
      if (character.gold < dualCurrency!.gold || character.gems < dualCurrency!.gems) {
        addNotification("Not enough currency for this purchase!", "error");
        return;
      }
    } else {
      if (currency === "gold" && character.gold < price) {
        addNotification("Not enough gold!", "error");
        return;
      }
      
      if (currency === "gems" && character.gems < price) {
        addNotification("Not enough gems!", "error");
        return;
      }
    }
    
    // Check if buying from NPC or player market
    const isNpcPurchase = selectedTab === "npc";
    
    if (isNpcPurchase) {
      // Update NPC stock
      const updatedNpcItems = npcItems.map(item => {
        if (item.id === itemId) {
          return { ...item, stock: item.stock - 1 };
        }
        return item;
      }).filter(item => item.stock > 0); // Remove items with no stock
      
      setNpcItems(updatedNpcItems);
    } else {
      // Update player market items
      const updatedPlayerMarketItems = playerMarketItems.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove items with no stock
      
      setPlayerMarketItems(updatedPlayerMarketItems);
    }
    
    // Update player inventory
    const existingItem = inventory.find(item => item.id === itemId);
    let updatedInventory;
    
    if (existingItem) {
      updatedInventory = inventory.map(item => 
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedInventory = [...inventory, { id: itemId, quantity: 1 }];
    }
    
    // Update player currency
    let updatedCharacter;
    if (isDualCurrencyPurchase) {
      updatedCharacter = { 
        ...character, 
        gold: character.gold - dualCurrency!.gold,
        gems: character.gems - dualCurrency!.gems
      };
    } else {
      updatedCharacter = { 
        ...character, 
        [currency]: character[currency] - price 
      };
    }
    
    // Update state
    onUpdateCharacter(updatedCharacter);
    onUpdateInventory(updatedInventory);
    
    if (isDualCurrencyPurchase) {
      addNotification(`Purchased ${gameItems[itemId]?.name || itemId} for ${dualCurrency!.gold} gold and ${dualCurrency!.gems} gems!`, "success");
    } else {
      addNotification(`Purchased ${gameItems[itemId]?.name || itemId} for ${price} ${currency}!`, "success");
    }
  };

  // Sell an item to NPC
  const handleSellItem = (itemId: string) => {
    // Find item in inventory
    const inventoryItem = inventory.find(item => item.id === itemId);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      addNotification("Item not found in inventory!", "error");
      return;
    }
    
    // Calculate sell price (50% of buy price)
    const gameItem = gameItems[itemId];
    if (!gameItem) {
      addNotification("Invalid item!", "error");
      return;
    }
    
    // Determine currency and price
    let currency: "gold" | "gems" = "gold";
    let sellPrice = 0;
    
    // Find if item exists in NPC shop to determine original price
    const shopItem = npcShopItems.find(item => item.id === itemId);
    if (shopItem) {
      currency = shopItem.currency as "gold" | "gems";
      sellPrice = Math.floor(shopItem.price * 0.5); // 50% of original price
    } else {
      // Default sell values if not in shop
      currency = (gameItem.value || 0) >= 100 ? "gems" : "gold";
      sellPrice = currency === "gems" 
        ? Math.max(1, Math.floor((gameItem.value || 0) / 100)) 
        : Math.max(1, (gameItem.value || 0));
      sellPrice = Math.floor(sellPrice * 0.5); // 50% of value
    }
    
    // Update player inventory
    let updatedInventory;
    if (inventoryItem.quantity === 1) {
      updatedInventory = inventory.filter(item => item.id !== itemId);
    } else {
      updatedInventory = inventory.map(item => 
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      );
    }
    
    // Update player currency
    const updatedCharacter = { 
      ...character, 
      [currency]: character[currency] + sellPrice 
    };
    
    // Update state
    onUpdateCharacter(updatedCharacter);
    onUpdateInventory(updatedInventory);
    
    addNotification(`Sold ${gameItems[itemId]?.name || itemId} for ${sellPrice} ${currency}!`, "success");
  };

  // Handle listing an item on player marketplace
  const handleOpenListingDialog = (itemId: string) => {
    const inventoryItem = inventory.find(item => item.id === itemId);
    const maxQuantity = inventoryItem ? inventoryItem.quantity : 1;
    
    setItemToList(itemId);
    setListingGoldPrice(0);
    setListingGemsPrice(0);
    setListingCurrency("gold");
    setListingQuantity(1);
    setShowListingDialog(true);
  };

  const handleListItem = () => {
    if (!itemToList) {
      addNotification("No item selected", "error");
      return;
    }
    
    // Fix validation to allow dual currency listing
    if (listingGoldPrice <= 0 && listingGemsPrice <= 0) {
      addNotification("Please set at least one valid price", "error");
      return;
    }
    
    const inventoryItem = inventory.find(item => item.id === itemToList);
    if (!inventoryItem || inventoryItem.quantity < listingQuantity) {
      addNotification("Not enough items in inventory", "error");
      return;
    }

    // Add item to player marketplace
    setPlayerMarketItems([
      ...playerMarketItems,
      {
        id: itemToList,
        price: listingCurrency === "gold" ? listingGoldPrice : listingGemsPrice,
        currency: listingCurrency,
        seller: "You",
        quantity: listingQuantity,
        dualCurrency: {
          gold: listingGoldPrice,
          gems: listingGemsPrice
        }
      }
    ]);

    // Remove from inventory
    const updatedInventory = inventory.map(item => 
      item.id === itemToList ? { ...item, quantity: item.quantity - listingQuantity } : item
    ).filter(item => item.quantity > 0);

    onUpdateInventory(updatedInventory);
    setShowListingDialog(false);
    
    addNotification(`Listed ${listingQuantity}x ${gameItems[itemToList]?.name || itemToList} for ${listingGoldPrice} Gold and ${listingGemsPrice} Gems!`, "success");
  };

  // Fix the NPC items filtering logic
  const filteredNpcItems = useMemo(() => {
    // npcShopItems is an array of objects with { id, price, currency, stock }
    return npcShopItems.filter(item => {
      const gameItem = gameItems[item.id];
      if (!gameItem) return false;
      
      // Type filter
      if (filter.type && filter.type !== "all" && gameItem.type !== filter.type) return false;
      
      // Rarity filter
      if (filter.rarity && filter.rarity !== "all" && gameItem.rarity !== filter.rarity) return false;
      
      // Currency filter
      if (item.currency === 'gold' && !filter.currencies.gold) return false;
      if (item.currency === 'gems' && !filter.currencies.gems) return false;
      
      // Price filter
      if (item.currency === 'gold' && (item.price < filter.minPrice || item.price > filter.maxPrice)) return false;
      if (item.currency === 'gems' && (item.price < filter.minGemsPrice || item.price > filter.maxGemsPrice)) return false;
      
      // Stats filters
      if (filter.showWithStatsOnly && (!gameItem.stats || Object.keys(gameItem.stats).length === 0)) {
        return false;
      }
      
      // Equippable filter
      if (filter.showEquippableOnly && !gameItem.equippable) {
        return false;
      }
      
      // Check each selected stat range
      if (gameItem.stats) {
        for (const [stat, [min, max]] of Object.entries(filter.stats)) {
          if (statsFilter.includes(stat)) {
            const itemStatValue = gameItem.stats[stat] || 0;
            if (itemStatValue < min || itemStatValue > max) {
              return false;
            }
          }
        }
      }
      
      return true;
    });
  }, [filter, statsFilter, npcShopItems]);
  
  const filteredPlayerMarketItems = useMemo(() => {
    return playerMarketItems.filter(item => {
      const gameItem = gameItems[item.id];
      if (!gameItem) return false;
      
      // Type filter
      if (filter.type && filter.type !== "all" && gameItem.type !== filter.type) return false;
      
      // Rarity filter
      if (filter.rarity && gameItem.rarity !== filter.rarity) return false;
      
      // Currency filter - check if either gold or gems is selected
      if (item.dualCurrency) {
        // For dual currency items, check if either currency is selected and within range
        const goldSelected = filter.currencies.gold;
        const gemsSelected = filter.currencies.gems;
        
        // If neither currency is selected, don't show the item
        if (!goldSelected && !gemsSelected) return false;
        
        // If gold is selected, check gold price range
        if (goldSelected && (item.dualCurrency.gold < filter.minPrice || item.dualCurrency.gold > filter.maxPrice)) {
          // If gold is out of range but gems is not selected, don't show
          if (!gemsSelected) return false;
        }
        
        // If gems is selected, check gems price range
        if (gemsSelected && (item.dualCurrency.gems < filter.minGemsPrice || item.dualCurrency.gems > filter.maxGemsPrice)) {
          // If gems is out of range but gold is not selected, don't show
          if (!goldSelected) return false;
        }
      } else {
        // For single currency items
        if (item.currency === 'gold') {
          if (!filter.currencies.gold) return false;
          if (item.price < filter.minPrice || item.price > filter.maxPrice) return false;
        } else if (item.currency === 'gems') {
          if (!filter.currencies.gems) return false;
          if (item.price < filter.minGemsPrice || item.price > filter.maxGemsPrice) return false;
        }
      }
      
      // Stats filters
      if (filter.showWithStatsOnly && (!gameItem.stats || Object.keys(gameItem.stats).length === 0)) {
        return false;
      }
      
      // Check each selected stat range
      if (gameItem.stats) {
        for (const [stat, [min, max]] of Object.entries(filter.stats)) {
          if (statsFilter.includes(stat)) {
            const itemStatValue = gameItem.stats[stat] || 0;
            if (itemStatValue < min || itemStatValue > max) {
              return false;
            }
          }
        }
      }
      
      return true;
    });
  }, [filter, statsFilter, playerMarketItems]);

  // Enhanced filtering logic
  const renderFilterControls = () => (
    <div className={`p-4 rounded-lg ${
      selectedTab === "npc" 
        ? "bg-gradient-to-b from-amber-950/30 to-amber-900/10" 
        : "bg-gradient-to-b from-blue-950/30 to-blue-900/10"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className={`w-5 h-5 mr-2 ${selectedTab === "npc" ? "text-amber-400" : "text-blue-400"}`} />
          <h3 className={`text-lg font-medium ${selectedTab === "npc" ? "text-amber-300" : "text-blue-300"}`}>
            Market Filters
          </h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setFilter({
            type: "all",
            rarity: "",
            currencies: {
              gold: true,
              gems: true
            },
            minPrice: 0,
            maxPrice: 999999999,
            minGemsPrice: 0,
            maxGemsPrice: 999999999,
            showEquippableOnly: false,
            showWithStatsOnly: false,
            stats: {
              attack: [0, 999999999],
              defense: [0, 999999999],
              magicPower: [0, 999999999],
              magicDefense: [0, 999999999],
              health: [0, 999999999],
              mana: [0, 999999999],
              speed: [0, 999999999]
            }
          })}
          className={`${selectedTab === "npc" ? "border-amber-600 text-amber-400" : "border-blue-600 text-blue-400"}`}
        >
          Reset Filters
        </Button>
      </div>
      
      {/* Item Type Filter */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Package className={`w-4 h-4 mr-2 ${selectedTab === "npc" ? "text-amber-400" : "text-blue-400"}`} />
          <label className="text-sm font-medium text-gray-300">Item Type</label>
        </div>
        <Select
          value={filter.type || "all"}
          onValueChange={(value) => setFilter({...filter, type: value === "all" ? "" : value})}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="weapon">Weapons</SelectItem>
            <SelectItem value="armor">Armor</SelectItem>
            <SelectItem value="accessory">Accessories</SelectItem>
            <SelectItem value="consumable">Consumables</SelectItem>
            <SelectItem value="material">Materials</SelectItem>
            <SelectItem value="ingredient">Ingredients</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Rarity Filter */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Sparkles className={`w-4 h-4 mr-2 ${selectedTab === "npc" ? "text-amber-400" : "text-blue-400"}`} />
          <label className="text-sm font-medium text-gray-300">Rarity</label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`${filter.rarity === "" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400"} border-gray-700`}
            onClick={() => setFilter({...filter, rarity: ""})}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${filter.rarity === "common" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400"} border-gray-700`}
            onClick={() => setFilter({...filter, rarity: filter.rarity === "common" ? "" : "common"})}
          >
            Common
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${filter.rarity === "uncommon" ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"} border-green-800`}
            onClick={() => setFilter({...filter, rarity: filter.rarity === "uncommon" ? "" : "uncommon"})}
          >
            <span className="text-green-400 mr-1">★</span>
            Uncommon
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${filter.rarity === "rare" ? "bg-blue-900 text-blue-300" : "bg-gray-800 text-gray-400"} border-blue-800`}
            onClick={() => setFilter({...filter, rarity: filter.rarity === "rare" ? "" : "rare"})}
          >
            <span className="text-blue-400 mr-1">★</span>
            Rare
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${filter.rarity === "epic" ? "bg-purple-900 text-purple-300" : "bg-gray-800 text-gray-400"} border-purple-800`}
            onClick={() => setFilter({...filter, rarity: filter.rarity === "epic" ? "" : "epic"})}
          >
            <span className="text-purple-400 mr-1">★</span>
            Epic
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${filter.rarity === "legendary" ? "bg-amber-900 text-amber-300" : "bg-gray-800 text-gray-400"} border-amber-800`}
            onClick={() => setFilter({...filter, rarity: filter.rarity === "legendary" ? "" : "legendary"})}
          >
            <span className="text-amber-400 mr-1">★</span>
            Legendary
          </Button>
        </div>
      </div>
      
      {/* Currency Filter */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Coins className={`w-4 h-4 mr-2 ${selectedTab === "npc" ? "text-amber-400" : "text-blue-400"}`} />
          <label className="text-sm font-medium text-gray-300">Currency</label>
        </div>
        <div className="flex space-x-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 ${filter.currencies.gold ? "bg-amber-900/50 text-amber-300 border-amber-700" : "bg-gray-800 text-gray-400 border-gray-700"}`}
            onClick={() => setFilter({...filter, currencies: {...filter.currencies, gold: !filter.currencies.gold}})}
          >
            <Coins className="w-4 h-4 mr-2 text-amber-500" />
            Gold
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 ${filter.currencies.gems ? "bg-blue-900/50 text-blue-300 border-blue-700" : "bg-gray-800 text-gray-400 border-gray-700"}`}
            onClick={() => setFilter({...filter, currencies: {...filter.currencies, gems: !filter.currencies.gems}})}
          >
            <Diamond className="w-4 h-4 mr-2 text-blue-500" />
            Gems
          </Button>
        </div>
        
        {/* Gold Price Range */}
        {filter.currencies.gold && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Coins className="w-4 h-4 mr-2 text-amber-500" />
              <label className="text-sm font-medium text-amber-300">Gold Price Range</label>
            </div>
            <Slider
              defaultValue={[0, 999999999]}
              value={[filter.minPrice, filter.maxPrice]}
              min={0}
              max={999999999} 
              step={1000}
              onValueChange={(values) => {
                setFilter({...filter, minPrice: values[0], maxPrice: values[1]});
              }}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-amber-500" />
                <input 
                  type="text" 
                  min={0} 
                  max={filter.maxPrice} 
                  value={filter.minPrice} 
                  onChange={(e) => {
                    // Remove leading zeros
                    const value = e.target.value.replace(/^0+/, '') || '0';
                    const numValue = Math.max(0, Math.min(parseInt(value) || 0, filter.maxPrice));
                    setFilter({...filter, minPrice: numValue});
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-28 pl-8 py-1 bg-gray-800 border border-gray-700 rounded text-white"
                />
                <span className="ml-1">Min</span>
              </div>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-amber-500" />
                <input 
                  type="text" 
                  min={filter.minPrice} 
                  max={999999999} 
                  value={filter.maxPrice} 
                  onChange={(e) => {
                    // Remove leading zeros
                    const value = e.target.value.replace(/^0+/, '') || '0';
                    const numValue = Math.max(filter.minPrice, Math.min(parseInt(value) || 0, 999999999));
                    setFilter({...filter, maxPrice: numValue});
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-28 pl-8 py-1 bg-gray-800 border border-gray-700 rounded text-white"
                />
                <span className="ml-1">Max</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Gems Price Range */}
        {filter.currencies.gems && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Diamond className="w-4 h-4 mr-2 text-blue-500" />
              <label className="text-sm font-medium text-blue-300">Gems Price Range</label>
            </div>
            <Slider
              defaultValue={[0, 999999999]}
              value={[filter.minGemsPrice, filter.maxGemsPrice]}
              min={0}
              max={999999999} 
              step={10}
              onValueChange={(values) => {
                setFilter({...filter, minGemsPrice: values[0], maxGemsPrice: values[1]});
              }}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <div className="relative">
                <Diamond className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-blue-500" />
                <input 
                  type="text" 
                  min={0} 
                  max={filter.maxGemsPrice} 
                  value={filter.minGemsPrice} 
                  onChange={(e) => {
                    // Remove leading zeros
                    const value = e.target.value.replace(/^0+/, '') || '0';
                    const numValue = Math.max(0, Math.min(parseInt(value) || 0, filter.maxGemsPrice));
                    setFilter({...filter, minGemsPrice: numValue});
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-28 pl-8 py-1 bg-gray-800 border border-gray-700 rounded text-blue-100"
                />
                <span className="ml-1">Min</span>
              </div>
              <div className="relative">
                <Diamond className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-blue-500" />
                <input 
                  type="text" 
                  min={filter.minGemsPrice} 
                  max={999999999} 
                  value={filter.maxGemsPrice} 
                  onChange={(e) => {
                    // Remove leading zeros
                    const value = e.target.value.replace(/^0+/, '') || '0';
                    const numValue = Math.max(filter.minGemsPrice, Math.min(parseInt(value) || 0, 999999999));
                    setFilter({...filter, maxGemsPrice: numValue});
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-28 pl-8 py-1 bg-gray-800 border border-gray-700 rounded text-blue-100"
                />
                <span className="ml-1">Max</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Stats Filter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <ArrowUpDown className={`w-4 h-4 mr-2 ${selectedTab === "npc" ? "text-amber-400" : "text-blue-400"}`} />
            <label className="text-sm font-medium text-gray-300">Stats</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="showWithStatsOnly" 
              checked={filter.showWithStatsOnly}
              onCheckedChange={(checked) => setFilter({...filter, showWithStatsOnly: checked === true})}
              className="mr-2 data-[state=checked]:bg-blue-600"
            />
            <label htmlFor="showWithStatsOnly" className="text-xs text-gray-400">
              Show items with stats only
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {["attack", "defense", "magicPower", "magicDefense", "health", "mana", "speed"].map(stat => (
            <Button
              key={stat}
              variant="outline"
              size="sm"
              className={`${statsFilter.includes(stat) ? "bg-blue-900/30 text-blue-300 border-blue-700" : "bg-gray-800 text-gray-400 border-gray-700"}`}
              onClick={() => {
                if (statsFilter.includes(stat)) {
                  setStatsFilter(statsFilter.filter(s => s !== stat));
                } else {
                  setStatsFilter([...statsFilter, stat]);
                }
              }}
            >
              <Check className={`w-4 h-4 mr-2 ${statsFilter.includes(stat) ? "text-blue-400" : "text-gray-600"}`} />
              {formatStatName(stat)}
            </Button>
          ))}
        </div>
        
        {/* Stat Range Sliders */}
        {statsFilter.length > 0 && (
          <div className="space-y-4 mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            {statsFilter.map(stat => (
              <div key={stat} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-gray-300">{formatStatName(stat)}</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="w-16 py-0.5 px-2 text-xs bg-gray-900 border border-gray-700 rounded text-white"
                      value={filter.stats[stat][0]}
                      onChange={(e) => {
                        // Remove leading zeros
                        const value = e.target.value.replace(/^0+/, '') || '0';
                        const numValue = parseInt(value) || 0;
                        setFilter({
                          ...filter,
                          stats: {
                            ...filter.stats,
                            [stat]: [numValue, filter.stats[stat][1]]
                          }
                        });
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="text"
                      className="w-16 py-0.5 px-2 text-xs bg-gray-900 border border-gray-700 rounded text-white"
                      value={filter.stats[stat][1]}
                      onChange={(e) => {
                        // Remove leading zeros
                        const value = e.target.value.replace(/^0+/, '') || '0';
                        const numValue = parseInt(value) || 0;
                        setFilter({
                          ...filter,
                          stats: {
                            ...filter.stats,
                            [stat]: [filter.stats[stat][0], numValue]
                          }
                        });
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                </div>
                <Slider
                  defaultValue={[0, 999999999]}
                  value={[filter.stats[stat][0], filter.stats[stat][1]]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(values) => {
                    setFilter({
                      ...filter,
                      stats: {
                        ...filter.stats,
                        [stat]: [values[0], values[1]]
                      }
                    });
                  }}
                  className="my-1"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render item card
  const renderItemCard = (
    itemId: string, 
    price: number, 
    currency: "gold" | "gems", 
    stock: number, 
    action: "buy" | "sell" | "list",
    dualCurrency?: { gold: number; gems: number }
  ) => {
    const item = gameItems[itemId];
    if (!item) return null;
    
    // Get equipped item for comparison if this is an equippable item
    let comparisonItem = null;
    if (item.equippable && item.slot) {
      const equippedItemId = character.equipment[item.slot];
      if (equippedItemId && typeof equippedItemId === 'string') {
        comparisonItem = gameItems[equippedItemId];
      }
    }
    
    // Determine rarity-based styling
    const rarityClass = item.rarity && rarityStyles[item.rarity as keyof typeof rarityStyles] 
      ? rarityStyles[item.rarity as keyof typeof rarityStyles] 
      : rarityStyles.common;
    
    const buttonClass = item.rarity && rarityButtonStyles[item.rarity as keyof typeof rarityButtonStyles] 
      ? rarityButtonStyles[item.rarity as keyof typeof rarityButtonStyles] 
      : rarityButtonStyles.common;
    
    return (
      <div className="relative group">
        <div className={`rounded-lg border-2 ${rarityClass} overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
          <div className="p-4">
            {/* Header with name and price */}
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-lg font-bold ${item.rarity === 'legendary' ? 'text-gradient-gold' : 'text-amber-400'}`}>
                {item.name}
              </h3>
              
              {/* Price display - show dual currency if available */}
              <div className="flex flex-col items-end">
                {dualCurrency ? (
                  <>
                    <div className="flex items-center mb-1">
                      <span className="text-amber-400 font-medium mr-1">{dualCurrency.gold}</span>
                      <Coins className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-400 font-medium mr-1">{dualCurrency.gems}</span>
                      <Diamond className="h-4 w-4 text-blue-500" />
                    </div>
                  </>
                ) : (
                  <Badge 
                    variant={currency === "gems" ? "secondary" : "default"} 
                    className={`${currency === "gems" ? "bg-blue-600" : "bg-amber-600"} text-white font-medium`}
                  >
                    {price} {currency === "gems" ? 
                      <Diamond className="h-3 w-3 ml-1" /> : 
                      <Coins className="h-3 w-3 ml-1" />
                    }
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Item type and rarity */}
            <div className="flex items-center mb-3">
              <span className="text-gray-400 text-sm">
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                {item.subType && ` - ${item.subType.charAt(0).toUpperCase() + item.subType.slice(1)}`}
              </span>
              {item.rarity && (
                <Badge 
                  variant="outline" 
                  className={`ml-2 text-xs ${
                    item.rarity === 'legendary' ? 'border-amber-500 text-amber-400' :
                    item.rarity === 'epic' ? 'border-purple-500 text-purple-400' :
                    item.rarity === 'rare' ? 'border-blue-500 text-blue-400' :
                    item.rarity === 'uncommon' ? 'border-green-500 text-green-400' :
                    'border-gray-500 text-gray-400'
                  }`}
                >
                  {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                </Badge>
              )}
            </div>
            
            {/* Quantity badge for items with stock > 1 */}
            {stock > 1 && (
              <div className="mb-3 flex items-center">
                <Badge className="bg-gray-800 border border-gray-700 text-white flex items-center">
                  <Package className="h-3 w-3 mr-1 text-green-400" />
                  <span className="text-green-400 font-medium">{stock}</span>
                  <span className="ml-1">in stock</span>
                </Badge>
              </div>
            )}
            
            {/* Item description with fancy border */}
            <div className="mb-3 p-2 bg-black bg-opacity-30 rounded border-l-2 border-gray-600">
              <p className="text-sm text-gray-300 italic">{item.description}</p>
            </div>
            
            {/* Item stats preview (if any) */}
            {item.stats && Object.keys(item.stats).length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                {Object.entries(item.stats).slice(0, 4).map(([stat, value]) => (
                  <div key={stat} className="flex items-center text-xs">
                    <span className="text-gray-400 mr-1">{formatStatName(stat)}:</span>
                    <span className="text-gray-300">
                      {value > 0 ? `+${value}` : value}
                    </span>
                  </div>
                ))}
                {Object.keys(item.stats).length > 4 && (
                  <div className="text-xs text-blue-400">+{Object.keys(item.stats).length - 4} more stats...</div>
                )}
              </div>
            )}
            
            {/* Status effects if available */}
            {(item as any).statusEffects && Array.isArray((item as any).statusEffects) && (item as any).statusEffects.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">Effects:</div>
                <div className="flex flex-wrap gap-1">
                  {(item as any).statusEffects.map((effect: string) => (
                    <span key={effect} className="rounded bg-purple-900 bg-opacity-30 px-1.5 py-0.5 text-xs text-purple-300">
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="mt-4">
              {action === "buy" && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className={`w-full ${buttonClass} text-white font-medium shadow-md`}
                  onClick={() => handleBuyItem(itemId, price, currency, dualCurrency)}
                  disabled={
                    (currency === "gold" && character.gold < price) || 
                    (currency === "gems" && character.gems < price) ||
                    (dualCurrency && (character.gold < dualCurrency.gold || character.gems < dualCurrency.gems)) ||
                    stock <= 0
                  }
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy {stock <= 0 ? "(Out of stock)" : ""}
                </Button>
              )}
              
              {action === "sell" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`w-full border-amber-600 text-amber-400 hover:bg-amber-900 hover:bg-opacity-20`}
                  onClick={() => handleSellItem(itemId)}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Sell for {Math.floor(price * 0.5)} Gold
                </Button>
              )}
              
              {action === "list" && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className={`w-full ${buttonClass} text-white font-medium shadow-md`}
                  onClick={() => handleOpenListingDialog(itemId)}
                >
                  <Package className="w-4 h-4 mr-2" />
                  List on Market
                </Button>
              )}
            </div>
          </div>
          
          {/* Legendary/Mythic item effect */}
          {(item.rarity === 'legendary') && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className={`mb-6 p-6 rounded-lg ${
        selectedTab === "npc" 
          ? "bg-gradient-to-r from-amber-950 to-amber-900/50 border-2 border-amber-800/50" 
          : "bg-gradient-to-r from-blue-950 to-blue-900/50 border-2 border-blue-800/50"
      }`}>
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          {selectedTab === "npc" ? (
            <>
              <Store className="w-8 h-8 mr-3 text-amber-400" />
              <span className="text-amber-300">Merchant's Shop</span>
            </>
          ) : (
            <>
              <Users className="w-8 h-8 mr-3 text-blue-400" />
              <span className="text-blue-300">Player Marketplace</span>
            </>
          )}
        </h1>
        <p className="text-gray-300 mb-4">
          {selectedTab === "npc" 
            ? "Buy items from the merchant or sell your items for gold" 
            : "Trade items with other players using gold and gems"}
        </p>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            <span className="text-amber-400 font-medium">{character.gold} Gold</span>
          </div>
          <div className="flex items-center gap-2">
            <Diamond className="h-5 w-5 text-blue-500" />
            <span className="text-blue-400 font-medium">{character.gems} Gems</span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="npc" className="w-full" onValueChange={(value) => setSelectedTab(value as "npc" | "player")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger 
            value="npc" 
            className={`text-base ${selectedTab === "npc" ? 
              "bg-gradient-to-r from-amber-700 to-amber-900 border-2 border-amber-500 text-amber-100 font-semibold" : 
              "bg-gray-800"}`}
          >
            <Store className="w-5 h-5 mr-2" />
            NPC Shop
          </TabsTrigger>
          <TabsTrigger 
            value="player" 
            className={`text-base ${selectedTab === "player" ? 
              "bg-gradient-to-r from-blue-700 to-blue-900 border-2 border-blue-500 text-blue-100 font-semibold" : 
              "bg-gray-800"}`}
          >
            <Users className="w-5 h-5 mr-2" />
            Player Market
          </TabsTrigger>
        </TabsList>
        
        {/* Collapsible Filters */}
        <div className={`mb-6 rounded-lg overflow-hidden ${
          selectedTab === "npc" 
            ? "bg-gradient-to-b from-amber-950/30 to-amber-900/10 border-2 border-amber-800/50" 
            : "bg-gradient-to-b from-blue-950/30 to-blue-900/10 border-2 border-blue-800/50"
        }`}>
          <div 
            className="p-3 flex justify-between items-center cursor-pointer"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <div className="flex items-center">
              <Filter className={`w-5 h-5 mr-2 ${selectedTab === "npc" ? "text-amber-400" : "text-blue-400"}`} />
              <h2 className={`text-lg font-semibold ${selectedTab === "npc" ? "text-amber-300" : "text-blue-300"}`}>
                Market Filters
              </h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${selectedTab === "npc" ? "text-amber-400" : "text-blue-400"}`}
            >
              {filtersExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
          
          {filtersExpanded && (
            <div className="p-4 pt-0">
              {renderFilterControls()}
            </div>
          )}
        </div>
        
        {/* Buy/Sell Button Group - Moved below filters */}
        <div className="flex justify-center mb-6">
          <div className={`inline-flex rounded-md shadow-sm ${
            selectedTab === "npc" 
              ? "bg-amber-900/30 border border-amber-700/50" 
              : "bg-blue-900/30 border border-blue-700/50"
          }`}>
            <Button
              variant="ghost"
              className={`rounded-l-md rounded-r-none px-6 py-2 ${
                selectedAction === "buy" 
                  ? selectedTab === "npc"
                    ? "bg-amber-700 text-amber-100 border-2 border-amber-500 hover:bg-amber-800"
                    : "bg-blue-700 text-blue-100 border-2 border-blue-500 hover:bg-blue-800"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedAction("buy")}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Buy
            </Button>
            <Button
              variant="ghost"
              className={`rounded-r-md rounded-l-none px-6 py-2 ${
                selectedAction === "sell" 
                  ? selectedTab === "npc"
                    ? "bg-amber-700 text-amber-100 border-2 border-amber-500 hover:bg-amber-800"
                    : "bg-blue-700 text-blue-100 border-2 border-blue-500 hover:bg-blue-800"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedAction("sell")}
            >
              {selectedTab === "npc" ? (
                <Coins className="mr-2 h-5 w-5" />
              ) : (
                <Package className="mr-2 h-5 w-5" />
              )}
              {selectedTab === "npc" ? "Sell" : "List"}
            </Button>
          </div>
        </div>
        
        <TabsContent value="npc" className="mt-0">
          <div className="bg-gradient-to-b from-amber-950/30 to-amber-900/10 border-2 border-amber-800/50 rounded-lg p-4">
            {selectedAction === "buy" ? (
              <div className="space-y-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNpcItems.map(item => (
                      <div key={item.id}>
                        {renderItemCard(
                          item.id,
                          item.price,
                          item.currency,
                          item.stock || 1,
                          "buy"
                        )}
                      </div>
                    ))}
                    {filteredNpcItems.length === 0 && (
                      <div className="col-span-2 text-center py-10 text-gray-400">
                        No items match your filter criteria
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) :
              <div className="space-y-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory
                      .filter(item => item.quantity > 0)
                      .map(item => {
                        const gameItem = gameItems[item.id];
                        if (!gameItem) return null;
                        
                        // Calculate sell price (50% of buy price)
                        let currency: "gold" | "gems" = "gold";
                        let sellPrice = 0;
                        
                        // Find if item exists in NPC shop to determine original price
                        const shopItem = npcShopItems.find(i => i.id === item.id);
                        if (shopItem) {
                          currency = shopItem.currency as "gold" | "gems";
                          sellPrice = Math.floor(shopItem.price * 0.5); // 50% of original price
                        } else {
                          // Default sell values if not in shop
                          currency = (gameItem.value || 0) >= 100 ? "gems" : "gold";
                          sellPrice = currency === "gems" 
                            ? Math.max(1, Math.floor((gameItem.value || 0) / 100)) 
                            : Math.max(1, (gameItem.value || 0));
                          sellPrice = Math.floor(sellPrice * 0.5); // 50% of value
                        }
                        
                        return (
                          <div key={item.id} className="relative">
                            {renderItemCard(item.id, sellPrice, currency, item.quantity, "sell", undefined)}
                          </div>
                        );
                      })}
                    {inventory.filter(item => item.quantity > 0).length === 0 && (
                      <div className="col-span-2 text-center py-10 text-gray-500">
                        Your inventory is empty
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            }
          </div>
        </TabsContent>
        
        <TabsContent value="player" className="mt-0">
          <div className="bg-gradient-to-b from-blue-950/30 to-blue-900/10 border-2 border-blue-800/50 rounded-lg p-4">
            {selectedAction === "buy" ? (
              <div className="space-y-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPlayerMarketItems.map(item => (
                      <div key={`${item.id}-${item.seller}`}>
                        {renderItemCard(
                          item.id, 
                          item.price, 
                          item.currency, 
                          item.quantity, 
                          "buy", 
                          'dualCurrency' in item ? item.dualCurrency : undefined
                        )}
                      </div>
                    ))}
                    {filteredPlayerMarketItems.length === 0 && (
                      <div className="col-span-2 text-center py-10 text-gray-500">
                        No items are currently listed on the player market
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) :
              <div className="space-y-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory
                      .filter(item => item.quantity > 0)
                      .map(item => (
                        <div key={item.id} className="relative">
                          {renderItemCard(item.id, 0, "gold", item.quantity, "list", undefined)}
                        </div>
                      ))}
                    {inventory.filter(item => item.quantity > 0).length === 0 && (
                      <div className="col-span-2 text-center py-10 text-gray-500">
                        Your inventory is empty
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            }
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Listing Dialog */}
      <Dialog open={showListingDialog} onOpenChange={setShowListingDialog}>
        <DialogContent className="bg-gradient-to-b from-blue-950 to-gray-950 border-2 border-blue-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-300 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-400" />
              List Item on Player Market
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Set your price and quantity to list this item on the player market.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <div className="space-y-4">
              {itemToList && (
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${getRarityClass(gameItems[itemToList]?.rarity || "common")}`}>
                      {gameItems[itemToList]?.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {gameItems[itemToList]?.type} - {gameItems[itemToList]?.subType || "General"}
                    </p>
                  </div>
                  <Badge className={`${getRarityClass(gameItems[itemToList]?.rarity || "common")} bg-opacity-20 bg-blue-900`}>
                    {gameItems[itemToList]?.rarity || "Common"}
                  </Badge>
                </div>
              )}
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400 font-medium">Pricing Options</label>
                  <Switch 
                    checked={useDualCurrency} 
                    onCheckedChange={setUseDualCurrency}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                
                {useDualCurrency ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Gold Price</label>
                      <div className="relative">
                        <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                        <Input
                          type="number"
                          min="0"
                          value={listingGoldPrice}
                          onChange={(e) => setListingGoldPrice(parseInt(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          placeholder="Gold Price"
                          className="pl-10 bg-gray-900 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Gems Price</label>
                      <div className="relative">
                        <Diamond className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                        <Input
                          type="number"
                          min="0"
                          value={listingGemsPrice}
                          onChange={(e) => setListingGemsPrice(parseInt(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          placeholder="Gems Price"
                          className="pl-10 bg-gray-900 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Price</label>
                      <div className="relative">
                        {listingCurrency === "gold" ? (
                          <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                        ) : (
                          <Diamond className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                        )}
                        <Input
                          type="number"
                          min="0"
                          value={listingCurrency === "gold" ? listingGoldPrice : listingGemsPrice}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (listingCurrency === "gold") {
                              setListingGoldPrice(value);
                            } else {
                              setListingGemsPrice(value);
                            }
                          }}
                          onFocus={(e) => e.target.select()}
                          placeholder="Price"
                          className="pl-10 bg-gray-900 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={listingCurrency === "gold" ? "default" : "outline"}
                        className={listingCurrency === "gold" ? "bg-amber-700 hover:bg-amber-800 text-white" : "border-gray-700 text-gray-300"}
                        onClick={() => setListingCurrency("gold")}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Gold
                      </Button>
                      <Button
                        type="button"
                        variant={listingCurrency === "gems" ? "default" : "outline"}
                        className={listingCurrency === "gems" ? "bg-blue-700 hover:bg-blue-800 text-white" : "border-gray-700 text-gray-300"}
                        onClick={() => setListingCurrency("gems")}
                      >
                        <Diamond className="w-4 h-4 mr-2" />
                        Gems
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">Quantity</label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                      <Input
                        type="number"
                        min="1"
                        max={inventory.find(item => item.id === itemToList)?.quantity || 1}
                        value={listingQuantity}
                        onChange={(e) => {
                          const max = inventory.find(item => item.id === itemToList)?.quantity || 1;
                          const value = parseInt(e.target.value) || 1;
                          setListingQuantity(Math.max(1, Math.min(value, max)));
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="Quantity"
                        className="pl-10 bg-gray-900 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    Max: {inventory.find(item => item.id === itemToList)?.quantity || 1}
                  </Badge>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 italic mt-2">
                Set at least one price to list your item. Players can choose to pay with either currency.
              </div>
            </div>
          </div>
          
          <DialogFooter className="border-t border-gray-700 pt-4">
            <Button variant="outline" onClick={() => setShowListingDialog(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
            <Button 
              onClick={handleListItem} 
              className="bg-blue-700 hover:bg-blue-800 text-white font-medium"
              disabled={listingGoldPrice <= 0 && listingGemsPrice <= 0}
            >
              <Package className="w-4 h-4 mr-2" />
              List Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className={`px-4 py-2 rounded-md shadow-lg transition-all duration-300 ${
              notification.type === "success" ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100"
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
} 