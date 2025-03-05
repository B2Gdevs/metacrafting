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
import { ShoppingCart, Package, Coins, Diamond, Filter, ArrowUpDown } from "lucide-react";
import { gameItems } from "@/lib/items";
import { CharacterStats } from "@/components/character-sheet";
import { npcShopItems, npcDialogues, npcAvatar } from "@/lib/marketplace-data";

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
  dualCurrency?: {
    gold: number;
    gems: number;
  };
}

// Update the filter state type
interface FilterState {
  type: string;
  rarity: string;
  currency: string;
  minPrice: number;
  maxPrice: number;
  showEquippableOnly: boolean;
  showWithStatsOnly: boolean;
  stats: Record<string, [number, number]>;
}

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
    type: "",
    rarity: "",
    currency: "",
    minPrice: 0,
    maxPrice: 1000,
    showEquippableOnly: false,
    showWithStatsOnly: false,
    stats: {
      attack: [0, 100],
      defense: [0, 100],
      magicPower: [0, 100],
      magicDefense: [0, 100],
      health: [0, 100],
      mana: [0, 100],
      speed: [0, 100]
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
    const dialogueInterval = setInterval(() => {
      const randomDialogue = npcDialogues[Math.floor(Math.random() * npcDialogues.length)];
      setCurrentNpcDialog(randomDialogue);
      setShowNpcDialog(true);
      
      // Hide dialogue after 5 seconds
      setTimeout(() => {
        setShowNpcDialog(false);
      }, 5000);
    }, 180000); // Every 3 minutes

    return () => clearInterval(dialogueInterval);
  }, []);

  // Buy an item from NPC
  const handleBuyItem = (itemId: string, price: number, currency: "gold" | "gems") => {
    // Check if player has enough currency
    if (currency === "gold" && character.gold < price) {
      addNotification("Not enough gold!", "error");
      return;
    }
    
    if (currency === "gems" && character.gems < price) {
      addNotification("Not enough gems!", "error");
      return;
    }
    
    // Update NPC stock
    const updatedNpcItems = npcItems.map(item => {
      if (item.id === itemId) {
        return { ...item, stock: item.stock - 1 };
      }
      return item;
    }).filter(item => item.stock > 0); // Remove items with no stock
    
    setNpcItems(updatedNpcItems);
    
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
    const updatedCharacter = { 
      ...character, 
      [currency]: character[currency] - price 
    };
    
    // Update state
    onUpdateCharacter(updatedCharacter);
    onUpdateInventory(updatedInventory);
    
    addNotification(`Purchased ${gameItems[itemId]?.name || itemId} for ${price} ${currency}!`, "success");
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
      currency = shopItem.currency;
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
    setItemToList(itemId);
    setListingPrice(0);
    setListingCurrency("gold");
    setShowListingDialog(true);
  };

  const handleListItem = () => {
    if (!itemToList) {
      addNotification("No item selected", "error");
      return;
    }
    
    if (useDualCurrency) {
      if (listingGoldPrice <= 0 && listingGemsPrice <= 0) {
        addNotification("Please set at least one valid price", "error");
        return;
      }
    } else {
      if (listingPrice <= 0) {
        addNotification("Please set a valid price", "error");
        return;
      }
    }

    // Add item to player marketplace
    setPlayerMarketItems([
      ...playerMarketItems,
      {
        id: itemToList,
        price: useDualCurrency ? (listingCurrency === "gold" ? listingGoldPrice : listingGemsPrice) : listingPrice,
        currency: listingCurrency,
        seller: "You",
        dualCurrency: useDualCurrency ? {
          gold: listingGoldPrice,
          gems: listingGemsPrice
        } : undefined
      }
    ]);

    // Remove from inventory
    const updatedInventory = inventory.map(item => 
      item.id === itemToList ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0);

    onUpdateInventory(updatedInventory);
    setShowListingDialog(false);
    
    if (useDualCurrency) {
      addNotification(`Listed ${gameItems[itemToList]?.name || itemToList} for ${listingGoldPrice} Gold and ${listingGemsPrice} Gems!`, "success");
    } else {
      addNotification(`Listed ${gameItems[itemToList]?.name || itemToList} for ${listingPrice} ${listingCurrency}!`, "success");
    }
  };

  // Enhanced Buy/Sell Buttons
  const buyButtonClass = selectedAction === 'buy' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600';
  const sellButtonClass = selectedAction === 'sell' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600';

  // Enhanced filtering logic
  const filteredItems = useMemo(() => {
    let items = selectedTab === "npc" 
      ? npcItems.filter(item => {
          const gameItem = gameItems[item.id];
          if (!gameItem) return false;
          
          // Apply type filter
          if (filter.type && gameItem.type !== filter.type) return false;
          
          // Apply rarity filter
          if (filter.rarity && gameItem.rarity !== filter.rarity) return false;
          
          // Apply price filters
          if (item.currency === "gold" && (item.price < filter.minPrice || item.price > filter.maxPrice)) return false;
          if (filter.currency && item.currency !== filter.currency) return false;
          
          // Apply equippable filter
          if (filter.showEquippableOnly && !gameItem.equippable) return false;
          
          // Apply stats filter
          if (filter.showWithStatsOnly && (!gameItem.stats || Object.keys(gameItem.stats).length === 0)) return false;
          
          // Apply stats filter checkboxes
          if (statsFilter.length > 0) {
            const hasMatchingStat = statsFilter.some(stat => 
              gameItem.stats && gameItem.stats[stat] !== undefined
            );
            if (!hasMatchingStat) return false;
          }
          
          return true;
        })
      : playerMarketItems.filter(item => {
          const gameItem = gameItems[item.id];
          if (!gameItem) return false;
          
          // Apply type filter
          if (filter.type && gameItem.type !== filter.type) return false;
          
          // Apply rarity filter
          if (filter.rarity && gameItem.rarity !== filter.rarity) return false;
          
          // Apply price filters
          if (item.currency === "gold" && (item.price < filter.minPrice || item.price > filter.maxPrice)) return false;
          if (filter.currency && item.currency !== filter.currency) return false;
          
          return true;
        });
    
    // Apply sorting
    return [...items].sort((a, b) => {
      const itemA = gameItems[a.id];
      const itemB = gameItems[b.id];
      
      if (!itemA || !itemB) return 0;
      
      switch (sortKey) {
        case "price":
          return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
        case "name":
          return sortOrder === "asc" 
            ? itemA.name.localeCompare(itemB.name) 
            : itemB.name.localeCompare(itemA.name);
        case "type":
          return sortOrder === "asc" 
            ? itemA.type.localeCompare(itemB.type) 
            : itemB.type.localeCompare(itemA.type);
        case "rarity":
          if (!itemA.rarity || !itemB.rarity) return 0;
          return sortOrder === "asc" 
            ? itemA.rarity.localeCompare(itemB.rarity) 
            : itemB.rarity.localeCompare(itemA.rarity);
        default:
          return 0;
      }
    });
  }, [selectedTab, npcItems, playerMarketItems, filter, sortKey, sortOrder, statsFilter]);

  // Enhanced renderFilterControls function with more filtering options
  const renderFilterControls = () => (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
      <h3 className="text-lg font-medium">Filters</h3>
      
      {/* Type filter */}
      <div>
        <label className="text-sm font-medium">Item Type</label>
        <Select value={filter.type || "all"} onValueChange={(value) => setFilter({...filter, type: value === "all" ? "" : value})}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="weapon">Weapons</SelectItem>
            <SelectItem value="armor">Armor</SelectItem>
            <SelectItem value="accessory">Accessories</SelectItem>
            <SelectItem value="potion">Potions</SelectItem>
            <SelectItem value="ingredient">Ingredients</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Rarity filter */}
      <div>
        <label className="text-sm font-medium">Rarity</label>
        <Select value={filter.rarity || "all"} onValueChange={(value) => setFilter({...filter, rarity: value === "all" ? "" : value})}>
          <SelectTrigger>
            <SelectValue placeholder="All Rarities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rarities</SelectItem>
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="uncommon">Uncommon</SelectItem>
            <SelectItem value="rare">Rare</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Price range filter with dual thumb slider */}
      <div>
        <label className="text-sm font-medium">Price Range</label>
        <div className="pt-4 pb-2">
          <Slider 
            defaultValue={[0, 1000]} 
            max={1000} 
            step={10}
            onValueChange={(values) => {
              setPriceRange(values as [number, number]);
              setFilter({...filter, minPrice: values[0], maxPrice: values[1]});
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{priceRange[0]} {filter.currency || "Gold"}</span>
            <span>{priceRange[1]} {filter.currency || "Gold"}</span>
          </div>
        </div>
      </div>
      
      {/* Stats filter checkboxes */}
      <div>
        <label className="text-sm font-medium mb-2 block">Stats</label>
        <div className="grid grid-cols-2 gap-2">
          {["Attack", "Defense", "Magic Power", "Magic Defense", "Speed", "Health", "Mana"].map(stat => (
            <label key={stat} className="flex items-center space-x-2 text-sm">
              <input 
                type="checkbox" 
                checked={statsFilter.includes(stat)} 
                onChange={(e) => {
                  if (e.target.checked) {
                    setStatsFilter([...statsFilter, stat]);
                  } else {
                    setStatsFilter(statsFilter.filter(s => s !== stat));
                  }
                }}
                className="rounded border-gray-700 bg-gray-800 text-amber-500"
              />
              <span>{stat}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Currency filter */}
      <div>
        <label className="text-sm font-medium">Currency</label>
        <Select value={filter.currency || "all"} onValueChange={(value) => setFilter({...filter, currency: value === "all" ? "" : value})}>
          <SelectTrigger>
            <SelectValue placeholder="All Currencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="gems">Gems</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Clear filters button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          setFilter({
            type: "",
            rarity: "",
            currency: "",
            minPrice: 0,
            maxPrice: 1000,
            showEquippableOnly: false,
            showWithStatsOnly: false,
            stats: {
              attack: [0, 100],
              defense: [0, 100],
              magicPower: [0, 100],
              magicDefense: [0, 100],
              health: [0, 100],
              mana: [0, 100],
              speed: [0, 100]
            }
          });
          setStatsFilter([]);
          setPriceRange([0, 1000]);
        }}
        className="w-full mt-2"
      >
        Clear Filters
      </Button>
    </div>
  );

  // Render item card
  const renderItemCard = (
    itemId: string, 
    price: number, 
    currency: "gold" | "gems", 
    stock: number, 
    action: "buy" | "sell" | "list"
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
    
    return (
      <div className="relative group">
        <Card className="game-card hover:border-gray-700 transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium text-amber-400">{item.name}</CardTitle>
              <Badge variant={currency === "gems" ? "secondary" : "default"} className="ml-2">
                {price} {currency === "gems" ? "Gems" : "Gold"}
              </Badge>
            </div>
            <CardDescription className="text-gray-400 text-sm mt-1">
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              {item.subType && ` - ${item.subType.charAt(0).toUpperCase() + item.subType.slice(1)}`}
              {item.rarity && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-sm text-gray-300">{item.description}</p>
            
            {item.stats && Object.keys(item.stats).length > 0 && (
              <div className="mt-2 space-y-1">
                {Object.entries(item.stats).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between text-xs">
                    <span>{stat}</span>
                    <span className={value > 0 ? "text-green-400" : "text-red-400"}>
                      {value > 0 ? `+${value}` : value}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {item.specialAbility && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">Special</Badge>
                <p className="text-xs text-blue-400 mt-1">{item.specialAbility}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            {action === "buy" && (
              <Button 
                variant="default" 
                size="sm" 
                className="w-full game-button"
                onClick={() => handleBuyItem(itemId, price, currency)}
                disabled={
                  (currency === "gold" && character.gold < price) || 
                  (currency === "gems" && character.gems < price) ||
                  stock <= 0
                }
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy {stock > 0 ? `(${stock} left)` : "(Out of stock)"}
              </Button>
            )}
            
            {action === "sell" && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full game-button"
                onClick={() => handleSellItem(itemId)}
              >
                <Coins className="w-4 h-4 mr-2" />
                Sell for {Math.floor(price * 0.5)} Gold
              </Button>
            )}
            
            {action === "list" && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full game-button"
                onClick={() => handleOpenListingDialog(itemId)}
              >
                <Package className="w-4 h-4 mr-2" />
                List on Market
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Stat comparison overlay */}
        {item.equippable && comparisonItem && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center text-sm text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
            <h4 className="text-amber-400 font-medium mb-2">Stat Comparison</h4>
            {Object.entries(item.stats || {}).map(([stat, value]) => {
              const equippedValue = comparisonItem?.stats?.[stat] || 0;
              const diff = value - equippedValue;
              const colorClass = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400';
              return (
                <div key={stat} className="flex justify-between w-full">
                  <span>{stat}:</span>
                  <span className={colorClass}>
                    {equippedValue} → {value} ({diff > 0 ? `+${diff}` : diff})
                  </span>
                </div>
              );
            })}
            
            {/* Show stats that only exist in the equipped item */}
            {comparisonItem?.stats && Object.entries(comparisonItem.stats).map(([stat, value]) => {
              if (item.stats && stat in item.stats) return null; // Skip if already shown above
              return (
                <div key={stat} className="flex justify-between w-full">
                  <span>{stat}:</span>
                  <span className="text-red-400">
                    {value} → 0 (-{value})
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* NPC Avatar with Dialogue */}
      {selectedTab === "npc" && (
        <div className="absolute -left-32 top-20 w-28 h-28 z-10">
          <div className="relative">
            <img 
              src={npcAvatar.image} 
              alt={npcAvatar.name} 
              className="w-full h-full rounded-full border-4 border-amber-500"
            />
            {showNpcDialog && (
              <div className="absolute -right-4 top-0 transform translate-x-full bg-gray-900 border border-amber-500 p-3 rounded-lg w-64 shadow-lg">
                <p className="text-amber-400 font-medium mb-1">{npcAvatar.name}</p>
                <p className="text-sm text-gray-300">{currentNpcDialog}</p>
                <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-amber-500"></div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-6 bg-gray-950 rounded-lg border border-gray-800 shadow-xl">
        <h2 className="text-2xl font-bold text-amber-400 mb-2">Merchant's Wares</h2>
        <p className="text-gray-400 mb-6">Buy items from the merchant or sell your items for gold and gems</p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <Badge variant="outline" className="px-3 py-1 text-amber-400 border-amber-400">
              <Coins className="mr-2 h-4 w-4" />
              {character.gold} Gold
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-purple-400 border-purple-400">
              <Diamond className="mr-2 h-4 w-4" />
              {character.gems} Gems
            </Badge>
          </div>
        </div>
        
        <Tabs defaultValue="npc" className="w-full" onValueChange={(value) => setSelectedTab(value as "npc" | "player")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="npc" className="text-base">NPC Shop</TabsTrigger>
            <TabsTrigger value="player" className="text-base">Player Market</TabsTrigger>
          </TabsList>
          
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm">
              <Button
                variant="ghost"
                className={`rounded-l-md rounded-r-none px-6 py-2 ${buyButtonClass}`}
                onClick={() => setSelectedAction("buy")}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Buy
              </Button>
              <Button
                variant="ghost"
                className={`rounded-r-md rounded-l-none px-6 py-2 ${sellButtonClass}`}
                onClick={() => setSelectedAction("sell")}
              >
                <Coins className="mr-2 h-5 w-5" />
                {selectedTab === "player" ? "List" : "Sell"}
              </Button>
            </div>
          </div>
          
          {renderFilterControls()}
          
          <TabsContent value="npc" className="mt-0">
            {selectedAction === "buy" ? (
              <div className="space-y-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map(item => (
                      <div key={item.id}>
                        {renderItemCard(
                          item.id, 
                          item.price, 
                          item.currency, 
                          'stock' in item ? item.stock : 1, 
                          "buy"
                        )}
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="col-span-2 text-center py-10 text-gray-500">
                        No items match your filter criteria
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
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
                          currency = shopItem.currency;
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
                            {renderItemCard(item.id, sellPrice, currency, item.quantity, "sell")}
                            <Badge className="absolute top-2 right-2 bg-gray-800">{item.quantity}x</Badge>
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
            )}
          </TabsContent>
          
          <TabsContent value="player" className="mt-0">
            {selectedAction === "buy" ? (
              <div className="space-y-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {playerMarketItems.length > 0 ? (
                      playerMarketItems.map(item => (
                        <div key={`${item.id}-${item.seller}`}>
                          {renderItemCard(item.id, item.price, item.currency, 1, "buy")}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-10 text-gray-500">
                        No items are currently listed on the player market
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="space-y-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory
                      .filter(item => item.quantity > 0)
                      .map(item => (
                        <div key={item.id} className="relative">
                          {renderItemCard(item.id, 0, "gold", item.quantity, "list")}
                          <Badge className="absolute top-2 right-2 bg-gray-800">{item.quantity}x</Badge>
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
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Listing Dialog */}
      <Dialog open={showListingDialog} onOpenChange={setShowListingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List Item for Sale</DialogTitle>
            <DialogDescription>
              Set a price for your {itemToList ? gameItems[itemToList]?.name : "item"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                value={listingGoldPrice}
                onChange={(e) => setListingGoldPrice(parseInt(e.target.value) || 0)}
                placeholder="Gold Price"
              />
              <Badge>Gold</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                value={listingGemsPrice}
                onChange={(e) => setListingGemsPrice(parseInt(e.target.value) || 0)}
                placeholder="Gems Price"
              />
              <Badge variant="secondary">Gems</Badge>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowListingDialog(false)}>Cancel</Button>
            <Button onClick={handleListItem}>List Item</Button>
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