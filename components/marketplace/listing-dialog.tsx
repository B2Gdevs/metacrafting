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
import { Coins, Diamond, Package, AlertCircle } from "lucide-react";

interface ListingDialogProps {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
  gameItems: Record<string, Item>;
  inventoryQuantity: number;
  listingPrice: number;
  setListingPrice: (price: number) => void;
  listingCurrency: "gold" | "gems";
  setListingCurrency: (currency: "gold" | "gems") => void;
  listingQuantity: number;
  setListingQuantity: (quantity: number) => void;
  useDualCurrency: boolean;
  setUseDualCurrency: (use: boolean) => void;
  dualCurrencyValues: { gold: number; gems: number };
  setDualCurrencyValues: (values: { gold: number; gems: number }) => void;
  onListItem: () => void;
}

export default function ListingDialog({
  open,
  onClose,
  itemId,
  gameItems,
  inventoryQuantity,
  listingPrice,
  setListingPrice,
  listingCurrency,
  setListingCurrency,
  listingQuantity,
  setListingQuantity,
  useDualCurrency,
  setUseDualCurrency,
  dualCurrencyValues,
  setDualCurrencyValues,
  onListItem
}: ListingDialogProps) {
  if (!itemId) return null;
  
  const item = gameItems[itemId];
  if (!item) return null;

  // Local state for validation
  const [error, setError] = useState<string | null>(null);
  const [goldPrice, setGoldPrice] = useState<number>(listingCurrency === "gold" ? listingPrice : dualCurrencyValues.gold);
  const [gemsPrice, setGemsPrice] = useState<number>(listingCurrency === "gems" ? listingPrice : dualCurrencyValues.gems);
  const [quantity, setQuantity] = useState<number>(listingQuantity);
  
  // Update local state when props change
  useEffect(() => {
    setGoldPrice(listingCurrency === "gold" ? listingPrice : dualCurrencyValues.gold);
    setGemsPrice(listingCurrency === "gems" ? listingPrice : dualCurrencyValues.gems);
    setQuantity(listingQuantity);
  }, [listingPrice, listingCurrency, dualCurrencyValues, listingQuantity]);

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
    
    if (goldPrice <= 0 && gemsPrice <= 0) {
      setError("You must set a price in either gold or gems");
      return;
    }
    
    // Update parent state
    setListingQuantity(quantity);
    
    // If both currencies have values, enable dual currency
    if (goldPrice > 0 && gemsPrice > 0) {
      setUseDualCurrency(true);
      setDualCurrencyValues({ gold: goldPrice, gems: gemsPrice });
      // Set the primary currency based on which has a higher relative value
      setListingCurrency(goldPrice > gemsPrice * 10 ? "gold" : "gems");
      setListingPrice(goldPrice > gemsPrice * 10 ? goldPrice : gemsPrice);
    } else {
      // Single currency mode
      setUseDualCurrency(false);
      if (goldPrice > 0) {
        setListingCurrency("gold");
        setListingPrice(goldPrice);
      } else {
        setListingCurrency("gems");
        setListingPrice(gemsPrice);
      }
    }
    
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
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={`border-2 ${getRarityClass(item.rarity || 'common')} max-w-md w-full`}
      >
        <DialogHeader className="relative pb-2">
          <div className={`absolute -top-6 -left-6 p-3 rounded-full bg-gray-900 border-2 ${getRarityClass(item.rarity || 'common')} ${getAnimationClass()}`}>
            <span className="text-2xl">{getItemTypeIcon(item.type || 'material')}</span>
          </div>
          
          <DialogTitle className="text-2xl font-bold pt-4 text-center">
            List Item for Sale
          </DialogTitle>
          
          <div className="mt-2 flex flex-col items-center">
            <h3 className={`text-xl font-bold ${rarityTextClass}`}>
              {item.name}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {item.type} • {item.rarity || 'common'}
            </p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quantity Section */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-gray-400" />
              <Label htmlFor="quantity" className="font-semibold">Quantity</Label>
              <span className="text-xs text-gray-400 ml-auto">(Max: {inventoryQuantity})</span>
            </div>
            
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
              className="bg-gray-900 border-gray-700"
            />
          </div>
          
          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-center">Set Your Price</h3>
            
            {/* Gold Price */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <Label htmlFor="gold-price" className="font-semibold">Gold Price</Label>
              </div>
              
              <Input
                id="gold-price"
                type="number"
                min={0}
                value={goldPrice}
                onChange={(e) => {
                  setGoldPrice(parseInt(e.target.value) || 0);
                  setError(null);
                }}
                className="bg-gray-900 border-gray-700"
              />
            </div>
            
            {/* Gems Price */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Diamond className="h-5 w-5 text-blue-500" />
                <Label htmlFor="gems-price" className="font-semibold">Gems Price</Label>
              </div>
              
              <Input
                id="gems-price"
                type="number"
                min={0}
                value={gemsPrice}
                onChange={(e) => {
                  setGemsPrice(parseInt(e.target.value) || 0);
                  setError(null);
                }}
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          
          <DialogFooter className="gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className={`w-full ${rarityButtonClass}`}
            >
              List Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 