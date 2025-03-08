"use client"

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Coins, Diamond } from "lucide-react";
import { Item } from "@/components/item-slot";
import { CurrencyType, CurrencyValues, PlayerMarketItem } from "@/lib/marketplace-types";
import { getRarityTextClass, getRarityButtonClass } from "@/lib/marketplace-utils";

// Define form schema with Zod
const listingSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  goldPrice: z.number().min(0, "Gold price cannot be negative"),
  gemsPrice: z.number().min(0, "Gems price cannot be negative"),
  requireBothCurrencies: z.boolean().default(false)
}).refine(data => data.goldPrice > 0 || data.gemsPrice > 0, {
  message: "You must set a price in either gold or gems",
  path: ["goldPrice"]
});

type ListingFormValues = z.infer<typeof listingSchema>;

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
  // If no draft listing, don't render
  if (!draftListing) return null;
  
  // Get the item details
  const item = draftListing.originalItem || gameItems[draftListing.id];
  if (!item) return null;
  
  // Setup form with React Hook Form
  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      quantity: draftListing.quantity || 1,
      goldPrice: draftListing.currencies[CurrencyType.GOLD] || 0,
      gemsPrice: draftListing.currencies[CurrencyType.GEMS] || 0,
      requireBothCurrencies: draftListing.requireAllCurrencies || false
    }
  });
  
  // Reset form when draft listing changes
  useEffect(() => {
    if (draftListing) {
      reset({
        quantity: draftListing.quantity || 1,
        goldPrice: draftListing.currencies[CurrencyType.GOLD] || 0,
        gemsPrice: draftListing.currencies[CurrencyType.GEMS] || 0,
        requireBothCurrencies: draftListing.requireAllCurrencies || false
      });
    }
  }, [draftListing, reset]);
  
  // Watch form values for UI updates
  const requireBothCurrencies = watch("requireBothCurrencies");
  
  // Form submission handler
  const onSubmit = (data: ListingFormValues) => {
    // Build the currencies object with only positive values
    const currencies: Partial<CurrencyValues> = {
      [CurrencyType.GOLD]: data.goldPrice > 0 ? data.goldPrice : 0,
      [CurrencyType.GEMS]: data.gemsPrice > 0 ? data.gemsPrice : 0
    };
    
    // Update the draft listing
    updateDraftListing({
      quantity: data.quantity,
      requireAllCurrencies: data.requireBothCurrencies,
      currencies
    });
    
    // List the item
    onListItem();
    onClose();
  };
  
  // Get rarity-specific styles
  const rarityTextClass = getRarityTextClass(item.rarity || 'common');
  const rarityButtonClass = getRarityButtonClass(item.rarity || 'common');
  
  // Get rarity-specific background style
  const getRarityBackgroundStyle = () => {
    switch (item.rarity) {
      case "uncommon": return "bg-gradient-to-br from-gray-900 via-gray-900 to-green-950/30";
      case "rare": return "bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950/30";
      case "epic": return "bg-gradient-to-br from-gray-900 via-gray-900 to-purple-950/30";
      case "legendary": return "bg-gradient-to-br from-gray-900 via-gray-900 to-amber-950/30";
      case "mythic": return "bg-gradient-to-br from-gray-900 via-gray-900 to-red-950/30";
      default: return "bg-gradient-to-br from-gray-900 to-gray-950";
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${getRarityBackgroundStyle()}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold ${rarityTextClass}`}>
            List {item.name} for Sale
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Item Info */}
          <div className="flex items-center space-x-4">
            {item.image && (
              <div className="w-16 h-16 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <h3 className={`text-lg font-bold ${rarityTextClass}`}>{item.name}</h3>
              <p className="text-sm text-gray-400">Available: {inventoryQuantity}</p>
            </div>
          </div>
          
          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={inventoryQuantity}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                  className="bg-gray-800 border-gray-700"
                />
              )}
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>
          
          {/* Gold Price */}
          <div className="space-y-2">
            <Label htmlFor="goldPrice" className="flex items-center">
              <Coins className="h-4 w-4 mr-2 text-amber-500" />
              Gold Price
            </Label>
            <Controller
              name="goldPrice"
              control={control}
              render={({ field }) => (
                <Input
                  id="goldPrice"
                  type="number"
                  min={0}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-700"
                />
              )}
            />
            {errors.goldPrice && (
              <p className="text-sm text-red-500">{errors.goldPrice.message}</p>
            )}
          </div>
          
          {/* Gems Price */}
          <div className="space-y-2">
            <Label htmlFor="gemsPrice" className="flex items-center">
              <Diamond className="h-4 w-4 mr-2 text-blue-500" />
              Gems Price
            </Label>
            <Controller
              name="gemsPrice"
              control={control}
              render={({ field }) => (
                <Input
                  id="gemsPrice"
                  type="number"
                  min={0}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-700"
                />
              )}
            />
            {errors.gemsPrice && (
              <p className="text-sm text-red-500">{errors.gemsPrice.message}</p>
            )}
          </div>
          
          {/* Require Both Currencies */}
          <div className="flex items-center justify-between">
            <Label htmlFor="requireBothCurrencies" className="cursor-pointer">
              Require both currencies
            </Label>
            <Controller
              name="requireBothCurrencies"
              control={control}
              render={({ field }) => (
                <Switch
                  id="requireBothCurrencies"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          
          {/* Currency Requirement Explanation */}
          <div className="text-sm text-gray-400 italic">
            {requireBothCurrencies
              ? "Buyers will need to pay both gold and gems"
              : "Buyers can pay with either gold or gems"
            }
          </div>
          
          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              className={rarityButtonClass}
            >
              List Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 