"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterStats } from "@/components/character-sheet";
import { useMarketplace } from "@/hooks/use-marketplace";
import FilterControls from "@/components/marketplace/filter-controls";
import ItemCard from "@/components/marketplace/item-card";
import ListingDialog from "@/components/marketplace/listing-dialog";
import NotificationSystem from "@/components/marketplace/notification-system";
import { calculateSellPrice, formatStatName, getRarityTextClass } from "@/lib/marketplace-utils";
import { gameItems } from "@/lib/items";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Item } from "@/components/item-slot";

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
  } = useMarketplace({
    character,
    inventory,
    gameItems,
    onUpdateCharacter,
    onUpdateInventory
  });

  // Debug: Log NPC items to see if dual currency is present
  useEffect(() => {
    console.log("filteredNpcItems:", filteredNpcItems);
  }, [filteredNpcItems]);

  // Debug: Log player items to see if dual currency is present
  useEffect(() => {
    console.log("filteredPlayerItems:", filteredPlayerItems);
  }, [filteredPlayerItems]);

  // State for the equipment comparison overlay
  const [overlayData, setOverlayData] = useState<{
    visible: boolean;
    item: Item | null;
    equippedItem: Item | null;
    equippedRings: Item[];
    top: number;
  }>({
    visible: false,
    item: null,
    equippedItem: null,
    equippedRings: [],
    top: 0
  });

  // Function to show comparison overlay
  const showComparisonOverlay = (itemId: string, top: number) => {
    const item = gameItems[itemId];
    if (!item || !item.equippable || !character) return;
    
    let equippedItem: Item | null = null;
    let equippedRings: Item[] = [];
    
    if (item.slot === "rings") {
      // For rings, get all equipped rings
      const ringIds = character.equipment.rings || [];
      if (Array.isArray(ringIds) && ringIds.length > 0) {
        equippedRings = ringIds
          .map(id => typeof id === 'string' ? gameItems[id] : null)
          .filter(Boolean) as Item[];
        
        // Use the first ring for comparison
        if (equippedRings.length > 0) {
          equippedItem = equippedRings[0];
        }
      }
    } else if (item.slot) {
      const equippedItemId = character.equipment[item.slot];
      if (equippedItemId && typeof equippedItemId === 'string') {
        equippedItem = gameItems[equippedItemId];
      }
    }
    
    setOverlayData({
      visible: true,
      item,
      equippedItem,
      equippedRings,
      top
    });
  };

  // Function to hide comparison overlay
  const hideComparisonOverlay = () => {
    setOverlayData(prev => ({ ...prev, visible: false }));
  };

  // Compare stats with equipped item
  const getStatComparison = (stat: string, value: number, equippedItem: Item | null) => {
    if (!equippedItem || !equippedItem.stats) {
      return { difference: value, isPositive: value > 0 };
    }
    
    const equippedValue = equippedItem.stats[stat] || 0;
    const difference = value - equippedValue;
    
    if (difference === 0) return null;
    
    return {
      difference,
      isPositive: difference > 0
    };
  };

  // Get inventory quantity for the item being listed
  const getInventoryQuantity = (itemId: string | null): number => {
    if (!itemId) return 0;
    const item = inventory.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  // Check if we can equip more rings
  const canEquipMoreRings = 
    overlayData.item?.slot === "rings" && 
    Array.isArray(character.equipment.rings) && 
    character.equipment.rings.length < 10;

  return (
    <div className="relative">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <span className="font-semibold">Gold:</span>
            <span>{character.gold}</span>
          </div>
          <div className="flex space-x-2">
            <span className="font-semibold">Gems:</span>
            <span>{character.gems}</span>
          </div>
        </div>
        
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "npc" | "player")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="npc">NPC Shop</TabsTrigger>
            <TabsTrigger value="player">Player Market</TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <FilterControls
                filterState={filterState}
                updateFilterState={updateFilterState}
                resetFilters={resetFilters}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
            
            <div className="md:col-span-3">
              <TabsContent value="npc" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNpcItems.map(item => {
                    console.log("Rendering NPC item:", item);
                    return (
                      <ItemCard
                        key={item.id}
                        itemId={item.id}
                        price={item.price}
                        currency={item.currency}
                        stock={item.stock}
                        action="buy"
                        gameItems={gameItems}
                        playerGold={character.gold}
                        playerGems={character.gems}
                        onAction={() => handleBuyItem(item.id, item.price, item.currency, item.dualCurrency, item.requireBothCurrencies)}
                        dualCurrency={item.dualCurrency}
                        requireBothCurrencies={item.requireBothCurrencies}
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
                      console.log("Rendering player item:", item);
                      return (
                        <ItemCard
                          key={`${item.id}-${item.seller}`}
                          itemId={item.id}
                          price={item.price}
                          currency={item.currency}
                          stock={item.quantity}
                          action="buy"
                          gameItems={gameItems}
                          playerGold={character.gold}
                          playerGems={character.gems}
                          onAction={() => handleBuyItem(item.id, item.price, item.currency, item.dualCurrency, item.requireBothCurrencies, item.seller)}
                          dualCurrency={item.dualCurrency}
                          requireBothCurrencies={item.requireBothCurrencies}
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
                    {inventoryWithPrices.map(item => (
                      <ItemCard
                        key={item.id}
                        itemId={item.id}
                        price={calculateSellPrice(gameItems[item.id])}
                        currency="gold"
                        stock={item.quantity}
                        action="list"
                        gameItems={gameItems}
                        playerGold={character.gold}
                        playerGems={character.gems}
                        onAction={() => handleOpenListingDialog(item.id)}
                        character={character}
                        onShowOverlay={(top) => showComparisonOverlay(item.id, top)}
                        onHideOverlay={hideComparisonOverlay}
                      />
                    ))}
                    {inventoryWithPrices.length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">Your inventory is empty</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
        
        {/* Listing Dialog */}
        <ListingDialog
          open={!!itemToList}
          onClose={() => setItemToList(null)}
          itemId={itemToList}
          gameItems={gameItems}
          inventoryQuantity={getInventoryQuantity(itemToList)}
          listingPrice={listingPrice}
          setListingPrice={setListingPrice}
          listingCurrency={listingCurrency}
          setListingCurrency={setListingCurrency}
          listingQuantity={listingQuantity}
          setListingQuantity={setListingQuantity}
          useDualCurrency={useDualCurrency}
          setUseDualCurrency={setUseDualCurrency}
          dualCurrencyValues={dualCurrencyValues}
          setDualCurrencyValues={setDualCurrencyValues}
          requireBothCurrencies={requireBothCurrencies}
          setRequireBothCurrencies={setRequireBothCurrencies}
          onListItem={handleListItem}
        />
        
        {/* Notifications */}
        <NotificationSystem notifications={notifications} />
      </div>
      
      {/* Fixed position comparison overlay */}
      {overlayData.visible && overlayData.item && (
        <div 
          className="fixed right-4 z-50 w-72 bg-gray-900/95 border border-gray-700 rounded-lg p-4 shadow-xl"
          style={{ top: `${overlayData.top}px` }}
        >
          <div className="text-sm font-semibold mb-2 border-b border-gray-700 pb-1">
            Equipment Comparison
          </div>
          
          {overlayData.item.slot === "rings" ? (
            <>
              <div className="text-xs mb-2">
                {overlayData.equippedRings.length > 0 ? (
                  <>
                    <span className="text-gray-400">
                      Equipped Rings: {overlayData.equippedRings.length}/10
                    </span>
                    {canEquipMoreRings && (
                      <span className="text-green-400 block">Can equip this ring</span>
                    )}
                    <div className="mt-1 space-y-1">
                      {overlayData.equippedRings.slice(0, 3).map((ring, index) => (
                        <div key={index} className="flex items-center">
                          <span className={`text-xs ${getRarityTextClass(ring.rarity || 'common')}`}>
                            • {ring.name}
                          </span>
                        </div>
                      ))}
                      {overlayData.equippedRings.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{overlayData.equippedRings.length - 3} more rings
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <span className="text-green-400">No rings equipped</span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs mb-2">
                {overlayData.equippedItem ? (
                  <span className="text-gray-400">
                    Currently equipped: <span className={getRarityTextClass(overlayData.equippedItem.rarity || 'common')}>
                      {overlayData.equippedItem.name}
                    </span>
                  </span>
                ) : (
                  <span className="text-green-400">No item equipped in this slot</span>
                )}
              </div>
            </>
          )}
          
          {overlayData.item.stats && Object.keys(overlayData.item.stats).length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold mb-1">Stat Changes:</div>
              {Object.entries(overlayData.item.stats).map(([stat, value]) => {
                const comparison = getStatComparison(stat, value, overlayData.equippedItem);
                
                return (
                  <div key={stat} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{formatStatName(stat)}:</span>
                    <div className="flex items-center">
                      {!overlayData.equippedItem ? (
                        <span className={value > 0 ? "text-green-400" : "text-red-400"}>
                          {value > 0 ? "+" : ""}{value}
                        </span>
                      ) : (
                        <span className={`flex items-center ${comparison && comparison.isPositive ? 'text-green-400' : comparison && comparison.difference < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {comparison && comparison.isPositive ? (
                            <ArrowUp className="h-3 w-3 mr-0.5" />
                          ) : comparison && comparison.difference < 0 ? (
                            <ArrowDown className="h-3 w-3 mr-0.5" />
                          ) : null}
                          {comparison ? (comparison.difference !== 0 ? `${comparison.difference > 0 ? "+" : ""}${comparison.difference}` : "=") : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {overlayData.item.specialAbility && (
            <div className="mt-2 text-xs">
              <span className="text-purple-400 font-semibold">Special: {overlayData.item.specialAbility}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 