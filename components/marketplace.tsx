"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Item } from "@/components/item-slot";
import { CharacterStats } from "@/components/character-sheet";
import { gameItems } from "@/lib/items";
import { Coins, Diamond, ShoppingBag, ShoppingCart, Store, User } from "lucide-react";

interface MarketplaceProps {
  character: CharacterStats;
  inventory: Array<{ id: string; quantity: number }>;
  onUpdateCharacter: (character: CharacterStats) => void;
  onUpdateInventory: (inventory: Array<{ id: string; quantity: number }>) => void;
}

// NPC shop items
const npcShopItems = [
  // Basic weapons
  { id: "wooden_sword", price: 50, currency: "gold" as const, stock: 5 },
  { id: "iron_sword", price: 150, currency: "gold" as const, stock: 3 },
  { id: "steel_sword", price: 300, currency: "gold" as const, stock: 2 },
  
  // Basic armor
  { id: "leather_armor", price: 80, currency: "gold" as const, stock: 5 },
  { id: "iron_armor", price: 200, currency: "gold" as const, stock: 3 },
  { id: "steel_armor", price: 400, currency: "gold" as const, stock: 2 },
  
  // Consumables
  { id: "health_potion", price: 30, currency: "gold" as const, stock: 10 },
  { id: "magic_potion", price: 40, currency: "gold" as const, stock: 10 },
  
  // Materials
  { id: "wood", price: 10, currency: "gold" as const, stock: 20 },
  { id: "stone", price: 15, currency: "gold" as const, stock: 20 },
  { id: "iron", price: 25, currency: "gold" as const, stock: 15 },
  { id: "leather", price: 20, currency: "gold" as const, stock: 15 },
  
  // Premium items (for gems)
  { id: "enchanted_sword", price: 5, currency: "gems" as const, stock: 1 },
  { id: "magic_staff", price: 8, currency: "gems" as const, stock: 1 },
  { id: "dragon_scale", price: 3, currency: "gems" as const, stock: 3 },
  { id: "ancient_rune", price: 4, currency: "gems" as const, stock: 2 },
];

export default function Marketplace({ 
  character, 
  inventory, 
  onUpdateCharacter, 
  onUpdateInventory 
}: MarketplaceProps) {
  const [npcItems, setNpcItems] = useState(npcShopItems);
  const [selectedTab, setSelectedTab] = useState<"npc" | "player">("npc");
  const [notifications, setNotifications] = useState<Array<{ message: string; type: "success" | "error" }>>([]);

  // Add a notification
  const addNotification = (message: string, type: "success" | "error") => {
    const newNotification = { message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== newNotification));
    }, 3000);
  };

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
    const updatedNpcItems = [...npcItems];
    const itemIndex = updatedNpcItems.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1 || updatedNpcItems[itemIndex].stock <= 0) {
      addNotification("Item out of stock!", "error");
      return;
    }
    
    updatedNpcItems[itemIndex].stock -= 1;
    setNpcItems(updatedNpcItems);
    
    // Update player currency
    const updatedCharacter = { ...character };
    if (currency === "gold") {
      updatedCharacter.gold -= price;
    } else {
      updatedCharacter.gems -= price;
    }
    
    // Add item to inventory
    const updatedInventory = [...inventory];
    const existingItemIndex = updatedInventory.findIndex(item => item.id === itemId);
    
    if (existingItemIndex >= 0) {
      updatedInventory[existingItemIndex].quantity += 1;
    } else {
      updatedInventory.push({ id: itemId, quantity: 1 });
    }
    
    // Update state
    onUpdateCharacter(updatedCharacter);
    onUpdateInventory(updatedInventory);
    
    addNotification(`Purchased ${gameItems[itemId]?.name || itemId}!`, "success");
  };

  // Sell an item to NPC
  const handleSellItem = (itemId: string) => {
    // Find item in inventory
    const updatedInventory = [...inventory];
    const itemIndex = updatedInventory.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1 || updatedInventory[itemIndex].quantity <= 0) {
      addNotification("Item not in inventory!", "error");
      return;
    }
    
    // Calculate sell price (half of buy price)
    const npcItem = npcItems.find(item => item.id === itemId);
    let sellPrice = 0;
    let currency: "gold" | "gems" = "gold";
    
    if (npcItem) {
      sellPrice = Math.floor(npcItem.price / 2);
      currency = npcItem.currency;
    } else {
      // Default sell price for items not in NPC shop
      sellPrice = 5;
    }
    
    // Update inventory
    updatedInventory[itemIndex].quantity -= 1;
    if (updatedInventory[itemIndex].quantity <= 0) {
      updatedInventory.splice(itemIndex, 1);
    }
    
    // Update player currency
    const updatedCharacter = { ...character };
    if (currency === "gold") {
      updatedCharacter.gold += sellPrice;
    } else {
      updatedCharacter.gems += sellPrice;
    }
    
    // Update NPC stock if item exists in shop
    if (npcItem) {
      const updatedNpcItems = [...npcItems];
      const npcItemIndex = updatedNpcItems.findIndex(item => item.id === itemId);
      updatedNpcItems[npcItemIndex].stock += 1;
      setNpcItems(updatedNpcItems);
    }
    
    // Update state
    onUpdateCharacter(updatedCharacter);
    onUpdateInventory(updatedInventory);
    
    addNotification(`Sold ${gameItems[itemId]?.name || itemId} for ${sellPrice} ${currency}!`, "success");
  };

  // Render item card
  const renderItemCard = (
    itemId: string, 
    price: number, 
    currency: "gold" | "gems", 
    stock: number, 
    action: "buy" | "sell"
  ) => {
    const item = gameItems[itemId];
    if (!item) return null;
    
    return (
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
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-800 rounded-md flex items-center justify-center border border-gray-700">
              <img src={item.image} alt={item.name} className="max-w-full max-h-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300 line-clamp-2">{item.description}</p>
              {action === "buy" && (
                <p className="text-sm text-gray-400 mt-1">Stock: {stock}</p>
              )}
              {action === "sell" && (
                <p className="text-sm text-gray-400 mt-1">
                  Quantity: {inventory.find(i => i.id === itemId)?.quantity || 0}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant={action === "buy" ? "default" : "secondary"} 
            size="sm" 
            className={action === "buy" ? "w-full game-button-primary" : "w-full game-button-secondary"}
            onClick={() => action === "buy" 
              ? handleBuyItem(itemId, price, currency) 
              : handleSellItem(itemId)
            }
            disabled={
              (action === "buy" && stock <= 0) || 
              (action === "buy" && currency === "gold" && character.gold < price) ||
              (action === "buy" && currency === "gems" && character.gems < price) ||
              (action === "sell" && (inventory.find(i => i.id === itemId)?.quantity || 0) <= 0)
            }
          >
            {action === "buy" ? (
              <ShoppingCart className="mr-2 h-4 w-4" />
            ) : (
              <Coins className="mr-2 h-4 w-4" />
            )}
            {action === "buy" ? "Buy" : "Sell"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-400">Marketplace</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-800 px-3 py-1 rounded-md">
            <Coins className="h-5 w-5 text-amber-400 mr-2" />
            <span className="text-amber-400 font-medium">{character.gold}</span>
          </div>
          <div className="flex items-center bg-gray-800 px-3 py-1 rounded-md">
            <Diamond className="h-5 w-5 text-cyan-400 mr-2" />
            <span className="text-cyan-400 font-medium">{character.gems}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="npc" onValueChange={(value) => setSelectedTab(value as "npc" | "player")}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
          <TabsTrigger value="npc" className="data-[state=active]:bg-gray-700 data-[state=active]:text-amber-400">
            <Store className="mr-2 h-4 w-4" />
            NPC Shop
          </TabsTrigger>
          <TabsTrigger value="player" className="data-[state=active]:bg-gray-700 data-[state=active]:text-amber-400">
            <User className="mr-2 h-4 w-4" />
            Player Market
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="npc" className="mt-4">
          <Card className="game-card">
            <CardHeader className="game-card-header">
              <CardTitle className="text-xl text-amber-400">Merchant's Wares</CardTitle>
              <CardDescription className="text-gray-400">
                Buy items from the merchant or sell your items for gold and gems
              </CardDescription>
            </CardHeader>
            <CardContent className="game-card-content">
              <Tabs defaultValue="buy">
                <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-700">
                  <TabsTrigger value="buy" className="game-tab">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="game-tab">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Sell
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="buy" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-amber-400 mb-2">Gold Items</h3>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {npcItems
                            .filter(item => item.currency === "gold")
                            .map(item => (
                              <div key={item.id}>
                                {renderItemCard(item.id, item.price, item.currency, item.stock, "buy")}
                              </div>
                            ))
                          }
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-amber-400 mb-2">Premium Items (Gems)</h3>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {npcItems
                            .filter(item => item.currency === "gems")
                            .map(item => (
                              <div key={item.id}>
                                {renderItemCard(item.id, item.price, item.currency, item.stock, "buy")}
                              </div>
                            ))
                          }
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="sell" className="mt-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inventory.map(item => {
                        const npcItem = npcItems.find(npcItem => npcItem.id === item.id);
                        const sellPrice = npcItem ? Math.floor(npcItem.price / 2) : 5;
                        const currency = npcItem?.currency || "gold";
                        
                        return (
                          <div key={item.id}>
                            {renderItemCard(item.id, sellPrice, currency, 0, "sell")}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="player" className="mt-4">
          <Card className="game-card">
            <CardHeader className="game-card-header">
              <CardTitle className="text-xl text-amber-400">Player Market</CardTitle>
              <CardDescription className="text-gray-400">
                Coming soon! Trade with other players
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-16 w-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-center">
                The player marketplace is under construction.<br />
                Check back soon for player-to-player trading!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map((notification, index) => (
          <div 
            key={index}
            className={`px-4 py-2 rounded-md shadow-lg transition-all transform animate-in slide-in-from-right-5 ${
              notification.type === "success" ? "bg-green-800 text-green-100 border border-green-700" : "bg-red-800 text-red-100 border border-red-700"
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
} 