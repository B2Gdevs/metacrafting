"use client"

import { useState, useEffect } from "react";
import { Item } from "@/components/item-slot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  getRarityClass, 
  getRarityTextClass, 
  getRarityButtonClass,
  getItemTypeIcon
} from "@/lib/marketplace-utils";
import { Coins, Diamond, Package, AlertCircle, X, ArrowRight, Sparkles, Flame, Star, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { CurrencyType, CurrencyValues, PlayerMarketItem } from "@/lib/marketplace-types";
import { useMarketplaceStore } from "@/lib/marketplace-store";

interface ListingDialogProps {
  open: boolean;
  onClose: () => void;
  draftListing: PlayerMarketItem | null;
  gameItems: Record<string, Item>;
  inventoryQuantity: number;
  updateDraftListing: (updates: Partial<PlayerMarketItem>) => void;
  onListItem: () => void;
}

export default function ListingDialog({
  open,
  onClose,
  draftListing,
  gameItems,
  inventoryQuantity,
  updateDraftListing,
  onListItem
}: ListingDialogProps) {
  if (!draftListing) return null;
  
  const item = draftListing.originalItem || gameItems[draftListing.id];
  if (!item) return null;

  // Get the store
  const store = useMarketplaceStore();

  // Local state for validation
  const [error, setError] = useState<string | null>(null);
  const [goldPrice, setGoldPrice] = useState<number>(draftListing.currencies[CurrencyType.GOLD] || 0);
  const [gemsPrice, setGemsPrice] = useState<number>(draftListing.currencies[CurrencyType.GEMS] || 0);
  const [quantity, setQuantity] = useState<number>(draftListing.quantity);
  const [requireBothCurrencies, setRequireBothCurrencies] = useState<boolean>(draftListing.requireAllCurrencies);
  
  // Update local state when draft listing changes
  useEffect(() => {
    if (draftListing) {
      console.log("Draft listing updated in dialog:", draftListing);
      setGoldPrice(draftListing.currencies[CurrencyType.GOLD] || 0);
      setGemsPrice(draftListing.currencies[CurrencyType.GEMS] || 0);
      setQuantity(draftListing.quantity);
      setRequireBothCurrencies(draftListing.requireAllCurrencies);
    }
  }, [draftListing]);

  // Get rarity-specific styles
  const rarityTextClass = getRarityTextClass(item.rarity || 'common');
  const rarityButtonClass = getRarityButtonClass(item.rarity || 'common');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    
    // Check if at least one currency has a value
    if (goldPrice <= 0 && gemsPrice <= 0) {
      setError("You must set a price in either gold or gems");
      return;
    }
    
    // Build the currencies object with only positive values
    const currencies: Partial<CurrencyValues> = {};
    
    if (goldPrice > 0) {
      currencies[CurrencyType.GOLD] = goldPrice;
    }
    
    if (gemsPrice > 0) {
      currencies[CurrencyType.GEMS] = gemsPrice;
    }
    
    // Create a complete listing object with all the form values
    const completeListing: PlayerMarketItem = {
      id: draftListing.id,
      currencies: currencies,
      requireAllCurrencies: requireBothCurrencies,
      quantity: quantity,
      originalItem: draftListing.originalItem,
      seller: draftListing.seller
    };
    
    console.log("Complete listing to be added:", completeListing);
    
    // Store the complete listing in localStorage as a backup
    localStorage.setItem('completeListing', JSON.stringify(completeListing));
    
    // Update the draft listing in the store
    store.updateDraftListing({
      quantity,
      requireAllCurrencies: requireBothCurrencies,
      currencies
    });
    
    // Call onListItem directly
    onListItem();
    onClose();
  };
  
  // Get animation class based on rarity
  const getAnimationClass = () => {
    switch (item.rarity) {
      case "legendary":
        return "animate-pulse";
      case "mythic":
        return "animate-bounce";
      default:
        return "";
    }
  };

  // Get rarity-specific glow color
  const getGlowColor = () => {
    switch (item.rarity) {
      case "uncommon":
        return "rgba(74, 222, 128, 0.5)";
      case "rare":
        return "rgba(96, 165, 250, 0.5)";
      case "epic":
        return "rgba(192, 132, 252, 0.5)";
      case "legendary":
        return "rgba(251, 191, 36, 0.6)";
      case "mythic":
        return "rgba(239, 68, 68, 0.7)";
      default:
        return "rgba(156, 163, 175, 0.3)";
    }
  };

  // Get rarity-specific background style
  const getRarityBackgroundStyle = () => {
    switch (item.rarity) {
      case "uncommon":
        return "bg-gradient-to-br from-gray-900 via-gray-900 to-green-950/30";
      case "rare":
        return "bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950/30";
      case "epic":
        return "bg-gradient-to-br from-gray-900 via-gray-900 to-purple-950/30";
      case "legendary":
        return "bg-gradient-to-br from-gray-900 via-gray-900 to-amber-950/30";
      case "mythic":
        return "bg-gradient-to-br from-gray-900 via-gray-900 to-red-950/30";
      default:
        return "bg-gradient-to-br from-gray-900 to-gray-950";
    }
  };

  // Get rarity-specific button gradient
  const getButtonGradient = () => {
    switch (item.rarity) {
      case "uncommon":
        return "bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500";
      case "rare":
        return "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500";
      case "epic":
        return "bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500";
      case "legendary":
        return "bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500";
      case "mythic":
        return "bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500";
      default:
        return "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500";
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={`border-2 ${getRarityClass(item.rarity || 'common')} max-w-sm w-full ${getRarityBackgroundStyle()} backdrop-blur-lg relative overflow-hidden`}
        style={{
          boxShadow: `0 0 30px ${getGlowColor()}`,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Close button with custom styling */}
        <button 
          onClick={onClose} 
          className="absolute right-3 top-3 z-10 rounded-full bg-gray-800/80 p-1.5 backdrop-blur-sm transition-all hover:bg-gray-700/80 hover:rotate-90 duration-300"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br opacity-20 from-transparent via-transparent to-black"></div>
          
          {/* Particle effects for higher rarity items */}
          {(item.rarity === 'legendary' || item.rarity === 'mythic' || item.rarity === 'epic') && (
            <>
              {Array.from({ length: 15 }).map((_, i) => {
                const top = `${Math.random() * 100}%`;
                const left = `${Math.random() * 100}%`;
                const delay = `${Math.random() * 5}s`;
                const size = `${Math.random() * 2 + 1}px`;
                const duration = `${Math.random() * 10 + 10}s`;
                const color = item.rarity === 'legendary' ? 'bg-amber-400' : 
                              item.rarity === 'mythic' ? 'bg-red-400' : 'bg-purple-400';
                
                return (
                  <div 
                    key={i}
                    className={`absolute rounded-full ${color} opacity-0 animate-float-slow`}
                    style={{ 
                      top, 
                      left, 
                      width: size, 
                      height: size, 
                      animationDelay: delay,
                      animationDuration: duration
                    }}
                  />
                );
              })}
            </>
          )}

          {/* Animated border glow */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute inset-0 border-t border-l border-r border-b-0 rounded-t-lg border-white/10 animate-pulse"></div>
          </div>
        </div>

        <DialogHeader className="relative pb-0 z-10">
          {/* Item icon with glow effect */}
          <div className="absolute -top-5 -left-5 p-2.5 rounded-full bg-gray-900/90 border-2 ${getRarityClass(item.rarity || 'common')} ${getAnimationClass()} shadow-lg"
               style={{ boxShadow: `0 0 15px ${getGlowColor()}` }}>
            <span className="text-xl">{getItemTypeIcon(item.type || 'material')}</span>
          </div>
          
          {/* Title with sparkle effect */}
          <div className="relative pt-2 pb-1">
            <DialogTitle className="text-2xl font-bold text-center tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                List {item.name}
              </span>
            </DialogTitle>
            <div className="absolute -right-1 -top-1 flex">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              <Star className="h-4 w-4 text-amber-500 ml-1" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300`}>
              {item.type}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRarityClass(item.rarity || 'common')} bg-opacity-20 ${rarityTextClass}`}>
              {item.rarity || 'common'}
            </span>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 z-10 relative mt-3">
          {/* Quantity Section */}
          <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/60 group">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-gray-700/50 group-hover:bg-gray-700/80 transition-colors">
                <Package className="h-4 w-4 text-gray-300" />
              </div>
              <Label htmlFor="quantity" className="font-semibold text-gray-200 text-sm">Quantity</Label>
              <span className="text-xs text-gray-400 ml-auto bg-gray-800/80 px-2 py-0.5 rounded-full">
                Max: {inventoryQuantity}
              </span>
            </div>
            
            <div className="relative">
              <Input
                id="quantity"
                type="number"
                min={1}
                max={inventoryQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setQuantity(Math.min(val, inventoryQuantity));
                  setError(null);
                }}
                className="bg-gray-900/80 border-gray-700/50 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-base font-medium pl-4 h-10 transition-all"
              />
              <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none">
                <span className="text-xs text-gray-500">units</span>
              </div>
            </div>
          </div>
          
          {/* Pricing Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-center text-base bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 relative">
              <span className="relative z-10">Set Your Price</span>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
            </h3>
            
            {/* Currency Selection Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Gold Price */}
              <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/60 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 to-transparent opacity-50"></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-amber-900/30 group-hover:bg-amber-900/50 transition-colors">
                    <Coins className="h-4 w-4 text-amber-400" />
                  </div>
                  <Label htmlFor="gold-price" className="font-semibold text-amber-200 text-sm">Gold</Label>
                </div>
                
                <div className="relative">
                  <Input
                    id="gold-price"
                    type="number"
                    min={0}
                    value={goldPrice}
                    onChange={(e) => {
                      setGoldPrice(parseInt(e.target.value) || 0);
                      setError(null);
                    }}
                    className="bg-gray-900/80 border-amber-900/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 text-base font-medium pl-3 h-10 transition-all"
                  />
                </div>
              </div>
              
              {/* Gems Price */}
              <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/60 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent opacity-50"></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-blue-900/30 group-hover:bg-blue-900/50 transition-colors">
                    <Diamond className="h-4 w-4 text-blue-400" />
                  </div>
                  <Label htmlFor="gems-price" className="font-semibold text-blue-200 text-sm">Gems</Label>
                </div>
                
                <div className="relative">
                  <Input
                    id="gems-price"
                    type="number"
                    min={0}
                    value={gemsPrice}
                    onChange={(e) => {
                      setGemsPrice(parseInt(e.target.value) || 0);
                      setError(null);
                    }}
                    className="bg-gray-900/80 border-blue-900/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-base font-medium pl-3 h-10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Currency Requirement Toggle - Only show if both currencies have values */}
            {goldPrice > 0 && gemsPrice > 0 && (
              <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${requireBothCurrencies ? 'bg-purple-900/30' : 'bg-gray-700/50'}`}>
                      {requireBothCurrencies ? (
                        <Plus className="h-4 w-4 text-purple-400" />
                      ) : (
                        <div className="flex items-center">
                          <Coins className="h-3 w-3 text-amber-400" />
                          <span className="mx-0.5 text-gray-400 text-xs">/</span>
                          <Diamond className="h-3 w-3 text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="currency-toggle" className="font-semibold text-sm">
                        {requireBothCurrencies ? (
                          <span className="text-purple-200">Require both currencies</span>
                        ) : (
                          <span className="text-gray-200">Accept either currency</span>
                        )}
                      </Label>
                      <p className="text-xs text-gray-400">
                        {requireBothCurrencies 
                          ? "Buyers must pay both gold AND gems" 
                          : "Buyers can pay with either gold OR gems"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="currency-toggle"
                    checked={requireBothCurrencies}
                    onCheckedChange={setRequireBothCurrencies}
                    className={requireBothCurrencies ? "bg-purple-600" : ""}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-2 flex items-center gap-2 animate-pulse">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}
          
          <DialogFooter className="gap-2 pt-1">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="h-10 text-sm font-medium border-gray-700 hover:bg-gray-800 hover:text-white transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className={`h-10 text-sm font-bold relative overflow-hidden group transition-all duration-300 ${getButtonGradient()}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-white/90" />
                  List Item
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 