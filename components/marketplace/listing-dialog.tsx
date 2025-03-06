"use client"

import { Item } from "@/components/item-slot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRarityClass } from "@/lib/marketplace-utils";

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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onListItem();
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`border-2 ${getRarityClass(item.rarity || 'common')}`}>
        <DialogHeader>
          <DialogTitle>List Item for Sale</DialogTitle>
          <DialogDescription>
            You are listing {item.name} for sale on the player marketplace.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (Max: {inventoryQuantity})</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={inventoryQuantity}
              value={listingQuantity}
              onChange={(e) => setListingQuantity(Math.min(parseInt(e.target.value) || 1, inventoryQuantity))}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Currency Type</Label>
            <RadioGroup 
              value={listingCurrency} 
              onValueChange={(value) => setListingCurrency(value as "gold" | "gems")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gold" id="gold" />
                <Label htmlFor="gold">Gold</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gems" id="gems" />
                <Label htmlFor="gems">Gems</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price ({listingCurrency})</Label>
            <Input
              id="price"
              type="number"
              min={1}
              value={listingPrice}
              onChange={(e) => setListingPrice(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dual-currency"
                checked={useDualCurrency}
                onCheckedChange={(checked) => setUseDualCurrency(!!checked)}
              />
              <Label htmlFor="dual-currency">Allow dual currency payment</Label>
            </div>
            
            {useDualCurrency && (
              <div className="space-y-2 pl-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="gold-price">Gold Price</Label>
                  <Input
                    id="gold-price"
                    type="number"
                    min={0}
                    value={dualCurrencyValues.gold}
                    onChange={(e) => setDualCurrencyValues({
                      ...dualCurrencyValues,
                      gold: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gems-price">Gems Price</Label>
                  <Input
                    id="gems-price"
                    type="number"
                    min={0}
                    value={dualCurrencyValues.gems}
                    onChange={(e) => setDualCurrencyValues({
                      ...dualCurrencyValues,
                      gems: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              List Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 