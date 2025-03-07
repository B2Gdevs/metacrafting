"use client";

import { CharacterStats } from "@/components/character-sheet";
import { Item } from "@/components/item-slot";
import FilterControls from "@/components/marketplace/filter-controls";
import ItemCard from "@/components/marketplace/item-card";
import ListingDialog from "@/components/marketplace/listing-dialog";
import NotificationSystem from "@/components/marketplace/notification-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketplace } from "@/hooks/use-marketplace";
import { gameItems } from "@/lib/items";
import {
  CurrencyType,
  MarketplaceItem
} from "@/lib/marketplace-types";
import {
  formatStatName,
  getFilterContainerClass,
  getMarketplaceContainerClass,
  getMarketplaceIconClass,
  getMarketplaceTabClass,
  getMarketplaceTextClass
} from "@/lib/marketplace-utils";
import { ChevronDown, ChevronUp, Coins, Diamond, Filter, Package, Search, Store, Users, X } from "lucide-react";
import { useState } from "react";

interface MarketplaceProps {
  character: CharacterStats;
  inventory: Array<{ id: string; quantity: number }>;
  onUpdateCharacter: (character: CharacterStats) => void;
  onUpdateInventory: (inventory: Array<{ id: string; quantity: number }>) => void;
}

export default function Marketplace({ 
  character, 
  inventory, 
  onUpdateCharacter, 
  onUpdateInventory
}: MarketplaceProps) {
  const { 
    // State
    npcItems,
    playerMarketItems,
    selectedTab,
    selectedAction,
    notifications,
    draftListing,
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
  } = useMarketplace({
    character,
    inventory,
    gameItems,
    onUpdateCharacter,
    onUpdateInventory
  });

  // State for the equipment comparison overlay
  const [overlayData, setOverlayData] = useState<{
    visible: boolean;
    item: Item | null;
    top: number;
  }>({
    visible: false,
    item: null,
    top: 0
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  const showComparisonOverlay = (itemId: string, top: number) => {
    // Only show comparison for equippable items
    const item = gameItems[itemId];
    if (!item || !item.equippable || !item.slot) return;
    
    // Show comparison regardless of whether there's an item equipped or not
    setOverlayData({
      visible: true,
      item,
      top
    });
  };
  
  const hideComparisonOverlay = () => {
    setOverlayData(prev => ({ ...prev, visible: false }));
  };
  
  const getStatComparison = (stat: string, value: number, equippedItem: Item | null) => {
    if (!equippedItem || !equippedItem.stats) return { value, diff: 0 };
    
    const currentValue = equippedItem.stats[stat] || 0;
    const diff = value - currentValue;
    
    return { value, diff };
  };
  
  const getInventoryQuantity = (itemId: string | null): number => {
    if (!itemId) return 0;
    
    const inventoryItem = inventory.find(item => item.id === itemId);
    return inventoryItem ? inventoryItem.quantity : 0;
  };
  
  return (
    <div className="container mx-auto p-4">
      {/* Notifications */}
      <NotificationSystem notifications={notifications} />
      
      {/* Fixed position comparison overlay */}
      {overlayData.visible && overlayData.item && (
        <div 
          className="fixed right-4 z-40 bg-gray-900/95 border border-gray-700 rounded-lg shadow-xl p-4 w-64"
          style={{ top: `${overlayData.top}px` }}
        >
          <h3 className="text-lg font-bold mb-2">Stat Comparison</h3>
          
          {(() => {
            const newItem = overlayData.item;
            if (!newItem || !newItem.slot) return null;
            
            let equippedItemId: string | undefined;
            
            // Handle rings specially since they're stored as an array
            if (newItem.slot === 'rings') {
              const ringsArray = character.equipment.rings;
              equippedItemId = ringsArray && ringsArray.length > 0 ? ringsArray[0] : undefined;
            } else {
              equippedItemId = character.equipment[newItem.slot as keyof typeof character.equipment] as string | undefined;
            }
            
            const equippedItem = equippedItemId ? gameItems[equippedItemId] : null;
            
            return (
              <>
                <div className="mb-2">
                  <span className="text-sm text-gray-400">Currently equipped:</span>
                  <p className="font-medium">{equippedItem ? equippedItem.name : 'Nothing'}</p>
                </div>
                
                <div className="space-y-1">
                  {newItem.stats && Object.entries(newItem.stats).map(([stat, value]) => {
                    const { diff } = getStatComparison(stat, value, equippedItem);
                    return (
                      <div key={stat} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{formatStatName(stat)}</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{value}</span>
                          {diff !== 0 && (
                            <span className={`ml-1 text-xs ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({diff > 0 ? '+' : ''}{diff})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}
      
      {/* Marketplace Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-700/30">
            <Coins className="h-5 w-5 mr-2 text-amber-500" />
            <span className="text-amber-400 font-bold">{character.gold} Gold</span>
          </div>
          <div className="flex items-center bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-700/30">
            <Diamond className="h-5 w-5 mr-2 text-blue-500" />
            <span className="text-blue-400 font-bold">{character.gems} Gems</span>
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          Filters
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Filter Panel */}
      {showFilters && (
        <div className={`mb-6 p-4 border rounded-lg ${getFilterContainerClass(selectedTab)}`}>
          <FilterControls 
            filterState={filterState}
            updateFilterState={updateFilterState}
            resetFilters={resetFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      )}
      
      {/* Marketplace Tabs */}
      <Tabs 
        defaultValue="npc" 
        value={selectedTab} 
        onValueChange={setSelectedTab as (value: string) => void}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger 
            value="npc" 
            className={getMarketplaceTabClass("npc", selectedTab === "npc")}
          >
            <Store className={`mr-2 h-4 w-4 ${getMarketplaceIconClass("npc")}`} />
            <span className={getMarketplaceTextClass("npc")}>NPC Shop</span>
          </TabsTrigger>
          <TabsTrigger 
            value="player" 
            className={getMarketplaceTabClass("player", selectedTab === "player")}
          >
            <Users className={`mr-2 h-4 w-4 ${getMarketplaceIconClass("player")}`} />
            <span className={getMarketplaceTextClass("player")}>Player Market</span>
          </TabsTrigger>
        </TabsList>
        
        <div className={`p-4 rounded-lg ${getMarketplaceContainerClass(selectedTab)}`}>
          <TabsContent value="npc" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNpcItems.map(item => {
                return (
                  <ItemCard
                    key={item.id}
                    item={item}
                    action="buy"
                    gameItems={gameItems}
                    playerGold={character.gold}
                    playerGems={character.gems}
                    onAction={() => handleBuyItem(
                      item.id, 
                      item.currencies, 
                      item.requireAllCurrencies
                    )}
                    character={character}
                    onShowOverlay={(top) => showComparisonOverlay(item.id, top)}
                    onHideOverlay={hideComparisonOverlay}
                  />
                );
              })}
              {filteredNpcItems.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No items match your filters</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="player" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-md ${selectedAction === 'buy' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                  onClick={() => setSelectedAction('buy')}
                >
                  Buy
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${selectedAction === 'sell' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                  onClick={() => setSelectedAction('sell')}
                >
                  Sell
                </button>
              </div>
            </div>
            
            {selectedAction === 'buy' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayerItems.map(item => {
                  return (
                    <ItemCard
                      key={`${item.id}-${item.seller}`}
                      item={item}
                      action="buy"
                      gameItems={gameItems}
                      playerGold={character.gold}
                      playerGems={character.gems}
                      onAction={() => handleBuyItem(
                        item.id, 
                        item.currencies, 
                        item.requireAllCurrencies, 
                        item.seller
                      )}
                      character={character}
                      onShowOverlay={(top) => showComparisonOverlay(item.id, top)}
                      onHideOverlay={hideComparisonOverlay}
                    />
                  );
                })}
                {filteredPlayerItems.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No player listings match your filters</p>
                  </div>
                )}
              </div>
            )}
            
            {selectedAction === 'sell' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventoryWithPrices.map(item => {
                  const gameItem = gameItems[item.id];
                  if (!gameItem) return null;
                  
                  // Create a MarketplaceItem for the ItemCard
                  const marketItem: MarketplaceItem = {
                    id: item.id,
                    currencies: {
                      [CurrencyType.GOLD]: item.price,
                      [CurrencyType.GEMS]: 0
                    },
                    requireAllCurrencies: false,
                    quantity: item.quantity,
                    originalItem: gameItem
                  };
                  
                  return (
                    <div key={item.id} className="border rounded-lg p-4 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">{gameItem.name}</h3>
                        <Badge variant="outline">{item.quantity}x</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{gameItem.description}</p>
                      <div className="mt-auto flex justify-between items-center">
                        <div className="flex items-center">
                          <Coins className="h-4 w-4 mr-1 text-amber-500" />
                          <span className="text-amber-400">{item.price} Gold</span>
                        </div>
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenListingDialog(item.id)}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            List
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleSellItem(item.id)}
                          >
                            <Coins className="h-4 w-4 mr-1" />
                            Sell
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {inventoryWithPrices.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No items in inventory to sell</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Listing Dialog */}
      <ListingDialog
        open={!!draftListing}
        onClose={clearDraftListing}
        draftListing={draftListing}
        gameItems={gameItems}
        inventoryQuantity={draftListing ? getInventoryQuantity(draftListing.id) : 0}
        updateDraftListing={updateDraftListing}
        onListItem={handleListItem}
      />
    </div>
  );
} 